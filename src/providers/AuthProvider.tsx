import { useEffect } from 'react'
import { auth } from '@/config/api/auth'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setSession, setIsLoading } = useAuthStore()

  useEffect(() => {
    // Set loading to true initially
    setIsLoading(true)

    // Check active session
    auth.getSession().then(({ session, user }) => {
      setSession(session)
      setUser(user)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((user) => {
      setUser(user)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [setUser, setSession, setIsLoading])

  return <>{children}</>
} 