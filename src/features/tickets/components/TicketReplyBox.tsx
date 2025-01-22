import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

  return (
    <form onSubmit={handleSubmit} className="border-t bg-white p-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your reply..."
          className="min-h-[100px] text-black"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={(value: 'public' | 'internal') => setIsInternal(value === 'internal')}
              defaultValue="public"
            >
              <SelectTrigger className="w-[140px] text-black">
                <SelectValue placeholder="Select reply type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public reply</SelectItem>
                <SelectItem value="internal">Internal note</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isPending || !content.trim()}>
            {isPending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
} 