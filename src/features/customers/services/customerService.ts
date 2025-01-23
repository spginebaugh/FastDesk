import { supabase } from '../../../config/supabase/client'
import { Customer } from '../types'

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    // Get current user's organizations
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // Get user's organization memberships
    const { data: userOrgs, error: orgsError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', userProfile.user.id)

    if (orgsError) throw new Error(orgsError.message)

    // If user has no organizations, return empty array
    if (!userOrgs.length) return []

    const organizationIds = userOrgs.map(org => org.organization_id)

    // Get customers from user's organizations
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organizations:organization_members!inner(
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('user_type', 'customer')
      .in('organization_members.organization_id', organizationIds)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data as Customer[]
  },

  async getCustomer(customerId: string): Promise<Customer> {
    // Get current user's organizations
    const { data: userProfile } = await supabase.auth.getUser()
    if (!userProfile.user) throw new Error('Not authenticated')

    // Get user's organization memberships
    const { data: userOrgs, error: orgsError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', userProfile.user.id)

    if (orgsError) throw new Error(orgsError.message)

    // If user has no organizations, return empty array
    if (!userOrgs.length) throw new Error('No access to this customer')

    const organizationIds = userOrgs.map(org => org.organization_id)

    // Get customer only if they belong to one of the user's organizations
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organizations:organization_members!inner(
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('id', customerId)
      .in('organization_members.organization_id', organizationIds)
      .single()

    if (error) throw error
    return data as Customer
  }
} 