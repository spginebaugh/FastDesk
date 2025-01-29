import { supabase } from '@/config/supabase/client'
import { TicketWithUser, TicketPriority } from '../types'
import { getAuthenticatedUser, getUserProfileByEmail } from './helper'

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
  } as const

  // Create the ticket
  const { data: ticket, error } = await supabase
    .from('tickets')
    .insert(ticketData)
    .select(`
      *,
      user:user_profiles!tickets_user_id_fkey(*)
    `)
    .single()

  if (error) throw error

  // If no assignee specified and no organization, assign to creator
  const finalAssignee = assignee === 'unassigned' && !organizationId ? profile.id : assignee

  if (finalAssignee && finalAssignee !== 'unassigned') {
    const { error: assignmentError } = await supabase
      .from('ticket_assignments')
      .insert({
        ticket_id: ticket.id,
        worker_id: finalAssignee,
        organization_id: organizationId,
        is_primary: true
      })

    if (assignmentError) throw assignmentError
  }

  return ticket as TicketWithUser
} 