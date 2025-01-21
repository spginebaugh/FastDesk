import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ticketService } from '../services/ticketService'
import { TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from '../types'
import { TicketReplyBox } from '../components/TicketReplyBox'
import { TicketMessage } from '../components/TicketMessage'

export function TicketDetailPage() {
  const { ticketId } = useParams()

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

  if (isLoadingTicket || isLoadingMessages) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  if (!ticket || messages.length === 0) {
    return <div className="flex items-center justify-center h-full">Ticket not found</div>
  }

  // Get initial message
  const initialMessage = messages[0]

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{ticket.title}</h1>
          <div className="flex items-center gap-4">
            <Badge 
              variant="outline" 
              className={`${TICKET_STATUS_MAP[ticket.status].color} bg-opacity-10`}
            >
              {TICKET_STATUS_MAP[ticket.status].label}
            </Badge>
            <Badge 
              variant="outline" 
              className={TICKET_PRIORITY_MAP[ticket.priority].color}
            >
              {TICKET_PRIORITY_MAP[ticket.priority].label}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Initial ticket message */}
          <TicketMessage message={initialMessage} isInitialMessage customer={ticket.customer} />

          {/* Subsequent messages */}
          {messages.slice(1).map((message) => (
            <TicketMessage key={message.id} message={message} customer={ticket.customer} />
          ))}
        </div>
      </div>

      {/* Reply box */}
      <TicketReplyBox ticketId={ticketId!} />
    </div>
  )
} 