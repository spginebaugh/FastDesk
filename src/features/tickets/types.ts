import { Database, type Json } from '@/types/database'

export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketStatus = 'new' | 'open' | 'pending' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketSource = 'customer_portal' | 'worker_portal' | 'email' | 'api' | 'system'
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type SenderType = 'customer' | 'worker' | 'system'

export interface Worker {
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

export interface TicketMessage {
  id: string
  ticket_id: string
  content: Json
  content_format: 'tiptap'
  is_internal: boolean | null
  sender_id: string | null
  sender_type: 'customer' | 'worker'
  created_at: string | null
  updated_at: string | null
  sender?: MessageSender
}

export interface TicketWithUser {
  id: string
  title: string
  ticket_status: TicketStatus
  ticket_priority: TicketPriority
  ticket_source: TicketSource
  created_at: string | null
  updated_at: string | null
  user_id: string
  organization_id: string | null
  created_by_type: string
  created_by_id: string | null
  first_response_at: string | null
  resolved_at: string | null
  due_date: string | null
  external_reference_id: string | null
  metadata: Json | null
  integration_metadata: Json | null
  custom_fields: Json | null
  user: UserProfile
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