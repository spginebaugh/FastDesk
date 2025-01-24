import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ticketService } from '@/features/tickets/services/ticketService'
import { TicketStatusBadge } from '@/components/shared/TicketStatusBadge'
import { TicketPriorityBadge } from '@/components/shared/TicketPriorityBadge'

interface CustomerTicketsProps {
  customerId: string
}

export function CustomerTickets({ customerId }: CustomerTicketsProps) {
  const navigate = useNavigate()
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['customer-tickets', customerId],
    queryFn: () => ticketService.getTickets({ userId: customerId })
  })

  const handleRowClick = (ticketId: string) => {
    navigate(`/tickets/${ticketId}`)
  }

  if (isLoading) {
    return <div className="p-4">Loading tickets...</div>
  }

  return (
    <div className="flex-1 overflow-auto">
      <Table>
        <TableHeader className="sticky top-0 bg-white">
          <TableRow>
            <TableHead className="text-black">Title</TableHead>
            <TableHead className="text-black">Status</TableHead>
            <TableHead className="text-black">Priority</TableHead>
            <TableHead className="text-black">Created</TableHead>
            <TableHead className="text-black">Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow 
              key={ticket.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(ticket.id)}
            >
              <TableCell className="text-black font-medium">
                {ticket.title}
              </TableCell>
              <TableCell>
                <TicketStatusBadge ticketStatus={ticket.ticket_status} />
              </TableCell>
              <TableCell>
                <TicketPriorityBadge ticketPriority={ticket.ticket_priority} />
              </TableCell>
              <TableCell className="text-black">
                {ticket.created_at && format(new Date(ticket.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-black">
                {ticket.updated_at && format(new Date(ticket.updated_at), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
          {tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                No tickets found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
} 