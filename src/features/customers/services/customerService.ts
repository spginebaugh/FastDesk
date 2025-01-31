import { api } from '@/config/api/client'
import { auth } from '@/config/api/auth'
import { Customer } from '../types'

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    // Get current user's profile
    const { user } = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get user's organization memberships
    const { data: userOrgs, error: orgsError } = await api
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', user.id)

    if (orgsError) throw orgsError
    if (!userOrgs?.length) return []

    const organizationIds = userOrgs.map(org => org.organization_id)

    // Get customers from user's organizations
    const { data: customers, error: customersError } = await api
      .from('user_profiles')
      .select(`
        *,
        organization_members!inner(
          *,
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('user_type', 'customer')
      .in('organization_members.organization_id', organizationIds)

    if (customersError) throw customersError

    // Transform the data to match the Customer type
    return (customers || []).map(customer => ({
      ...customer,
      organizations: customer.organization_members.map(member => ({
        organization: member.organization
      }))
    })) as Customer[]
  },

  async getCustomer(customerId: string): Promise<Customer> {
    // Get current user's profile
    const { user } = await auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get user's organization memberships
    const { data: userOrgs, error: orgsError } = await api
      .from('organization_members')
      .select('organization_id')
      .eq('profile_id', user.id)

    if (orgsError) throw orgsError
    if (!userOrgs?.length) throw new Error('No access to this customer')

    const organizationIds = userOrgs.map(org => org.organization_id)

    // Get customer only if they belong to one of the user's organizations
    const { data: customer, error: customerError } = await api
      .from('user_profiles')
      .select(`
        *,
        organization_members!inner(
          *,
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('id', customerId)
      .in('organization_members.organization_id', organizationIds)
      .single()

    if (customerError) throw customerError
    if (!customer) throw new Error('Customer not found')
    
    // Transform the data to match the Customer type
    return {
      ...customer,
      organizations: customer.organization_members.map(member => ({
        organization: member.organization
      }))
    } as Customer
  }
} 