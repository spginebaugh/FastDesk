import { Database } from '@/types/database'
import { supabase } from '@/config/supabase/client'

export type Tables = Database['public']['Tables']

// Helper type for table names
export type TableName = keyof Database['public']['Tables']

// Export the typed Supabase client directly
export const api = supabase 