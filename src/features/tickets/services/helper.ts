import { supabase } from '@/config/supabase/client'
import { type Worker } from '../types'
import { type Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

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
  
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('profile_id', userId)

  if (error) throw error
  return (data as OrganizationMember[])?.map(org => org.organization_id) || []
}

/**
 * Gets a user's profile by their email
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error) throw error
  if (!data?.id) {
    throw new Error('User profile not found')
  }

  return data
}

/**
 * Gets workers belonging to an organization
 */
export async function getOrganizationWorkers(organizationId: string): Promise<Worker[]> {
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select('profile_id')
    .eq('organization_id', organizationId)

  if (membersError) throw membersError
  if (!members?.length) return []

  const memberIds = members.map(m => m.profile_id)
  const { data: workers, error: workersError } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', memberIds)
    .eq('user_type', 'worker')

  if (workersError) throw workersError
  return (workers || []) as Worker[]
}

/**
 * Gets the primary worker assigned to a ticket
 */
export async function getTicketAssignment(ticketId: string): Promise<Worker | null> {
  const { data: assignments, error: assignmentsError } = await supabase
    .from('ticket_assignments')
    .select('worker_id')
    .eq('ticket_id', ticketId)
    .eq('is_primary', true)
    .single()

  if (assignmentsError) return null
  if (!assignments?.worker_id) return null

  const { data: worker, error: workerError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', assignments.worker_id)
    .single()

  if (workerError) return null
  return worker as Worker
}

/**
 * Updates the timestamp of a ticket
 */
export async function updateTicketTimestamp(ticketId: string): Promise<void> {
  const { error } = await supabase
    .from('tickets')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ticketId)

  if (error) throw error
} 