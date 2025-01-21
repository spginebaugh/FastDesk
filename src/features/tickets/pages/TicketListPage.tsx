import { useState } from 'react'
import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { ticketService } from '../services/ticketService'
import { useAuthStore } from '@/store/authStore'
import { TicketWithCustomer, TICKET_STATUS_MAP, TICKET_PRIORITY_MAP } from '../types'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'

interface TicketListPageProps {
  view?: 'assigned' | 'unassigned' | 'all' | 'recent'
}

export function TicketListPage({ view = 'assigned' }: TicketListPageProps) {
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['tickets', user?.id, view],
    queryFn: () => {
      switch (view) {
        case 'assigned':
          return ticketService.getTickets({ 
            userId: user?.id,
            status: ['new', 'open', 'pending']
          })
        case 'unassigned':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending'],
            unassigned: true
          })
        case 'all':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending']
          })
        case 'recent':
          return ticketService.getTickets({ 
            status: ['new', 'open', 'pending'],
            recentlyUpdated: true
          })
        default:
          return ticketService.getTickets({ 
            userId: user?.id,
            status: ['new', 'open', 'pending']
          })
      }
    },
    enabled: !!user
  })

  const titles = {
    assigned: 'Your unresolved tickets',
    unassigned: 'Unassigned tickets',
    all: 'All unsolved tickets',
    recent: 'Recently updated tickets'
  }

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">{titles[view]}</h1>
        
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="text-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <span className="text-sm text-gray-500">
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedTickets(tickets.map(t => t.id))
                      } else {
                        setSelectedTickets([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead className="text-black">Subject</TableHead>
                <TableHead className="text-black">Requester</TableHead>
                <TableHead className="text-black">Status</TableHead>
                <TableHead className="text-black">Priority</TableHead>
                <TableHead className="text-black">Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow 
                  key={ticket.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedTickets([...selectedTickets, ticket.id])
                        } else {
                          setSelectedTickets(selectedTickets.filter(id => id !== ticket.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell 
                    className="text-black"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    {ticket.title}
                  </TableCell>
                  <TableCell 
                    className="text-black"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    {ticket.customer?.full_name}
                  </TableCell>
                  <TableCell onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <Badge 
                      variant="outline" 
                      className={`${TICKET_STATUS_MAP[ticket.status].color} bg-opacity-10`}
                    >
                      {TICKET_STATUS_MAP[ticket.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={() => navigate(`/tickets/${ticket.id}`)}>
                    <Badge 
                      variant="outline" 
                      className={TICKET_PRIORITY_MAP[ticket.priority].color}
                    >
                      {TICKET_PRIORITY_MAP[ticket.priority].label}
                    </Badge>
                  </TableCell>
                  <TableCell 
                    className="text-black"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    {ticket.updated_at 
                      ? format(new Date(ticket.updated_at), 'MMM d, HH:mm')
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
} 