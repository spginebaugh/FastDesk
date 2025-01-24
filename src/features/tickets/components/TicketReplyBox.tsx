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
import { cn } from '@/lib/utils'

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
    <form onSubmit={handleSubmit} className="border-t border-border/50 bg-background-alt p-4">
      <div className="space-y-4">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your reply..."
          className={cn(
            "min-h-[100px] bg-background border-border/50 text-foreground",
            "placeholder:text-muted-foreground",
            "focus-visible:ring-primary"
          )}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={(value: 'public' | 'internal') => setIsInternal(value === 'internal')}
              defaultValue="public"
            >
              <SelectTrigger 
                className={cn(
                  "w-[140px] bg-background border-border/50",
                  "text-foreground hover:bg-primary/10",
                  "focus:ring-primary"
                )}
              >
                <SelectValue placeholder="Select reply type" />
              </SelectTrigger>
              <SelectContent className="bg-background-raised border-border/50">
                <SelectItem 
                  value="public"
                  className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  Public reply
                </SelectItem>
                <SelectItem 
                  value="internal"
                  className="text-foreground hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
                >
                  Internal note
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            disabled={isPending || !content.trim()}
            className={cn(
              "bg-primary hover:bg-primary/90",
              "transition-colors duration-200",
              (isPending || !content.trim()) && "opacity-50"
            )}
          >
            {isPending ? 'Sending...' : 'Send Reply'}
          </Button>
        </div>
      </div>
    </form>
  )
} 