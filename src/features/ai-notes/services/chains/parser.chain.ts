import { z } from 'zod'
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from 'langchain/output_parsers'
import { openAIClient } from '@/config/api/openai'
import { langsmithClient, LANGSMITH_PROJECT, ENABLE_TRACING } from '@/config/langsmith/client'
import { LangChainTracer } from 'langchain/callbacks'

interface ParserChainInput {
  originalPrompt: string
}

const outputSchema = z.object({
  targetType: z.enum(['tags', 'notes', 'both']),
  action: z.enum(['update', 'recreate']),
  reasoning: z.string(),
})

const parser = StructuredOutputParser.fromZodSchema(outputSchema)

export const createParserChain = () => {
  const formatInstructions = parser.getFormatInstructions()
  
  // Initialize LangSmith tracer
  const tracer = ENABLE_TRACING ? new LangChainTracer({
    projectName: LANGSMITH_PROJECT,
    client: langsmithClient,
  }) : undefined

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
      const promptMessages = await prompt.invoke({
        originalPrompt: input.originalPrompt,
        format_instructions: formatInstructions
      }, {
        callbacks: tracer ? [tracer] : undefined,
        runName: 'AI Notes Parser Prompt',
        tags: ['ai-notes', 'parser-chain']
      })
      
      // Convert LangChain messages to API format
      const apiMessages = promptMessages.messages.map(msg => {
        const type = msg._getType();
        const role = type === 'system' ? 'system' as const : 'user' as const;
        return {
          role,
          content: msg.content.toString()
        }
      });
      
      // Call OpenAI through the API client
      const modelOutput = await openAIClient.chat({ 
        messages: apiMessages,
        temperature: 0 // Use zero temperature for parsing
      })

      const parsed = await parser.invoke(modelOutput.content, {
        callbacks: tracer ? [tracer] : undefined,
        runName: 'AI Notes Parser Output',
        tags: ['ai-notes', 'output-parser']
      })
      
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
