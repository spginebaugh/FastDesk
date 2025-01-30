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
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import { useNavigate, Link } from 'react-router-dom'
import { TicketStatusBadge } from '@/components/shared/TicketStatusBadge'
import { TicketPriorityBadge } from '@/components/shared/TicketPriorityBadge'
import { cn } from '@/lib/utils'
import { useTicketList } from '../hooks/useTicketList'

interface TicketListPageProps {
  view?: 'assigned' | 'unassigned' | 'all' | 'recent' | 'solved'
}

const titles = {
  assigned: 'Your unresolved tickets',
  unassigned: 'Unassigned tickets',
  all: 'All unsolved tickets',
  recent: 'Recently updated tickets',
  solved: 'Solved tickets'
}

export function TicketListPage({ view = 'assigned' }: TicketListPageProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const {
    tickets,
    isLoading,
    selectedTickets,
    handleTicketSelection,
    handleSelectAll
  } = useTicketList({ view, userId: user?.id })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-foreground">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* Views Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-background">
        <nav className="h-full overflow-y-auto">
          <div className="space-y-1 p-4">
            <div className="py-2">
              <h2 className="px-2 text-lg font-semibold text-foreground">Views</h2>
              <div className="space-y-1 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full justify-start text-foreground hover:text-primary hover:bg-primary/10",
                    "transition-colors duration-200",
                    view === 'assigned' && [
                      "bg-primary/10",
                      "text-primary",
                      "hover:bg-primary/20"
                    ]
                  )}
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
                  className={cn(
                    "w-full justify-start text-foreground hover:text-primary hover:bg-primary/10",
                    "transition-colors duration-200",
                    view === 'unassigned' && [
                      "bg-primary/10",
                      "text-primary",
                      "hover:bg-primary/20"
                    ]
                  )}
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
                  className={cn(
                    "w-full justify-start text-foreground hover:text-primary hover:bg-primary/10",
                    "transition-colors duration-200",
                    view === 'all' && [
                      "bg-primary/10",
                      "text-primary",
                      "hover:bg-primary/20"
                    ]
                  )}
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
                  className={cn(
                    "w-full justify-start text-foreground hover:text-primary hover:bg-primary/10",
                    "transition-colors duration-200",
                    view === 'recent' && [
                      "bg-primary/10",
                      "text-primary",
                      "hover:bg-primary/20"
                    ]
                  )}
                  asChild
                >
                  <Link to="/views/recently-updated">
                    <Ticket className="mr-2 h-4 w-4" />
                    Recently updated
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "w-full justify-start text-foreground hover:text-primary hover:bg-primary/10",
                    "transition-colors duration-200",
                    view === 'solved' && [
                      "bg-primary/10",
                      "text-primary",
                      "hover:bg-primary/20"
                    ]
                  )}
                  asChild
                >
                  <Link to="/views/solved">
                    <Ticket className="mr-2 h-4 w-4" />
                    Solved tickets
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 bg-background px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground glow-text">{titles[view]}</h1>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-foreground hover:text-primary hover:bg-primary/10 border-border/50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <span className="text-sm text-muted-foreground">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
              </span>
            </div>
            <Button 
              onClick={() => navigate('/tickets/new')}
              className="bg-primary hover:bg-primary/90"
            >
              New Ticket
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto ">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id}
                    className="cursor-pointer"
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        checked={selectedTickets.includes(ticket.id)}
                        onCheckedChange={(checked: boolean) => handleTicketSelection(ticket.id, checked)}
                      />
                    </TableCell>
                    <TableCell 
                      className="font-medium"
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      {ticket.title}
                    </TableCell>
                    <TableCell 
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