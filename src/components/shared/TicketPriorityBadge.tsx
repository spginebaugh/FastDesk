import { Badge } from '@/components/ui/badge'
import { TICKET_PRIORITY_MAP, TicketPriority } from '@/features/tickets/types'

interface TicketPriorityBadgeProps {
  ticketPriority: TicketPriority
  className?: string
}

export function TicketPriorityBadge({ ticketPriority, className = '' }: TicketPriorityBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${TICKET_PRIORITY_MAP[ticketPriority].color} ${className}`}
    >
      {TICKET_PRIORITY_MAP[ticketPriority].label}
    </Badge>
  )
} 