import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICKET_STATUS_MAP, TicketStatus } from '@/features/tickets/types'
import { cn } from '@/lib/utils'

interface TicketStatusSelectProps {
  value: TicketStatus
  onValueChange: (value: TicketStatus) => void
  className?: string
}

const statusDotColorMap = {
  new: 'bg-semantic-info',
  open: 'bg-semantic-success',
  pending: 'bg-semantic-warning',
  resolved: 'bg-primary dark:bg-primary-light',
  closed: 'bg-secondary-light dark:bg-secondary'
} as const

export function TicketStatusSelect({ value, onValueChange, className = '' }: TicketStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TICKET_STATUS_MAP).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center">
              <div className={cn(
                'w-2 h-2 rounded-full mr-2',
                statusDotColorMap[value as TicketStatus]
              )} />
              {label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 