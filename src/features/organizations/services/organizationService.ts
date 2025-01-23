import { supabase } from '@/config/supabase/client'
import { Organization, OrganizationMember } from '../types'

interface OrganizationMemberWithProfile extends OrganizationMember {
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    user_status: 'online' | 'offline' | 'away' | 'transfers_only'
  }
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
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // Start a transaction to create both the organization and add the creator as admin
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        description
      })
      .select()
      .single()

    if (orgError) throw new Error(orgError.message)

    // Add the creating user as an admin
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: organization.id,
        profile_id: userProfile.user.id,
        organization_role: 'admin'
      })

    if (memberError) throw new Error(memberError.message)

    return organization as Organization
  },

  async getOrganizations(): Promise<Organization[]> {
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        organization_members!left(
          organization_role,
          profile_id
        )
      `)
      .order('name')

    if (error) {
      throw new Error(error.message)
    }

    // Transform the data to include role information
    return data.map(org => ({
      ...org,
      organization_members: org.organization_members?.filter(
        member => member.profile_id === userProfile.user?.id
      ) || []
    })) as Organization[]
  },

  async getOrganization(id: string): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)
    return data as Organization
  },

  async getOrganizationMembers(
    organizationId: string,
    userType: 'agent' | 'customer'
  ): Promise<OrganizationMemberWithProfile[]> {
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        profile:user_profiles!inner(
          id,
          email,
          full_name,
          avatar_url,
          user_status
        )
      `)
      .eq('organization_id', organizationId)
      .eq('profile.user_type', userType)

    if (error) throw new Error(error.message)
    return data as unknown as OrganizationMemberWithProfile[]
  },

  async getOrganizationTickets(organizationId: string): Promise<OrganizationTicket[]> {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        id,
        title,
        ticket_status,
        ticket_priority,
        created_at,
        updated_at
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as OrganizationTicket[]
  },

  async getAvailableUsers(userType: 'agent' | 'customer') {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        id,
        email,
        full_name,
        avatar_url,
        user_status
      `)
      .eq('user_type', userType)
      .eq('is_active', true)
      .order('full_name')

    if (error) throw new Error(error.message)
    return data
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
    const { error } = await supabase
      .from('organization_members')
      .insert(
        userIds.map(userId => ({
          organization_id: organizationId,
          profile_id: userId,
          organization_role: role
        }))
      )

    if (error) throw new Error(error.message)
  }
} 