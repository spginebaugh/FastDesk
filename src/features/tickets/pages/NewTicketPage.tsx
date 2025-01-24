import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { ticketService } from '../services/ticketService'
import { organizationService } from '@/features/organizations/services/organizationService'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TICKET_PRIORITY_MAP, TicketPriority } from '../types'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'

export function NewTicketPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [initialSettings, setInitialSettings] = useState<{
    ticket_priority?: TicketPriority;
    assignee?: string;
    organizationId?: string;
  }>({
    ticket_priority: 'low',
    assignee: 'unassigned',
    organizationId: 'unassigned'
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  // Get user's organizations
  const { data: organizations = [] } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getOrganizations()
  })

  // Get agents for selected organization
  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['organization-agents', initialSettings.organizationId],
    queryFn: async () => {
      if (!initialSettings.organizationId || initialSettings.organizationId === 'unassigned') {
        return []
      }
      return ticketService.getOrganizationAgents(initialSettings.organizationId)
    },
    enabled: !!initialSettings.organizationId && initialSettings.organizationId !== 'unassigned'
  })

  const { mutate: createTicket, isPending } = useMutation({
    mutationFn: async () => {
      const ticket = await ticketService.createTicket({ 
        title,
        priority: initialSettings.ticket_priority,
        assignee: initialSettings.assignee,
        organizationId: initialSettings.organizationId === 'unassigned' ? null : initialSettings.organizationId
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

  const handleTicketPriorityChange = (ticket_priority: TicketPriority) => {
    setInitialSettings(prev => ({ ...prev, ticket_priority }))
  }

  const handleOrganizationChange = (organizationId: string) => {
    setInitialSettings(prev => ({ 
      ...prev, 
      organizationId,
      assignee: 'unassigned' // Reset assignee when organization changes
    }))
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
              <label className="text-sm font-medium text-gray-700">Organization</label>
              <Select
                value={initialSettings.organizationId}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue>
                    {initialSettings.organizationId === 'unassigned' ? (
                      'Unassigned'
                    ) : (
                      organizations.find(org => org.id === initialSettings.organizationId)?.name || 'Loading...'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-gray-600">Unassigned</span>
                  </SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
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
                  <SelectValue>
                    {isLoadingAgents ? (
                      'Loading...'
                    ) : initialSettings.assignee === 'unassigned' ? (
                      'Unassigned'
                    ) : (
                      <div className="flex items-center gap-2">
                        {(() => {
                          const agent = agents.find(a => a.id === initialSettings.assignee)
                          if (!agent) return 'Unassigned'
                          return (
                            <>
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={agent.avatar_url || undefined} />
                                <AvatarFallback>
                                  {agent.full_name?.[0]?.toUpperCase() || agent.email[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{agent.full_name || agent.email}</span>
                            </>
                          )
                        })()}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-gray-600">Unassigned</span>
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={agent.avatar_url || undefined} />
                          <AvatarFallback>
                            {agent.full_name?.[0]?.toUpperCase() || agent.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{agent.full_name || agent.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select
                value={initialSettings.ticket_priority}
                onValueChange={handleTicketPriorityChange}
              >
                <SelectTrigger className="w-full bg-white text-black">
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
                <div className="mt-1">
                  <UserStatusBadge status={user?.user_metadata?.user_status || 'offline'} />
                </div>
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