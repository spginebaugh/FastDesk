import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ticketService } from '../services/ticketService'

export function NewTicketPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const navigate = useNavigate()
  const { toast } = useToast()

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async () => {
      const ticket = await ticketService.createTicket({ title })
      await ticketService.createTicketMessage({
        ticketId: ticket.id,
        content,
        isInternal: false
      })
      return ticket
    },
    onSuccess: (ticket) => {
      toast({
        title: 'Ticket created',
        description: 'Your ticket has been created successfully.'
      })
      navigate(`/tickets/${ticket.id}`)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create ticket. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    createTicket()
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">New Ticket</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-700">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter ticket title"
              className="text-black"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium text-gray-700">
              Message
            </label>
            <Textarea
              id="message"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="min-h-[200px] text-black"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !title.trim() || !content.trim()}
            >
              Create Ticket
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
} 