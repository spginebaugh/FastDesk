import { z } from 'zod'
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import type { ParsedPrompt, GenerationContext } from '../../types'
import { chatModel } from '@/config/openai/client'
import { langsmithClient, LANGSMITH_PROJECT, ENABLE_TRACING } from '@/config/langsmith/client'
import { LangChainTracer } from 'langchain/callbacks'

const outputSchema = z.object({
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  explanation: z.string(),
})

const parser = StructuredOutputParser.fromZodSchema(outputSchema)

const generatePromptTemplate = (parsedPrompt: ParsedPrompt) => {
  const systemTemplate = 'You are a helpful assistant that generates user notes and tags based on context.'
  
  let humanTemplate: string
  if (parsedPrompt.targetType === 'tags') {
    humanTemplate = `
      Generate tags for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing tags' : 'Create new tags'}
      
      User Information:
      Name: {userName}
      Email: {userEmail}
      Company: {userCompany}
      
      Current Notes (DO NOT MODIFY): {existingNotes}
      Current Tags (TO BE UPDATED): {existingTags}
      
      User's Ticket Messages:
      {ticketMessages}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate tags that categorize this user. DO NOT modify the existing notes.
      Take into account the existing notes, ticket messages, and current tags when generating new tags.
    `
  } else if (parsedPrompt.targetType === 'notes') {
    humanTemplate = `
      Generate notes for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing notes' : 'Create new notes'}
      
      User Information:
      Name: {userName}
      Email: {userEmail}
      Company: {userCompany}
      
      Current Notes (TO BE UPDATED): {existingNotes}
      Current Tags (DO NOT MODIFY): {existingTags}
      
      User's Ticket Messages:
      {ticketMessages}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate notes about this user. DO NOT modify the existing tags.
      Take into account the existing notes, ticket messages, and current tags when generating new notes.
    `
  } else {
    humanTemplate = `
      Generate both notes and tags for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing content' : 'Create new content'}
      
      User Information:
      Name: {userName}
      Email: {userEmail}
      Company: {userCompany}
      
      Current Notes (TO BE UPDATED): {existingNotes}
      Current Tags (TO BE UPDATED): {existingTags}
      
      User's Ticket Messages:
      {ticketMessages}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate notes and tags for this user.
      Take into account the existing notes, ticket messages, and current tags when generating new content.
    `
  }

  return ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemTemplate),
    HumanMessagePromptTemplate.fromTemplate(humanTemplate)
  ])
}

const model = chatModel

interface GeneratorChainInput {
  parsedPrompt: ParsedPrompt
  context: GenerationContext
}

const formatTag = (tag: string): string => {
  // Convert spaces to hyphens and remove any other invalid characters
  return tag
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
}

export const createGeneratorChain = () => {
  const formatInstructions = parser.getFormatInstructions()

  // Initialize LangSmith tracer
  const tracer = ENABLE_TRACING ? new LangChainTracer({
    projectName: LANGSMITH_PROJECT,
    client: langsmithClient,
  }) : undefined

  return {
    invoke: async (input: GeneratorChainInput) => {
      console.log('[GeneratorChain] Creating prompt template for input:', input)
      const template = generatePromptTemplate(input.parsedPrompt)
      
      // Ensure notes are properly formatted for display
      const existingNotes = input.context.notes.existingNotes
      console.log('[GeneratorChain] Raw existing notes:', existingNotes)
      
      const formattedNotes = existingNotes && existingNotes.trim() !== '' 
        ? existingNotes 
        : 'No existing notes'
      
      console.log('[GeneratorChain] Formatted notes:', formattedNotes)

      // Format ticket messages
      const ticketMessages = input.context.notes.ticketMessages
      console.log('[GeneratorChain] Raw ticket messages:', ticketMessages)
      
      const formattedMessages = ticketMessages && ticketMessages.trim() !== ''
        ? ticketMessages
        : 'No ticket messages found'
      
      console.log('[GeneratorChain] Formatted ticket messages:', formattedMessages)
      
      const variables = {
        userName: input.context.user.fullName || 'Unknown',
        userEmail: input.context.user.email || 'No Email',
        userCompany: input.context.user.company || 'No Company',
        existingNotes: formattedNotes,
        existingTags: input.context.notes.existingTags?.map(tag => tag.name).join(', ') || 'No existing tags',
        ticketMessages: formattedMessages,
        originalPrompt: input.parsedPrompt.originalPrompt,
        formatInstructions
      }

      console.log('[GeneratorChain] Variables prepared:', variables)
      
      const messages = await template.invoke(variables, {
        callbacks: tracer ? [tracer] : undefined,
        runName: 'AI Notes Generator',
        tags: ['ai-notes', 'generator-chain']
      })
      console.log('[GeneratorChain] Messages generated:', messages)
      
      const modelOutput = await model.invoke(messages, {
        callbacks: tracer ? [tracer] : undefined,
        runName: 'AI Notes Model',
        tags: ['ai-notes', 'llm-call']
      })
      console.log('[GeneratorChain] Model output:', modelOutput)
      
      const parsed = await parser.invoke(modelOutput, {
        callbacks: tracer ? [tracer] : undefined,
        runName: 'AI Notes Parser',
        tags: ['ai-notes', 'output-parser']
      })
      console.log('[GeneratorChain] Parsed output:', parsed)
      
      const result = {
        notes: parsed.notes || '',
        tags: (parsed.tags || []).map(formatTag).filter(Boolean),
        explanation: parsed.explanation,
      }
      
      console.log('[GeneratorChain] Final result:', result)
      return result
    }
  }
}

export type GeneratorChain = ReturnType<typeof createGeneratorChain> 