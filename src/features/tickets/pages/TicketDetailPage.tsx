import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ticketService } from '../services/ticketService'
import { TicketStatus, TicketPriority } from '../types'
import { TicketReplyBox } from '../components/TicketReplyBox'
import { TicketMessage } from '../components/TicketMessage'
import { useToast } from '@/components/ui/use-toast'
import { TicketStatusSelect } from '@/components/shared/TicketStatusSelect'
import { TicketPrioritySelect } from '@/components/shared/TicketPrioritySelect'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [pendingChanges, setPendingChanges] = useState<{
    ticket_status?: TicketStatus;
    ticket_priority?: TicketPriority;
    assignee?: string;
  }>({})

  const { data: ticket, isLoading: isLoadingTicket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => ticketService.getTicket(ticketId!),
    enabled: !!ticketId
  })

  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => ticketService.getTicketMessages(ticketId!),
    enabled: !!ticketId
  })

  const { data: currentAssignment, isLoading: isLoadingAssignment } = useQuery({
    queryKey: ['ticket-assignment', ticketId],
    queryFn: () => ticketService.getTicketAssignment(ticketId!),
    enabled: !!ticketId
  })

  const { data: availableAgents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ['organization-agents', ticket?.organization_id],
    queryFn: () => ticketService.getOrganizationAgents(ticket!.organization_id!),
    enabled: !!ticket?.organization_id
  })

  const { mutate: updateTicket, isPending: isUpdating } = useMutation({
    mutationFn: async () => {
      if (!ticketId || Object.keys(pendingChanges).length === 0) return

      const updates: any = { ...pendingChanges }
      delete updates.assignee // Handle assignment separately

      // Update ticket details if there are any changes
      if (Object.keys(updates).length > 0) {
        await ticketService.updateTicket(ticketId, updates)
      }

      // Update assignment if it changed
      if (pendingChanges.assignee !== undefined) {
        await ticketService.updateTicketAssignment(
          ticketId,
          pendingChanges.assignee === 'unassigned' ? null : pendingChanges.assignee
        )
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['ticket-assignment', ticketId] })
      setPendingChanges({})
      toast({
        title: 'Ticket updated',
        description: 'Ticket settings have been updated successfully.'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update ticket settings. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setEditedTitle(ticket?.title || '')
      setIsEditingTitle(true)
    }
  }

  const handleTitleSubmit = async () => {
    if (!ticketId || !editedTitle.trim()) return
    
    try {
      await ticketService.updateTicket(ticketId, { title: editedTitle.trim() })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Failed to update ticket title:', error)
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false)
      setEditedTitle(ticket?.title || '')
    }
  }

  const handleTicketStatusChange = (ticket_status: TicketStatus) => {
    setPendingChanges(prev => ({ ...prev, ticket_status }))
  }

  const handleTicketPriorityChange = (ticket_priority: TicketPriority) => {
    setPendingChanges(prev => ({ ...prev, ticket_priority }))
  }

  const handleAssigneeChange = (assignee: string) => {
    setPendingChanges(prev => ({ ...prev, assignee }))
  }

  const hasChanges = Object.keys(pendingChanges).length > 0

  if (isLoadingTicket || isLoadingMessages || isLoadingAssignment || isLoadingAgents) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!ticket || messages.length === 0) {
    return <div className="flex items-center justify-center h-full">Ticket not found</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            {isEditingTitle ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                className="text-2xl font-semibold"
                autoFocus
              />
            ) : (
              <h1 
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-gray-700"
                onClick={handleTitleClick}
              >
                {ticket.title}
              </h1>
            )}
            <div className="mt-1 text-sm text-gray-500">
              Opened by {ticket.user.full_name || ticket.user.email} · {format(new Date(ticket.created_at!), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Ticket Controls */}
        <div className="w-64 border-r bg-gray-50 p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <TicketStatusSelect
                value={pendingChanges.ticket_status || ticket.ticket_status}
                onValueChange={handleTicketStatusChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Assignee</label>
              <Select
                value={pendingChanges.assignee || (currentAssignment ? currentAssignment.id : 'unassigned')}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-full bg-white text-black">
                  <SelectValue>
                    {isLoadingAssignment ? (
                      'Loading...'
                    ) : currentAssignment ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={currentAssignment.avatar_url || undefined} />
                          <AvatarFallback>
                            {currentAssignment.full_name?.[0]?.toUpperCase() || currentAssignment.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span>{currentAssignment.full_name || currentAssignment.email}</span>
                      </div>
                    ) : (
                      'Unassigned'
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">
                    <span className="text-gray-600">Unassigned</span>
                  </SelectItem>
                  {availableAgents.map((agent) => (
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
              <TicketPrioritySelect
                value={pendingChanges.ticket_priority || ticket.ticket_priority}
                onValueChange={handleTicketPriorityChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t mt-4">
            <Button 
              className="w-full"
              disabled={!hasChanges || isUpdating}
              variant={hasChanges ? "default" : "secondary"}
              onClick={() => updateTicket()}
            >
              {isUpdating ? 'Updating...' : 'Update Ticket'}
            </Button>
          </div>
        </div>

        {/* Middle Section - Messages */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <TicketMessage 
                key={message.id}
                message={message}
                user={message.sender_type === 'customer' ? ticket.user : message.sender}
                isInitialMessage={message.id === messages[0].id}
              />
            ))}
          </div>
          <div className="border-t p-4">
            <TicketReplyBox ticketId={ticketId!} />
          </div>
        </div>

        {/* Right Section - Ticket Creator Profile */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ticket.user.avatar_url || undefined} />
                <AvatarFallback>
                  {ticket.user.full_name?.split(' ').map((n: string) => n[0]).join('') || ticket.user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {ticket.user.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500">{ticket.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Company</h4>
                <p className="text-sm text-gray-900">{ticket.user.company || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Status</h4>
                <div className="mt-1">
                  <UserStatusBadge status={ticket.user.user_status} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-900">
                  {ticket.user.created_at 
                    ? format(new Date(ticket.user.created_at), 'MMM d, yyyy')
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