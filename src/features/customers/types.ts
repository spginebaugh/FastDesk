import { Database } from '../../../types/database'

export type Customer = Database['public']['Tables']['user_profiles']['Row']

export type CustomerStatus = 'online' | 'offline' | 'away' 