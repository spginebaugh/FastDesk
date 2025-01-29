import { supabase } from '@/config/supabase/client'
import { type Worker } from '../types'

/**
 * Gets the authenticated user's profile or throws an error
 */
export async function getAuthenticatedUser() {
  const { data: userProfile } = await supabase.auth.getUser()
  if (!userProfile.user) throw new Error('Not authenticated')
  return userProfile.user
}

/**
 * Gets the organization IDs that a user is a member of
 */
export async function getUserOrganizationIds(userId: string, specificOrgId?: string): Promise<string[]> {
  if (specificOrgId) return [specificOrgId]
  
  const { data: userOrgs } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('profile_id', userId)

  return userOrgs?.map(org => org.organization_id) || []
}

/**
 * Gets a user's profile by their email
 */
export async function getUserProfileByEmail(email: string) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id, email, user_type')
    .eq('email', email)
    .single()

  if (!profile?.id) {
    throw new Error('User profile not found')
  }

  return profile
}

/**
 * Gets workers belonging to an organization
 */
export async function getOrganizationWorkers(organizationId: string): Promise<Worker[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      profile:user_profiles!inner(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .eq('profile.user_type', 'worker')

  if (error) throw error
  return data.map(d => d.profile) as Worker[]
}

/**
 * Gets the primary worker assigned to a ticket
 */
export async function getTicketAssignment(ticketId: string) {
  const { data, error } = await supabase
    .from('ticket_assignments')
    .select(`
      worker:user_profiles!ticket_assignments_worker_id_fkey(
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('ticket_id', ticketId)
    .eq('is_primary', true)
    .maybeSingle()

  if (error) throw error
  return data?.worker as Worker | null
}

/**
 * Updates the timestamp of a ticket
 */
export async function updateTicketTimestamp(ticketId: string) {
  const { error } = await supabase
    .from('tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) throw error
} 