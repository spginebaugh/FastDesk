import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TicketStatus, TicketPriority } from '../types'
import { TicketReplyBox } from '../components/TicketReplyBox'
import { TicketMessage } from '../components/TicketMessage'
import { TicketStatusSelect } from '@/components/shared/TicketStatusSelect'
import { TicketPrioritySelect } from '@/components/shared/TicketPrioritySelect'
import { UserStatusBadge } from '@/components/shared/UserStatusBadge'
import { useTicketDetail } from '../hooks/useTicketDetail'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const { user } = useAuthStore()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [pendingChanges, setPendingChanges] = useState<{
    ticket_status?: TicketStatus;
    ticket_priority?: TicketPriority;
    assignee?: string;
  }>({})

  const {
    ticket,
    messages,
    currentAssignment,
    availableWorkers,
    isLoading,
    mutations: { updateTicket, updateTicketAssignment }
  } = useTicketDetail({ ticketId: ticketId! })

  const handleTitleClick = () => {
    if (!isEditingTitle) {
      setEditedTitle(ticket?.title || '')
      setIsEditingTitle(true)
    }
  }

  const handleTitleSubmit = async () => {
    if (!ticketId || !editedTitle.trim()) return
    
    try {
      await updateTicket({ title: editedTitle.trim() })
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

  const handleSaveChanges = async () => {
    if (!ticketId || Object.keys(pendingChanges).length === 0) return

    const updates: any = { ...pendingChanges }
    const assignee = updates.assignee
    delete updates.assignee

    try {
      // Update ticket details if there are any changes
      if (Object.keys(updates).length > 0) {
        await updateTicket(updates)
      }

      // Update assignment if it changed
      if (assignee !== undefined) {
        await updateTicketAssignment(assignee === 'unassigned' ? null : assignee)
      }

      setPendingChanges({})
    } catch (error) {
      console.error('Failed to update ticket:', error)
    }
  }

  const hasChanges = Object.keys(pendingChanges).length > 0

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!ticket || !messages || !Array.isArray(messages)) {
    return <div className="flex items-center justify-center h-full">Loading ticket data...</div>
  }

  if (messages.length === 0) {
    return <div className="flex items-center justify-center h-full">Ticket not found</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border/50 bg-background px-6 py-4">
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
                className="text-2xl font-semibold cursor-pointer hover:text-primary/90"
                onClick={handleTitleClick}
              >
                {ticket.title}
              </h1>
            )}
            <div className="mt-1 text-sm text-muted-foreground">
              Opened by {ticket.user.full_name || ticket.user.email} · {format(new Date(ticket.created_at!), 'MMM d, yyyy')}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Ticket Controls */}
        <div className="w-64 border-r border-border/50 bg-background p-4 flex flex-col">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <TicketStatusSelect
                value={pendingChanges.ticket_status || ticket.ticket_status}
                onValueChange={handleTicketStatusChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assignee</label>
              <Select
                value={pendingChanges.assignee || (currentAssignment ? currentAssignment.id : 'unassigned')}
                onValueChange={handleAssigneeChange}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue>
                    {currentAssignment ? (
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
                    <span className="text-muted-foreground">Unassigned</span>
                  </SelectItem>
                  {availableWorkers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={worker.avatar_url || undefined} />
                          <AvatarFallback>
                            {worker.full_name?.[0]?.toUpperCase() || worker.email?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{worker.full_name || worker.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <TicketPrioritySelect
                value={pendingChanges.ticket_priority || ticket.ticket_priority}
                onValueChange={handleTicketPriorityChange}
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50 mt-4">
            <Button 
              className="w-full"
              onClick={handleSaveChanges}
              disabled={!hasChanges}
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Middle Section - Messages */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <TicketMessage 
                key={message.id} 
                message={message}
                isInitialMessage={index === 0}
                user={message.sender_type === 'customer' ? ticket.user : message.sender}
                ticketCreatorId={ticket.user_id}
                currentUserId={user?.id || ''}
              />
            ))}
          </div>
          <TicketReplyBox 
            ticketId={ticketId!} 
            ticketTitle={ticket.title}
            ticketContent={messages[0]?.content || ''}
            originalSenderFullName={ticket.user.full_name || ticket.user.email}
            currentWorkerFullName={user?.user_metadata?.full_name}
            previousMessages={messages.map(msg => ({
              content: msg.content,
              role: msg.sender_type === 'customer' ? 'user' : 'worker',
              senderFullName: msg.sender_type === 'customer' 
                ? (ticket.user.full_name || ticket.user.email)
                : (msg.sender?.full_name || 'Support Worker')
            }))}
          />
        </div>

        {/* Right Section - Ticket Creator Profile */}
        <div className="w-80 border-l border-border/50 bg-background p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ticket.user.avatar_url || undefined} />
                <AvatarFallback>
                  {ticket.user.full_name?.split(' ').map((n: string) => n[0]).join('') || ticket.user.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">
                  {ticket.user.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-muted-foreground">{ticket.user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Company</h4>
                <p className="text-sm">{ticket.user.company || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Status</h4>
                <div className="mt-1">
                  <UserStatusBadge status={ticket.user.user_status || 'offline'} />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium">Created</h4>
                <p className="text-sm">
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