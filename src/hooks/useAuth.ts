import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const isLoading = useAuthStore((state) => state.isLoading)
  const signIn = useAuthStore((state) => state.signIn)
  const signUp = useAuthStore((state) => state.signUp)
  const signOut = useAuthStore((state) => state.signOut)

  return { 
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user
  }
} 