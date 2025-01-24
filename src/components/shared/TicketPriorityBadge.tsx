import { Badge } from '@/components/ui/badge'
import { TICKET_PRIORITY_MAP, TicketPriority } from '@/features/tickets/types'
import { cn } from '@/lib/utils'

interface TicketPriorityBadgeProps {
  ticketPriority: TicketPriority
  className?: string
}

const priorityColorMap = {
  low: 'text-secondary-light border-secondary/20 bg-secondary/10 dark:text-secondary dark:border-secondary-dark/30 dark:bg-secondary-dark/5',
  medium: 'text-semantic-info border-semantic-info/20 bg-semantic-info/10 dark:border-semantic-info/30 dark:bg-semantic-info/5',
  high: 'text-semantic-warning border-semantic-warning/20 bg-semantic-warning/10 dark:border-semantic-warning/30 dark:bg-semantic-warning/5',
  urgent: 'text-semantic-error border-semantic-error/20 bg-semantic-error/10 dark:border-semantic-error/30 dark:bg-semantic-error/5'
} as const

export function TicketPriorityBadge({ ticketPriority, className = '' }: TicketPriorityBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        priorityColorMap[ticketPriority],
        className
      )}
    >
      {TICKET_PRIORITY_MAP[ticketPriority].label}
    </Badge>
  )
} 