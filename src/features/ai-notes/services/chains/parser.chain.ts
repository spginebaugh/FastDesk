import { z } from 'zod'
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { parserModel } from '@/config/openai/client'

interface ParserChainInput {
  originalPrompt: string
}

const outputSchema = z.object({
  targetType: z.enum(['tags', 'notes', 'both']),
  action: z.enum(['update', 'recreate']),
  reasoning: z.string(),
})


const parser = StructuredOutputParser.fromZodSchema(outputSchema)

const model = parserModel

export const createParserChain = () => {
  const formatInstructions = parser.getFormatInstructions()
  
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(
      'You are a helpful assistant that analyzes user prompts to determine their intent regarding notes and tags.'
    ),
    HumanMessagePromptTemplate.fromTemplate(
      `Given the following user prompt, determine if they want to update/recreate their tags, notes, or both.
Original prompt: {originalPrompt}

{format_instructions}`
    )
  ])

  return {
    invoke: async (input: ParserChainInput) => {
      const messages = await prompt.invoke({
        originalPrompt: input.originalPrompt,
        format_instructions: formatInstructions
      })
      
      const modelOutput = await model.invoke(messages)
      const parsed = await parser.invoke(modelOutput)
      
      return {
        targetType: parsed.targetType,
        action: parsed.action,
        originalPrompt: input.originalPrompt,
        reasoning: parsed.reasoning,
      }
    }
  }
}

export type ParserChain = ReturnType<typeof createParserChain> 
