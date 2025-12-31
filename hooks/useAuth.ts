"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"

export function useAuth(redirectToOnboarding: boolean = true) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check if user has completed onboarding using our dedicated flag
          // This distinguishes from Google-provided data
          const onboardingCompleted = session.user.user_metadata?.onboarding_completed === true
          if (onboardingCompleted) {
            setIsAuthenticated(true)
            setIsLoading(false)
          } else {
            // User is authenticated but hasn't completed onboarding
            setIsAuthenticated(false)
            setIsLoading(false)
            if (redirectToOnboarding) {
              router.push('/onboarding')
            }
          }
        } else {
          // No session - user is not authenticated
          setIsAuthenticated(false)
          setIsLoading(false)
          if (redirectToOnboarding) {
            router.push('/onboarding')
          }
        }
      } catch (err) {
        console.error('Auth check error:', err)
        setIsAuthenticated(false)
        setIsLoading(false)
        if (redirectToOnboarding) {
          router.push('/onboarding')
        }
      }
    }

    checkAuth()
  }, [router, redirectToOnboarding])

  return { isAuthenticated, isLoading }
}

