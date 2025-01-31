import { supabase } from '@/config/supabase/client'
import { getAuthenticatedUser, getUserOrganizationIds, getTicketAssignment, getOrganizationWorkers } from './helper'
import { type Database } from '@/types/database'

type Tables = Database['public']['Tables']
type TicketAssignmentRow = Tables['ticket_assignments']['Row']


interface UpdateTicketAssignmentParams {
  ticketId: string
  workerId: string | null
}

interface GetAllTicketAssignmentsParams {
  organizationId?: string
}


interface Assignment {
  ticket_id: string
  worker: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
  } | null
}

export { getTicketAssignment, getOrganizationWorkers }

export async function updateTicketAssignment({ ticketId, workerId }: UpdateTicketAssignmentParams): Promise<void> {
  // Get the ticket's organization ID first
  const { data: ticket, error: ticketError } = await supabase
    .from('tickets')
    .select('organization_id')
    .eq('id', ticketId)
    .single()

  if (ticketError) throw ticketError
  if (!ticket) throw new Error('Ticket not found')

  // First remove any existing primary assignments
  const { error: deleteError } = await supabase
    .from('ticket_assignments')
    .delete()
    .eq('ticket_id', ticketId)
    .eq('is_primary', true)

  if (deleteError) throw deleteError

  // If we have a new worker to assign, create the assignment
  if (workerId) {
    const { error: insertError } = await supabase
      .from('ticket_assignments')
      .insert({
        ticket_id: ticketId,
        worker_id: workerId,
        organization_id: ticket.organization_id,
        is_primary: true
      } satisfies Partial<TicketAssignmentRow>)

    if (insertError) throw insertError
  }
}

export async function getAllTicketAssignments({ organizationId }: GetAllTicketAssignmentsParams): Promise<Assignment[]> {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id, organizationId)

  // Get all tickets for the user's organizations
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id')
    .in('organization_id', userOrgIds)

  if (ticketsError) throw ticketsError
  const ticketIds = tickets?.map(t => t.id) || []

  // Get all assignments for these tickets
  const { data: assignments, error: assignmentsError } = await supabase
    .from('ticket_assignments')
    .select(`
      ticket_id,
      worker:worker_id(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .in('ticket_id', ticketIds)

  if (assignmentsError) throw assignmentsError
  return (assignments || []) as Assignment[]
} 