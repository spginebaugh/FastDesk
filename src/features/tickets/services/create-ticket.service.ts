import { supabase } from '@/config/supabase/client'
import { TicketWithUser, TicketPriority } from '../types'
import { getAuthenticatedUser, getUserProfileByEmail } from './helper'
import { type Database } from '@/types/database'

type Ticket = Database['public']['Tables']['tickets']['Row']
type TicketAssignment = Database['public']['Tables']['ticket_assignments']['Row']

interface CreateTicketParams {
  title: string
  priority?: TicketPriority
  assignee?: string
  organizationId?: string | null
}

export async function createTicket({ 
  title, 
  priority = 'low',
  assignee = 'unassigned',
  organizationId = null
}: CreateTicketParams): Promise<TicketWithUser> {
  const user = await getAuthenticatedUser()
  const profile = await getUserProfileByEmail(user.email!)

  const ticketData = {
    title,
    ticket_status: 'new' as const,
    ticket_priority: priority,
    user_id: profile.id,
    organization_id: organizationId,
    created_by_type: profile.user_type,
    created_by_id: profile.id,
    ticket_source: profile.user_type === 'worker' ? 'worker_portal' as const : 'customer_portal' as const
  } satisfies Partial<Ticket>

  // Create the ticket
  const { data: tickets, error: createError } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select()

  if (createError) throw createError
  if (!tickets?.[0]) throw new Error('Failed to create ticket')
  const ticket = tickets[0]

  // If no assignee specified and no organization, assign to creator
  const finalAssignee = assignee === 'unassigned' && !organizationId ? profile.id : assignee

  if (finalAssignee && finalAssignee !== 'unassigned') {
    const { error: assignError } = await supabase
      .from('ticket_assignments')
      .insert({
        ticket_id: ticket.id,
        worker_id: finalAssignee,
        organization_id: organizationId,
        is_primary: true
      } satisfies Partial<TicketAssignment>)

    if (assignError) throw assignError
  }

  // Get the full ticket with user data
  const { data: fullTickets, error: fetchError } = await supabase
    .from('tickets')
    .select(`
      *,
      user:user_profiles!tickets_user_id_fkey(*)
    `)
    .eq('id', ticket.id)
    .single()

  if (fetchError) throw fetchError
  if (!fullTickets) throw new Error('Failed to fetch created ticket')

  return fullTickets as TicketWithUser
} 