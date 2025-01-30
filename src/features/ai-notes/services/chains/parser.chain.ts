import { z } from 'zod'
import { PromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { RunnableSequence } from '@langchain/core/runnables'
import { StructuredOutputParser } from 'langchain/output_parsers'
import type { ParsedPrompt } from '../../types'

const outputSchema = z.object({
  targetType: z.enum(['tags', 'notes', 'both']),
  action: z.enum(['update', 'recreate']),
  reasoning: z.string(),
})

type ParserOutput = z.infer<typeof outputSchema>

const parser = StructuredOutputParser.fromZodSchema(outputSchema)

const prompt = PromptTemplate.fromTemplate(`
Given the following user prompt for AI note generation, analyze what the user wants to do.
Determine if they want to:
1. Update or generate tags
2. Update or generate notes
3. Both tags and notes

Also determine if they want to:
A. Update existing content
B. Recreate from scratch

User Prompt: {input}

{format_instructions}

Provide your analysis in the requested JSON format with a brief reasoning.
`)

const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo-preview',
  temperature: 0,
})

export const createParserChain = () => {
  return RunnableSequence.from([
    {
      input: (input: string) => input,
      format_instructions: parser.getFormatInstructions(),
    },
    prompt,
    model,
    parser,
    // Transform the output into our internal ParsedPrompt type
    (output: ParserOutput, runInput: { input: string }): ParsedPrompt => ({
      targetType: output.targetType,
      action: output.action,
      originalPrompt: runInput.input,
    }),
  ])
}

export type ParserChain = ReturnType<typeof createParserChain> 
