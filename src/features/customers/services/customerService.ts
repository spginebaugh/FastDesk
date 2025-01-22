import { supabase } from '../../../config/supabase/client'
import { Customer } from '../types'

export const customerService = {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_type', 'customer')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return data
  },

  async getCustomer(customerId: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) throw error
    return data
  }
} 