import { api } from '@/config/api/client'
import { auth } from '@/config/api/auth'
import { Organization, OrganizationMember } from '../types'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type OrganizationMemberRow = Database['public']['Tables']['organization_members']['Row']

export interface OrganizationMemberWithProfile extends Omit<OrganizationMember, 'profile'> {
  profile: Pick<UserProfile, 'id' | 'email' | 'full_name' | 'avatar_url' | 'user_status'>
}

interface OrganizationTicket {
  id: string
  title: string
  ticket_status: 'new' | 'open' | 'pending' | 'resolved' | 'closed'
  ticket_priority: 'low' | 'medium' | 'high' | 'urgent'
  created_at: string | null
  updated_at: string | null
}

export const organizationService = {
  async createOrganization({ name, description }: { name: string, description?: string }): Promise<Organization> {
    const { user } = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Create the organization
    const { data: organizations, error: createError } = await api
      .from('organizations')
      .insert({
        name,
        description
      })
      .select()

    if (createError) throw createError
    if (!organizations?.[0]) throw new Error('Failed to create organization')
    const organization = organizations[0]

    // Add the creating user as an admin
    const { error: memberError } = await api
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        profile_id: user.id,
        organization_role: 'admin'
      } as OrganizationMemberRow)

    if (memberError) throw memberError

    return organization as Organization
  },

  async getOrganizations(): Promise<Organization[]> {
    const { user } = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // First get organizations with members
    const { data: organizations, error: orgsError } = await api
      .from('organizations')
      .select('*, organization_members!inner(*)')
      .eq('organization_members.profile_id', user.id)

    if (orgsError) throw orgsError
    if (!organizations?.length) return []

    // Then get organization members with profiles
    const { data: members, error: membersError } = await api
      .from('organization_members')
      .select('*, profile:user_profiles(*)')
      .in('organization_id', organizations.map(org => org.id))
      .eq('profile_id', user.id)

    if (membersError) throw membersError

    // Create a map for quick lookups
    const memberMap = new Map(members?.map(m => [m.organization_id, m]) || [])

    // Combine the data
    return organizations.map(org => ({
      ...org,
      organization_members: memberMap.has(org.id) ? [memberMap.get(org.id)!] : []
    })) as Organization[]
  },

  async getOrganization(id: string): Promise<Organization> {
    const { data: organizations, error } = await api
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!organizations) throw new Error('Organization not found')
    
    return organizations as Organization
  },

  async getOrganizationMembers(
    organizationId: string,
    userType: 'worker' | 'customer'
  ): Promise<OrganizationMemberWithProfile[]> {
    const { data: members, error } = await api
      .from('organization_members')
      .select('*, profile:user_profiles(*)')
      .eq('organization_id', organizationId)
      .eq('profile.user_type', userType)

    if (error) throw error
    return (members || []) as OrganizationMemberWithProfile[]
  },

  async getOrganizationTickets(organizationId: string): Promise<OrganizationTicket[]> {
    const { data: tickets, error } = await api
      .from('tickets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (tickets || []) as OrganizationTicket[]
  },

  async getAvailableUsers(userType: 'worker' | 'customer') {
    const { data: users, error } = await api
      .from('user_profiles')
      .select('*')
      .eq('user_type', userType)
      .eq('is_active', true)
      .order('full_name', { ascending: true })

    if (error) throw error
    return users || []
  },

  async addOrganizationMembers({ 
    organizationId, 
    userIds, 
    role 
  }: { 
    organizationId: string
    userIds: string[]
    role: 'admin' | 'member' | 'customer'
  }) {
    // Add members one by one to avoid type issues with bulk insert
    for (const userId of userIds) {
      const { error } = await api
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          profile_id: userId,
          organization_role: role
        } as OrganizationMemberRow)

      if (error) throw error
    }
  }
} 