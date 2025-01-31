import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { auth } from '@/config/api/auth'

interface AuthState {
  user: User | null
  session: any | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, profileType: string) => Promise<void>
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
    const { error } = await auth.signIn(email, password)
    if (error) throw error
  },
  signUp: async (email: string, password: string, fullName: string, profileType: string) => {
    const { error } = await auth.signUp({
      email,
      password,
      fullName,
      profileType
    })
    if (error) throw error
  },
  signOut: async () => {
    await auth.signOut()
    set({ user: null, session: null })
  },
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setIsLoading: (isLoading) => set({ isLoading })
})) 