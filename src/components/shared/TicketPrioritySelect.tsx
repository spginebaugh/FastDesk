import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICKET_PRIORITY_MAP, TicketPriority } from '@/features/tickets/types'

interface TicketPrioritySelectProps {
  value: TicketPriority
  onValueChange: (value: TicketPriority) => void
  className?: string
}

export function TicketPrioritySelect({ value, onValueChange, className = '' }: TicketPrioritySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={`w-full bg-white text-black ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TICKET_PRIORITY_MAP).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center">
              <span className={TICKET_PRIORITY_MAP[value as TicketPriority].color}>{label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 