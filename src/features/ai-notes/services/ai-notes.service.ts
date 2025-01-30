import { createParserChain } from './chains/parser.chain'
import { createInfoGathererChain } from './chains/info-gatherer.chain'
import { createGeneratorChain } from './chains/generator.chain'
import type { AINotesResult, GeneratedContent } from '../types'

interface GenerateAINotesParams {
  prompt: string
  userId: string
  organizationId: string
}

const MAX_NOTE_LENGTH = 5000 // 5000 characters
const MAX_TAGS = 10
const MAX_TAG_LENGTH = 30
const TAG_REGEX = /^[a-zA-Z0-9-_]+$/

export function validateGeneratedContent(content: GeneratedContent): { isValid: boolean; error?: string } {
  // Validate notes if present
  if (content.notes) {
    if (content.notes.length > MAX_NOTE_LENGTH) {
      return {
        isValid: false,
        error: `Notes exceed maximum length of ${MAX_NOTE_LENGTH} characters`,
      }
    }
  }

  // Validate tags if present
  if (content.tags) {
    if (content.tags.length > MAX_TAGS) {
      return {
        isValid: false,
        error: `Number of tags exceeds maximum of ${MAX_TAGS}`,
      }
    }

    for (const tag of content.tags) {
      if (tag.length > MAX_TAG_LENGTH) {
        return {
          isValid: false,
          error: `Tag "${tag}" exceeds maximum length of ${MAX_TAG_LENGTH} characters`,
        }
      }

      if (!TAG_REGEX.test(tag)) {
        return {
          isValid: false,
          error: `Tag "${tag}" contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed.`,
        }
      }
    }
  }

  // Validate that explanation is present
  if (!content.explanation || content.explanation.trim().length === 0) {
    return {
      isValid: false,
      error: 'Explanation is required',
    }
  }

  return { isValid: true }
}

export async function generateAINotes({
  prompt,
  userId,
  organizationId,
}: GenerateAINotesParams): Promise<AINotesResult> {
  try {
    // Create all the chains
    const parserChain = createParserChain()
    const infoGathererChain = createInfoGathererChain()
    const generatorChain = createGeneratorChain()

    // Parse the prompt
    const parsedPrompt = await parserChain.invoke(prompt)

    // Gather context
    const context = await infoGathererChain.invoke({
      userId,
      organizationId,
    })

    // Generate content
    const generatedContent = await generatorChain.invoke({
      parsedPrompt,
      context,
    })

    // Validate the generated content
    const validation = validateGeneratedContent(generatedContent)
    if (!validation.isValid) {
      return {
        success: false,
        error: {
          message: validation.error || 'Invalid generated content',
          code: 'GENERATION_ERROR',
          details: validation,
        },
      }
    }

    return {
      success: true,
      data: generatedContent,
    }
  } catch (error) {
    console.error('Error generating AI notes:', error)
    return {
      success: false,
      error: {
        message: 'Failed to generate AI notes',
        code: 'GENERATION_ERROR',
        details: error,
      },
    }
  }
} 