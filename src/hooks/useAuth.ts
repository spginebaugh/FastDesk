import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  return { user }
} 