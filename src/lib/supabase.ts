// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../types/database.ts'

if (!import.meta.env.VITE_SUPABASE_URL) throw new Error('Missing env.VITE_SUPABASE_URL')
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) throw new Error('Missing env.VITE_SUPABASE_ANON_KEY')

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-application-name': 'fastdesk'
      }
    }
  }
)