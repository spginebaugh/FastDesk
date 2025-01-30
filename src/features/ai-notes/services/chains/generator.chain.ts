import { z } from 'zod'
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StructuredOutputParser } from 'langchain/output_parsers'
import type { ParsedPrompt, GenerationContext, GeneratedContent } from '../../types'
import { chatModel } from '@/config/openai/client'

const outputSchema = z.object({
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  explanation: z.string(),
})

type GeneratorOutput = z.infer<typeof outputSchema>

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
      
      Existing Tags: {existingTags}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate tags that categorize this user.
    `
  } else if (parsedPrompt.targetType === 'notes') {
    humanTemplate = `
      Generate notes for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing notes' : 'Create new notes'}
      
      User Information:
      Name: {userName}
      Email: {userEmail}
      Company: {userCompany}
      
      Existing Notes: {existingNotes}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate notes about this user.
    `
  } else {
    humanTemplate = `
      Generate both notes and tags for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing content' : 'Create new content'}
      
      User Information:
      Name: {userName}
      Email: {userEmail}
      Company: {userCompany}
      
      Existing Notes: {existingNotes}
      Existing Tags: {existingTags}
      
      Original Prompt: {originalPrompt}
      
      {formatInstructions}
      
      Generate appropriate notes and tags for this user.
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

  return {
    invoke: async (input: GeneratorChainInput) => {
      console.log('[GeneratorChain] Creating prompt template for input:', input)
      const template = generatePromptTemplate(input.parsedPrompt)
      
      const variables = {
        userName: input.context.user.fullName || 'Unknown',
        userEmail: input.context.user.email || 'No Email',
        userCompany: input.context.user.company || 'No Company',
        existingNotes: input.context.notes.existingNotes || 'No existing notes',
        existingTags: input.context.notes.existingTags?.join(', ') || 'No existing tags',
        originalPrompt: input.parsedPrompt.originalPrompt,
        formatInstructions
      }

      console.log('[GeneratorChain] Variables prepared:', variables)
      
      const messages = await template.invoke(variables)
      console.log('[GeneratorChain] Messages generated:', messages)
      
      const modelOutput = await model.invoke(messages)
      console.log('[GeneratorChain] Model output:', modelOutput)
      
      const parsed = await parser.invoke(modelOutput)
      console.log('[GeneratorChain] Parsed output:', parsed)
      
      const result = {
        notes: parsed.notes || '',
        tags: (parsed.tags || []).map(formatTag).filter(Boolean), // Format tags and remove any empty strings
        explanation: parsed.explanation,
      }
      
      console.log('[GeneratorChain] Final result:', result)
      return result
    }
  }
}

export type GeneratorChain = ReturnType<typeof createGeneratorChain> 