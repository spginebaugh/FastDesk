import { useState } from 'react'
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
  previousMessages
}: UseTicketReplyOptions) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { mutate: sendReply, isPending } = useMutation<TicketMessage, Error, CreateMessageParams>({
    mutationFn: (params) => ticketService.createTicketMessage(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
      setContent('')
      toast({
        title: 'Reply sent',
        description: 'Your reply has been sent successfully.'
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
    isPending,
    handleSubmit,
    handleContentChange,
    handleReplyTypeChange,
    handleGenerateResponse
  }
} 