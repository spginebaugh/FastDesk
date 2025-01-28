import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { ticketService } from '../services/ticketService'
import { openAIService } from '@/services/openai-service'
import { TicketMessage } from '../types'

interface UseTicketReplyOptions {
  ticketId: string
  ticketTitle: string
  ticketContent: string
  originalSenderFullName: string
  currentWorkerFullName?: string
  previousMessages: Array<{
    content: string
    role: 'user' | 'worker'
    senderFullName: string
  }>
  initialContent?: string
  onSetContent?: (content: string) => void
}

interface CreateMessageParams {
  ticketId: string
  content: string
  isInternal: boolean
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
  const [content, setContent] = useState(initialContent || '')
  const [isInternal, setIsInternal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPending, setIsPending] = useState(false)
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
      setContent('')
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
    if (!content.trim()) return
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
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