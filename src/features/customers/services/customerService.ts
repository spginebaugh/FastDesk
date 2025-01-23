import { supabase } from '../../../config/supabase/client'
import { Customer } from '../types'

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organizations:organization_members(
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('user_type', 'customer')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data as Customer[]
  },

  async getCustomer(customerId: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        organizations:organization_members(
          organization:organizations(
            id,
            name
          )
        )
      `)
      .eq('id', customerId)
      .single()

    if (error) throw error
    return data as Customer
  }
} 