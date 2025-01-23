import { Database } from '../../../types/database'

export type Customer = Database['public']['Tables']['user_profiles']['Row'] & {
  organizations: Array<{
    organization: {
      id: string
      name: string
    }
  }>
}

export type CustomerStatus = 'online' | 'offline' | 'away' 