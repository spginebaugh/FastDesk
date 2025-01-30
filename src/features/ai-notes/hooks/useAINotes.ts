import { useState } from 'react'
import { generateAINotes } from '../services/ai-notes.service'
import type { AINotesResult } from '../types'

interface UseAINotesParams {
  userId: string
  organizationId: string
  onSuccess?: (result: AINotesResult & { success: true }) => void
  onError?: (error: AINotesResult & { success: false }) => void
}

export function useAINotes({
  userId,
  organizationId,
  onSuccess,
  onError,
}: UseAINotesParams) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<AINotesResult | null>(null)

  const generate = async (prompt: string) => {
    try {
      setIsGenerating(true)
      const result = await generateAINotes({
        prompt,
        userId,
        organizationId,
      })

      setResult(result)

      if (result.success && onSuccess) {
        onSuccess(result)
      } else if (!result.success && onError) {
        onError(result)
      }

      return result
    } catch (error) {
      const errorResult: AINotesResult = {
        success: false,
        error: {
          message: 'Unexpected error generating AI notes',
          code: 'GENERATION_ERROR',
          details: error,
        },
      }
      setResult(errorResult)
      onError?.(errorResult)
      return errorResult
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generate,
    isGenerating,
    result,
  }
} 