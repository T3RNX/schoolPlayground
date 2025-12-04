import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function useAuthRedirect(redirectIfAuthenticated = true) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (redirectIfAuthenticated && user) {
          router.replace("/")
          return
        }
        
        if (!redirectIfAuthenticated && !user) {
          router.replace("/auth/login")
          return
        }
      } catch (error) {
        console.error("Error checking auth:", error)
        if (!redirectIfAuthenticated) {
          router.replace("/auth/login")
        }
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [router, redirectIfAuthenticated])

  return { isCheckingAuth, user }
}