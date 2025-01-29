import { useState } from 'react'
import { responseGenerationService } from '@/features/ai-bot/services'
import { type Message } from '@/features/ai-bot/types'
import { useToast } from '@/components/ui/use-toast'
import { type TiptapContent, createTiptapContent } from '@/lib/tiptap'

interface UseAINotesOptions {
  ticketTitle: string
  originalSenderFullName: string
  currentWorkerFullName?: string
  ticketContent: any
  previousMessages: Message[]
  onUpdateNotes: (updateFn: () => void, hasChanges: boolean) => void
}

export function useAINotes({
  ticketTitle,
  originalSenderFullName,
  currentWorkerFullName,
  ticketContent,
  previousMessages,
  onUpdateNotes
}: UseAINotesOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateNotes = async (prompt: string) => {
    if (!previousMessages.length) return

    try {
      setIsGenerating(true)
      const response = await responseGenerationService.generateNotes({
        ticketTitle,
        originalSenderFullName,
        currentWorkerFullName,
        ticketContent,
        previousMessages,
        prompt
      })

      // Update the notes using the provided callback
      onUpdateNotes(
        () => {
          // The response is already in TiptapContent format from the service
          return response
        },
        true
      )

      toast({
        title: 'Notes Generated',
        description: 'AI has analyzed the conversation and updated the notes.'
      })
    } catch (error) {
      console.error('Failed to generate AI notes:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate AI notes. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isGenerating,
    handleGenerateNotes
  }
} 