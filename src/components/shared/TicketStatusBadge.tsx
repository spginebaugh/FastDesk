import { Badge } from '@/components/ui/badge'
import { TICKET_STATUS_MAP, TicketStatus } from '@/features/tickets/types'
import { cn } from '@/lib/utils'

interface TicketStatusBadgeProps {
  ticketStatus: TicketStatus
  className?: string
}

const statusColorMap = {
  new: 'text-semantic-info border-semantic-info/20 bg-semantic-info/10 dark:border-semantic-info/30 dark:bg-semantic-info/5',
  open: 'text-semantic-success border-semantic-success/20 bg-semantic-success/10 dark:border-semantic-success/30 dark:bg-semantic-success/5',
  pending: 'text-semantic-warning border-semantic-warning/20 bg-semantic-warning/10 dark:border-semantic-warning/30 dark:bg-semantic-warning/5',
  resolved: 'text-primary border-primary/20 bg-primary/10 dark:text-primary-light dark:border-primary-light/30 dark:bg-primary-light/5',
  closed: 'text-secondary-light border-secondary/20 bg-secondary/10 dark:text-secondary dark:border-secondary-dark/30 dark:bg-secondary-dark/5'
} as const

const statusDotColorMap = {
  new: 'bg-semantic-info',
  open: 'bg-semantic-success',
  pending: 'bg-semantic-warning',
  resolved: 'bg-primary dark:bg-primary-light',
  closed: 'bg-secondary-light dark:bg-secondary'
} as const

export function TicketStatusBadge({ ticketStatus, className = '' }: TicketStatusBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        statusColorMap[ticketStatus],
        className
      )}
    >
      <span className={cn(
        'mr-1.5 h-2 w-2 inline-block rounded-full',
        statusDotColorMap[ticketStatus]
      )} />
      {TICKET_STATUS_MAP[ticketStatus].label}
    </Badge>
  )
} 