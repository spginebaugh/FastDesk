import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TICKET_STATUS_MAP, TicketStatus } from '@/features/tickets/types'

interface TicketStatusSelectProps {
  value: TicketStatus
  onValueChange: (value: TicketStatus) => void
  className?: string
}

export function TicketStatusSelect({ value, onValueChange, className = '' }: TicketStatusSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger className={`w-full bg-white text-black ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(TICKET_STATUS_MAP).map(([value, { label }]) => (
          <SelectItem key={value} value={value}>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${TICKET_STATUS_MAP[value as TicketStatus].color}`} />
              {label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
} 