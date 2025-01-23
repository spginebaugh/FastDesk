import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ticketService } from '../services/ticketService'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TICKET_PRIORITY_MAP, TicketPriority, TICKET_STATUS_MAP, TicketStatus } from '../types'

export function NewTicketPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [initialSettings, setInitialSettings] = useState<{
    priority?: TicketPriority;
    assignee?: string;
  }>({
    priority: 'low',
    assignee: 'unassigned'
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async () => {
      const ticket = await ticketService.createTicket({ 
        title,
        priority: initialSettings.priority,
        assignee: initialSettings.assignee
      })
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

  const handlePriorityChange = (priority: TicketPriority) => {
    setInitialSettings(prev => ({ ...prev, priority }))
  }

  const handleAssigneeChange = (assignee: string) => {
    setInitialSettings(prev => ({ ...prev, assignee }))
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-2xl font-semibold text-gray-900">New Ticket</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Ticket Controls */}
        <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={initialSettings.priority}
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TICKET_PRIORITY_MAP).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center">
                        <span className={TICKET_PRIORITY_MAP[value as TicketPriority].color}>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <Select
                value={initialSettings.assignee}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {/* TODO: Add agent list */}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Middle Section - New Ticket Form */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden bg-gray-50">
          <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6">
            <div className="space-y-6 w-full">
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
                  {isPending ? 'Creating...' : 'Create Ticket'}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section - Current User Profile */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.user_metadata?.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Company</h4>
                <p className="text-sm text-gray-900">{user?.user_metadata?.company || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Status</h4>
                <p className="text-sm text-gray-900">{user?.user_metadata?.status || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-900">
                  {user?.created_at 
                    ? format(new Date(user.created_at), 'MMM d, yyyy')
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 