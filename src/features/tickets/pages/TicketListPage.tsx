import { useState } from 'react'
import { Filter, Ticket } from 'lucide-react'
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
import { useQuery } from '@tanstack/react-query'
import { ticketService } from '../services/ticketService'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'
import { TicketStatusBadge } from '@/components/shared/TicketStatusBadge'
import { TicketPriorityBadge } from '@/components/shared/TicketPriorityBadge'

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
    <div className="h-full flex">
      {/* Views Sidebar */}
      <aside className="w-64 border-r bg-gray-50">
        <nav className="h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="py-2">
              <h2 className="px-2 text-lg font-semibold text-gray-900">Views</h2>
              <div className="space-y-1 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start ${view === 'assigned' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} 
                  asChild
                >
                  <Link to="/views">
                    <Ticket className="mr-2 h-4 w-4" />
                    Your unresolved tickets
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start ${view === 'unassigned' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} 
                  asChild
                >
                  <Link to="/views/unassigned">
                    <Ticket className="mr-2 h-4 w-4" />
                    Unassigned tickets
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start ${view === 'all' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} 
                  asChild
                >
                  <Link to="/views/all">
                    <Ticket className="mr-2 h-4 w-4" />
                    All unsolved tickets
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start ${view === 'recent' ? 'bg-gray-200' : 'hover:bg-gray-100'}`} 
                  asChild
                >
                  <Link to="/views/recently-updated">
                    <Ticket className="mr-2 h-4 w-4" />
                    Recently updated
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b bg-white px-6 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">{titles[view]}</h1>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-gray-900 bg-gray-100 hover:bg-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <span className="text-sm text-black">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button onClick={() => navigate('/tickets/new')}>
              New Ticket
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      className="border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                        className="border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
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
                      {ticket.user.full_name}
                    </TableCell>
                    <TableCell onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      <TicketStatusBadge ticketStatus={ticket.ticket_status} />
                    </TableCell>
                    <TableCell onClick={() => navigate(`/tickets/${ticket.id}`)}>
                      <TicketPriorityBadge ticketPriority={ticket.ticket_priority} />
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
    </div>
  )
} 