import { z } from 'zod'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { RunnableSequence } from '@langchain/core/runnables'
import { StructuredOutputParser } from 'langchain/output_parsers'
import type { ParsedPrompt, GenerationContext, GeneratedContent } from '../../types'

const outputSchema = z.object({
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  explanation: z.string(),
})

type GeneratorOutput = z.infer<typeof outputSchema>

const parser = StructuredOutputParser.fromZodSchema(outputSchema)

const generatePromptTemplate = (parsedPrompt: ParsedPrompt) => {
  if (parsedPrompt.targetType === 'tags') {
    return PromptTemplate.fromTemplate(`
      Generate tags for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing tags' : 'Create new tags'}
      
      User Information:
      Name: {user_name}
      Email: {user_email}
      Company: {user_company}
      
      Existing Tags: {existing_tags}
      
      Original Prompt: {original_prompt}
      
      {format_instructions}
      
      Generate appropriate tags that categorize this user.
    `)
  }
  
  if (parsedPrompt.targetType === 'notes') {
    return PromptTemplate.fromTemplate(`
      Generate notes for a user based on the following context.
      Action: ${parsedPrompt.action === 'update' ? 'Update existing notes' : 'Create new notes'}
      
      User Information:
      Name: {user_name}
      Email: {user_email}
      Company: {user_company}
      
      Existing Notes: {existing_notes}
      
      Original Prompt: {original_prompt}
      
      {format_instructions}
      
      Generate appropriate notes about this user.
    `)
  }
  
  return PromptTemplate.fromTemplate(`
    Generate both notes and tags for a user based on the following context.
    Action: ${parsedPrompt.action === 'update' ? 'Update existing content' : 'Create new content'}
    
    User Information:
    Name: {user_name}
    Email: {user_email}
    Company: {user_company}
    
    Existing Notes: {existing_notes}
    Existing Tags: {existing_tags}
    
    Original Prompt: {original_prompt}
    
    {format_instructions}
    
    Generate appropriate notes and tags for this user.
  `)
}

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0.7,
})

interface GeneratorChainInput {
  parsedPrompt: ParsedPrompt
  context: GenerationContext
}

export const createGeneratorChain = () => {
  return RunnableSequence.from([
    {
      promptTemplate: (input: GeneratorChainInput) => generatePromptTemplate(input.parsedPrompt),
      format_instructions: parser.getFormatInstructions(),
      user_name: (input: GeneratorChainInput) => input.context.user.fullName || 'Unknown',
      user_email: (input: GeneratorChainInput) => input.context.user.email,
      user_company: (input: GeneratorChainInput) => input.context.user.company || 'Unknown',
      existing_notes: (input: GeneratorChainInput) => input.context.notes.existingNotes || '',
      existing_tags: (input: GeneratorChainInput) => input.context.notes.existingTags?.join(', ') || '',
      original_prompt: (input: GeneratorChainInput) => input.parsedPrompt.originalPrompt,
    },
    (input) => input.promptTemplate,
    model,
    parser,
    (output: GeneratorOutput): GeneratedContent => ({
      notes: output.notes,
      tags: output.tags,
      explanation: output.explanation,
    }),
  ])
}

export type GeneratorChain = ReturnType<typeof createGeneratorChain> 