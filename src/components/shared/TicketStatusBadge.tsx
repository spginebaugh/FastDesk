import { Badge } from '@/components/ui/badge'
import { TICKET_STATUS_MAP, TicketStatus } from '@/features/tickets/types'

interface TicketStatusBadgeProps {
  ticketStatus: TicketStatus
  className?: string
}

export function TicketStatusBadge({ ticketStatus, className = '' }: TicketStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${TICKET_STATUS_MAP[ticketStatus].color} bg-opacity-10 text-black ${className}`}
    >
      {TICKET_STATUS_MAP[ticketStatus].label}
    </Badge>
  )
} 