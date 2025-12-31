"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Spinner } from "@/components/ui/spinner"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          // Check if user has completed onboarding using our dedicated flag
          // This distinguishes from Google-provided data
          const onboardingCompleted = session.user.user_metadata?.onboarding_completed === true
          if (onboardingCompleted) {
            router.push('/dashboard')
          } else {
            router.push('/onboarding')
          }
        } else {
          router.push('/onboarding')
        }
      } catch (err) {
        console.error('Auth check error:', err)
        router.push('/onboarding')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner className="h-8 w-8" />
    </div>
  )
}