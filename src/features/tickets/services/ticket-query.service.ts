import { supabase } from '@/config/supabase/client'
import { TicketStatus, TicketWithUser } from '../types'
import { getAuthenticatedUser, getUserOrganizationIds } from './helper'

const TICKET_SELECT_QUERY = `
  id,
  title,
  ticket_status,
  ticket_priority,
  custom_fields,
  user_id,
  organization_id,
  created_at,
  updated_at,
  user:user_profiles!tickets_user_id_fkey(*)
` as const

interface GetTicketByIdParams {
  ticketId: string
}

interface GetTicketsParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
  organizationId?: string
  showAllOrganizationTickets?: boolean
}

export async function getTicketById({ ticketId }: GetTicketByIdParams): Promise<TicketWithUser> {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id)

  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT_QUERY)
    .eq('id', ticketId)
    .in('organization_id', userOrgIds)
    .single()

  if (error) {
    console.error('Error fetching ticket:', error)
    throw new Error('Ticket not found')
  }
  if (!data) throw new Error('Ticket not found')
  
  return data as unknown as TicketWithUser
}

export async function queryTickets({ 
  userId, 
  status = ['new', 'open', 'pending'],
  unassigned = false,
  organizationId,
  showAllOrganizationTickets = false
}: GetTicketsParams = {}): Promise<TicketWithUser[]> {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id, organizationId)

  if (!userOrgIds.length) {
    return []
  }

  // First get all ticket IDs that match our criteria
  let ticketIds: string[] = []

  if (unassigned) {
    const { data: assignments } = await supabase
      .from('ticket_assignments')
      .select('ticket_id')

    const assignedIds = (assignments as { ticket_id: string | null }[])?.map(t => t.ticket_id).filter((id): id is string => id !== null) || []
    
    // Get all tickets except those that are assigned
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .in('organization_id', userOrgIds)
      .in('ticket_status', status)

    ticketIds = (tickets as { id: string }[])?.map(t => t.id).filter(id => !assignedIds.includes(id)) || []
  } else if (userId) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .single()

    if (profile?.user_type === 'customer') {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('user_id', userId)
        .in('organization_id', userOrgIds)
        .in('ticket_status', status)

      ticketIds = (tickets as { id: string }[])?.map(t => t.id) || []
    } else {
      const { data: assignments } = await supabase
        .from('ticket_assignments')
        .select('ticket_id')
        .eq('worker_id', userId)
      
      ticketIds = (assignments as { ticket_id: string | null }[])?.map(t => t.ticket_id).filter((id): id is string => id !== null) || []

      // Apply status filter to worker's tickets
      if (ticketIds.length > 0) {
        const { data: statusFilteredTickets } = await supabase
          .from('tickets')
          .select('id')
          .in('id', ticketIds)
          .in('ticket_status', status)

        ticketIds = (statusFilteredTickets as { id: string }[])?.map(t => t.id) || []
      }
    }
  } else {
    const { data: tickets } = await supabase
      .from('tickets')
      .select('id')
      .in('organization_id', userOrgIds)
      .in('ticket_status', status)

    ticketIds = (tickets as { id: string }[])?.map(t => t.id) || []
  }

  if (ticketIds.length === 0) {
    return []
  }

  // Then get the full ticket data for these IDs
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT_QUERY)
    .in('id', ticketIds)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  return (tickets || []) as unknown as TicketWithUser[]
} 