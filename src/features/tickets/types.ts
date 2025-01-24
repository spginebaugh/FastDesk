import { Database } from '@/types/database'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketStatus = Database['public']['Enums']['ticket_status']
export type TicketPriority = Database['public']['Enums']['ticket_priority']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type SenderType = 'customer' | 'agent' | 'system'

export interface Agent {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
}

export interface MessageSender {
  full_name: string | null
  avatar_url: string | null
}

export interface TicketWithUser extends Omit<Ticket, 'user'> {
  user: UserProfile
}

export type BaseTicketMessage = Database['public']['Tables']['ticket_messages']['Row']

export interface TicketMessageJoinResult extends BaseTicketMessage {
  sender: UserProfile | null
}

export interface TicketMessage extends BaseTicketMessage {
  sender?: MessageSender
}

export const TICKET_STATUS_MAP = {
  new: { label: 'New', color: 'bg-accent-blue' },
  open: { label: 'Open', color: 'bg-semantic-success' },
  pending: { label: 'Pending', color: 'bg-semantic-warning' },
  resolved: { label: 'Resolved', color: 'bg-primary' },
  closed: { label: 'Closed', color: 'bg-muted-foreground' },
} as const

export const TICKET_PRIORITY_MAP = {
  low: { label: 'Low', color: 'text-muted-foreground' },
  medium: { label: 'Medium', color: 'text-accent-blue' },
  high: { label: 'High', color: 'text-semantic-warning' },
  urgent: { label: 'Urgent', color: 'text-semantic-error' },
} as const 