import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICKET_PRIORITY_MAP, TicketPriority } from '@/features/tickets/types'
import { cn } from '@/lib/utils'

interface TicketPrioritySelectProps {
  value: TicketPriority
  onValueChange: (value: TicketPriority) => void
  className?: string
}

const priorityColorMap = {
  low: 'text-secondary-light dark:text-secondary',
  medium: 'text-semantic-info',
  high: 'text-semantic-warning',
  urgent: 'text-semantic-error'
} as const

export function TicketPrioritySelect({ value, onValueChange, className = '' }: TicketPrioritySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TICKET_PRIORITY_MAP).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center">
              <span className={cn(
                'font-medium',
                priorityColorMap[value as TicketPriority]
              )}>
                {label}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 