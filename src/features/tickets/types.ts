import { Database } from '../../../types/database'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketStatus = Database['public']['Enums']['ticket_status']
export type TicketPriority = Database['public']['Enums']['ticket_priority']
export type Customer = Database['public']['Tables']['customers']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']

export interface TicketWithCustomer extends Omit<Ticket, 'customer'> {
  customer: Customer & Partial<Profile>
}

export type TicketMessage = Database['public']['Tables']['ticket_messages']['Row'] & {
  sender?: Profile
}

export const TICKET_STATUS_MAP = {
  new: { label: 'New', color: 'bg-blue-500' },
  open: { label: 'Open', color: 'bg-green-500' },
  pending: { label: 'Pending', color: 'bg-yellow-500' },
  resolved: { label: 'Resolved', color: 'bg-purple-500' },
  closed: { label: 'Closed', color: 'bg-gray-500' },
} as const

export const TICKET_PRIORITY_MAP = {
  low: { label: 'Low', color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-blue-500' },
  high: { label: 'High', color: 'text-orange-500' },
  urgent: { label: 'Urgent', color: 'text-red-500' },
} as const

export type SenderType = 'customer' | 'agent' | 'system' 