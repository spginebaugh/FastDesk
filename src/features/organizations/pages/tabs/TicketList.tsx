import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { organizationService } from '../../services/organizationService'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { TicketStatusBadge } from '@/components/shared/TicketStatusBadge'
import { TicketPriorityBadge } from '@/components/shared/TicketPriorityBadge'

interface TicketListProps {
  organizationId: string
}

interface OrganizationTicket {
  id: string
  title: string
  ticket_status: 'new' | 'open' | 'pending' | 'resolved' | 'closed'
  ticket_priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string | null
  updated_at: string | null
}

export function TicketList({ organizationId }: TicketListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: tickets = [], isLoading } = useQuery<OrganizationTicket[]>({
    queryKey: ['organization-tickets', organizationId],
    queryFn: () => organizationService.getOrganizationTickets(organizationId)
  })

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <div className="p-4">Loading tickets...</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <div className="mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-black"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white">
            <TableRow>
              <TableHead className="text-black">ID</TableHead>
              <TableHead className="text-black">Title</TableHead>
              <TableHead className="text-black">Status</TableHead>
              <TableHead className="text-black">Priority</TableHead>
              <TableHead className="text-black">Created</TableHead>
              <TableHead className="text-black">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket: OrganizationTicket) => (
              <TableRow 
                key={ticket.id}
                className="cursor-pointer hover:bg-gray-50"
              >
                <TableCell className="text-black font-medium">
                  #{ticket.id.split('-')[0]}
                </TableCell>
                <TableCell className="text-black">
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
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 