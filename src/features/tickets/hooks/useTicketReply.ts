import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { ticketService } from '../services/ticketService'
import { openAIService } from '@/services/openai-service'
import { TicketMessage } from '../types'
import { type TiptapContent } from '@/lib/tiptap'
import { type Json } from '@/types/database'

interface UseTicketReplyOptions {
  ticketId: string
  ticketTitle: string
  ticketContent: Json
  originalSenderFullName: string
  currentWorkerFullName?: string
  previousMessages: Array<{
    content: Json
    role: 'user' | 'worker'
    senderFullName: string
  }>
  initialContent?: TiptapContent
  onSetContent?: (content: TiptapContent) => void
}

interface CreateMessageParams {
  ticketId: string
  content: TiptapContent
  isInternal: boolean
}

const emptyTiptapContent: TiptapContent = {
  type: 'doc',
  content: []
}

export function useTicketReply({
  ticketId,
  ticketTitle,
  ticketContent,
  originalSenderFullName,
  currentWorkerFullName,
  previousMessages,
  initialContent,
  onSetContent
}: UseTicketReplyOptions) {
  const [content, setContent] = useState<TiptapContent>(initialContent || emptyTiptapContent)
  const [isInternal, setIsInternal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Update content when initialContent changes
  useEffect(() => {
    if (initialContent !== undefined) {
      setContent(initialContent)
    }
  }, [initialContent])

  // Notify parent of content changes
  useEffect(() => {
    onSetContent?.(content)
  }, [content, onSetContent])

  const { mutate: sendReply, isPending: mutationPending } = useMutation<TicketMessage, Error, CreateMessageParams>({
    mutationFn: (params) => ticketService.createTicketMessage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      setContent(emptyTiptapContent)
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.',
        duration: 1000 // 1 second in milliseconds
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to send reply. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!content.content.length) return
    sendReply({ ticketId, content, isInternal })
  }

  const handleGenerateResponse = async () => {
    try {
      setIsGenerating(true)
      const generatedResponse = await openAIService.generateTicketResponse({
        ticketTitle,
        originalSenderFullName,
        currentWorkerFullName,
        ticketContent,
        previousMessages
      })
      setContent(generatedResponse)
      toast({
        title: 'Response Generated',
        description: 'AI response has been generated. Feel free to edit before sending.'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate AI response. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReplyTypeChange = (value: 'public' | 'internal') => {
    setIsInternal(value === 'internal')
  }

  const handleContentChange = (newContent: TiptapContent) => {
    setContent(newContent)
  }

  return {
    content,
    isInternal,
    isGenerating,
    isPending: mutationPending,
    handleSubmit,
    handleContentChange,
    handleReplyTypeChange,
    handleGenerateResponse,
    setContent
  }
} 