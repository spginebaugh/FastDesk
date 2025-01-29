import { supabase } from '@/config/supabase/client'
import { TicketStatus, TicketWithUser } from '../types'
import { getAuthenticatedUser, getUserOrganizationIds } from './helper'
import { subDays } from 'date-fns'

interface GetTicketsParams {
  userId?: string
  status?: TicketStatus[]
  unassigned?: boolean
  recentlyUpdated?: boolean
  organizationId?: string
}

export async function getTickets({ 
  userId, 
  status = ['new', 'open', 'pending'],
  unassigned = false,
  recentlyUpdated = false,
  organizationId
}: GetTicketsParams = {}): Promise<TicketWithUser[]> {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id, organizationId)

  let query = supabase
    .from('tickets')
    .select(`
      *,
      user:user_profiles!tickets_user_id_fkey(*)
    `)
    .order('updated_at', { ascending: false })
    .in('organization_id', userOrgIds)
  
  if (unassigned) {
    const { data: assignedTicketIds } = await supabase
      .from('ticket_assignments')
      .select('ticket_id')
    
    const ticketIds = assignedTicketIds?.map(t => t.ticket_id) || []
    if (ticketIds.length > 0) {
      query = query.not('id', 'in', `(${ticketIds.map(id => `"${id}"`).join(',')})`)
    }
  } else if (userId) {
    // Check if the user is a customer or an worker
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', userId)
      .single()

    if (userProfile?.user_type === 'customer') {
      // For customers, show tickets they created
      query = query.eq('user_id', userId)
    } else {
      // For workers, show tickets assigned to them
      const { data: assignedTickets } = await supabase
        .from('ticket_assignments')
        .select('ticket_id')
        .eq('worker_id', userId)
      
      const assignedTicketIds = assignedTickets?.map(t => t.ticket_id).filter((id): id is string => id !== null) || []
      if (assignedTicketIds.length > 0) {
        query = query.in('id', assignedTicketIds)
      } else {
        // If no assigned tickets, return empty array
        return []
      }
    }
  }

  if (status.length > 0) {
    query = query.in('ticket_status', status)
  }

  if (recentlyUpdated) {
    const recentDate = subDays(new Date(), 7) // Last 7 days
    query = query.gte('updated_at', recentDate.toISOString())
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data as TicketWithUser[]
} 