import { Database } from '../../../types/database'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketStatus = Database['public']['Enums']['ticket_status']
export type TicketPriority = Database['public']['Enums']['ticket_priority']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type SenderType = 'customer' | 'agent' | 'system'

export interface MessageSender {
  full_name: string | null
  avatar_url: string | null
}

export interface TicketWithCustomer extends Omit<Ticket, 'customer'> {
  customer: UserProfile
}

export type BaseTicketMessage = Database['public']['Tables']['ticket_messages']['Row']

export interface TicketMessageJoinResult extends BaseTicketMessage {
  sender: UserProfile | null
}

export interface TicketMessage extends BaseTicketMessage {
  sender?: MessageSender
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