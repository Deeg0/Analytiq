'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AnalysisProvider } from '@/lib/contexts/AnalysisContext'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import InputSection from '@/components/InputSection'
import ResultsSection from '@/components/ResultsSection'
import AuthModal from '@/components/AuthModal'
import Onboarding, { useOnboarding } from '@/components/Onboarding'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding()

  useEffect(() => {
    // Only initialize Supabase on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Check auth state
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error('Supabase initialization error:', error)
      setLoading(false)
    }
  }, [])

  const handleSignInClick = () => {
    setAuthModalTab('signin')
    setAuthModalOpen(true)
  }

  const handleSignUpClick = () => {
    setAuthModalTab('signup')
    setAuthModalOpen(true)
  }

  if (loading || onboardingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <AnalysisProvider user={user} onAuthRequired={() => setAuthModalOpen(true)}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Header 
          user={user} 
          onSignInClick={handleSignInClick}
          onSignUpClick={handleSignUpClick}
        />
        <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
          <Hero />
          <InputSection />
          <ResultsSection />
        </main>
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={setAuthModalOpen}
          defaultTab={authModalTab}
        />
        {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      </div>
    </AnalysisProvider>
  )
}
