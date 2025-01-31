import { supabase } from '@/config/supabase/client'
import { User } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

type Tables = Database['public']['Tables']
type OrganizationMember = Tables['organization_members']['Row']

export interface AuthResponse {
  user: User | null
  session: any | null
  error?: Error
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  profileType: string
}

export const auth = {
  getUser: async (): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.getUser()
    return {
      user: data?.user || null,
      session: null,
      error: error || undefined
    }
  },

  getSession: async (): Promise<AuthResponse> => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return {
      user: session?.user || null,
      session,
      error: error || undefined
    }
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { user, session, error: error || undefined }
  },

  signUp: async ({ email, password, fullName, profileType }: SignUpData): Promise<AuthResponse> => {
    // Sign up with Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          user_type: profileType
        }
      }
    })

    if (signUpError) {
      return { user: null, session: null, error: signUpError }
    }

    if (!signUpData.user?.id) {
      return { 
        user: null, 
        session: null, 
        error: new Error('User creation failed') 
      }
    }

    try {
      // Update the profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: fullName,
          user_type: profileType 
        })
        .eq('id', signUpData.user.id)

      if (updateError) throw updateError

      // Add user to organization
      const organizationRole = profileType === 'customer' ? 'customer' : 'admin'
      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          profile_id: signUpData.user.id,
          organization_id: 'd7a2c49c-f34d-4c5b-8d54-d123f229a86d', // GAUNTLET_AI_ORG_ID
          organization_role: organizationRole
        } satisfies Partial<OrganizationMember>)

      if (insertError) throw insertError

      return {
        user: signUpData.user,
        session: signUpData.session,
        error: undefined
      }
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error : new Error('Failed to create user profile')
      }
    }
  },

  signOut: async (): Promise<void> => {
    await supabase.auth.signOut()
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  }
} 