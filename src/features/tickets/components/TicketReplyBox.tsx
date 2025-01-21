import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { ticketService } from '../services/ticketService'
import { useToast } from '@/components/ui/use-toast'
import { TicketMessage } from '../types'

interface TicketReplyBoxProps {
  ticketId: string
}

interface CreateMessageParams {
  ticketId: string
  content: string
  isInternal: boolean
}

export function TicketReplyBox({ ticketId }: TicketReplyBoxProps) {
  const [content, setContent] = useState('')
  const [isInternal, setIsInternal] = useState(false)
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
    onError: (error) => {
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

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your reply..."
          className="min-h-[100px]"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="internal"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked as boolean)}
            />
            <label
              htmlFor="internal"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Internal note
            </label>
          </div>
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
} 