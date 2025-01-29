import { supabase } from '@/config/supabase/client'
import { TicketWithUser } from '../types'
import { getAuthenticatedUser, getUserOrganizationIds } from './helper'

interface GetTicketParams {
  ticketId: string
}

export async function getTicket({ ticketId }: GetTicketParams): Promise<TicketWithUser> {
  const user = await getAuthenticatedUser()
  const userOrgIds = await getUserOrganizationIds(user.id)

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      user:user_profiles!tickets_user_id_fkey(*)
    `)
    .eq('id', ticketId)
    .in('organization_id', userOrgIds)
    .single()

  if (error) throw error
  return data as TicketWithUser
} 