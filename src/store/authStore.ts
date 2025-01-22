import { create } from 'zustand'
import { supabase } from '@/config/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
  setSession: (session: any | null) => void
  setIsLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  },
  signUp: async (email: string, password: string, fullName: string) => {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })
    if (signUpError) throw signUpError

    // Update the profile directly since the trigger might not have access to the metadata
    if (signUpData.user?.id) {
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', signUpData.user.id)

      if (updateError) throw updateError
    }
  },
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, session: null })
  },
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading })
})) 