import { supabase } from '@/config/supabase/client'
import { getAuthenticatedUser, getUserOrganizationIds, getTicketAssignment, getOrganizationWorkers } from './helper'

interface UpdateTicketAssignmentParams {
  ticketId: string
  workerId: string | null
}

interface GetAllTicketAssignmentsParams {
  organizationId?: string
}

export { getTicketAssignment, getOrganizationWorkers }

export async function updateTicketAssignment({ ticketId, workerId }: UpdateTicketAssignmentParams): Promise<void> {
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
        is_primary: true
      })

    if (insertError) throw insertError
  }
}

export async function getAllTicketAssignments({ organizationId }: GetAllTicketAssignmentsParams) {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id, organizationId)

  // Get all tickets for the user's organizations
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id')
    .in('organization_id', userOrgIds)

  const ticketIds = tickets?.map(t => t.id) || []

  // Get all assignments for these tickets
  const { data: assignments, error } = await supabase
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

  if (error) throw error
  return assignments
} 