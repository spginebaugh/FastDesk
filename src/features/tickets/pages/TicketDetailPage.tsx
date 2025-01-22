import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ticketService } from '../services/ticketService'
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP, TicketStatus, TicketPriority } from '../types'
import { TicketReplyBox } from '../components/TicketReplyBox'
import { TicketMessage } from '../components/TicketMessage'

export function TicketDetailPage() {
  const { ticketId } = useParams()
  const queryClient = useQueryClient()
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')

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

  const handleStatusChange = async (status: TicketStatus) => {
    if (!ticketId) return
    try {
      await ticketService.updateTicket(ticketId, { status })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    } catch (error) {
      console.error('Failed to update ticket status:', error)
    }
  }

  const handlePriorityChange = async (priority: TicketPriority) => {
    if (!ticketId) return
    try {
      await ticketService.updateTicket(ticketId, { priority })
      await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    } catch (error) {
      console.error('Failed to update ticket priority:', error)
    }
  }

  if (isLoadingTicket || isLoadingMessages) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!ticket || messages.length === 0) {
    return <div className="flex items-center justify-center h-full">Ticket not found</div>
  }

  // Get initial message
  const initialMessage = messages[0]

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
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Section - Ticket Controls */}
        <div className="w-64 border-r bg-gray-50 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select
              value={ticket.status}
              onValueChange={(value: TicketStatus) => handleStatusChange(value)}
            >
              <SelectTrigger className="w-full bg-white text-black">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TICKET_STATUS_MAP).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${TICKET_STATUS_MAP[value as TicketStatus].color}`} />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Priority</label>
            <Select
              value={ticket.priority}
              onValueChange={(value: TicketPriority) => handlePriorityChange(value)}
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
            <Select defaultValue="unassigned">
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

        {/* Middle Section - Messages */}
        <div className="flex-1 flex flex-col min-w-0 max-w-[calc(100%-36rem)] overflow-hidden bg-gray-50">
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-6 w-full">
              <TicketMessage message={initialMessage} isInitialMessage customer={ticket.customer} />
              {messages.slice(1).map((message) => (
                <TicketMessage key={message.id} message={message} customer={ticket.customer} />
              ))}
            </div>
          </div>
          <TicketReplyBox ticketId={ticketId!} />
        </div>

        {/* Right Section - Customer Profile */}
        <div className="w-80 border-l bg-gray-50 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={ticket.customer.avatar_url || undefined} />
                <AvatarFallback>
                  {ticket.customer.full_name?.split(' ').map(n => n[0]).join('') || '??'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {ticket.customer.full_name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500">{ticket.customer.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Company</h4>
                <p className="text-sm text-gray-900">{ticket.customer.company || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Status</h4>
                <p className="text-sm text-gray-900">{ticket.customer.status || '-'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Created</h4>
                <p className="text-sm text-gray-900">
                  {ticket.customer.created_at 
                    ? format(new Date(ticket.customer.created_at), 'MMM d, yyyy')
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