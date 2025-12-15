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
import Footer from '@/components/Footer'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin')
  const [authModalMessage, setAuthModalMessage] = useState<string | null>(null)
  const [forceShowOnboarding, setForceShowOnboarding] = useState(false)
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding(user, forceShowOnboarding)

  useEffect(() => {
    // Only initialize Supabase on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    // Check if redirected from OAuth signup or email confirmation
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('new_signup') === 'true') {
      sessionStorage.setItem('analytiq-just-signed-up', 'true')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    // Handle email confirmation
    const emailConfirmed = urlParams.get('email_confirmed')
    const emailConfirmation = urlParams.get('email_confirmation')
    const message = urlParams.get('message')

    try {
      const supabase = createClient()
      
      // Check auth state
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle email confirmation after checking session
        if (emailConfirmed) {
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname)
          
          if (emailConfirmed === 'success') {
            if (session?.user) {
              // User is automatically signed in after email confirmation
              // Always show onboarding for email confirmations (new users)
              sessionStorage.setItem('analytiq-just-signed-up', 'true')
            } else {
              // User needs to sign in after email confirmation
              // Mark that they just confirmed email - this will trigger onboarding after sign in
              if (emailConfirmation === 'true') {
                sessionStorage.setItem('analytiq-email-just-confirmed', 'true')
              }
              setAuthModalTab('signin')
              setAuthModalMessage(message || 'Email confirmed! Please sign in to continue.')
              setAuthModalOpen(true)
            }
          } else if (emailConfirmed === 'error') {
            // Show error message in login modal
            setAuthModalTab('signin')
            setAuthModalMessage(message || 'There was an issue confirming your email. Please try signing in.')
            setAuthModalOpen(true)
          }
        }
      })

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        // Track new signups - check if user was just created
        if (event === 'SIGNED_IN' && session?.user) {
          // Check if email was just confirmed (user signed in after email confirmation)
          const emailJustConfirmed = sessionStorage.getItem('analytiq-email-just-confirmed') === 'true'
          
          if (emailJustConfirmed) {
            // User just confirmed email and signed in - show onboarding
            sessionStorage.removeItem('analytiq-email-just-confirmed')
            sessionStorage.setItem('analytiq-just-signed-up', 'true')
          } else {
            // Check if this is a new user (created_at equals updated_at indicates new account)
            const userCreatedAt = new Date(session.user.created_at).getTime()
            const userUpdatedAt = new Date(session.user.updated_at || session.user.created_at).getTime()
            // If created very recently (within last 5 seconds), treat as new signup
            const isNewUser = Math.abs(userCreatedAt - userUpdatedAt) < 5000 && 
                              Date.now() - userCreatedAt < 10000
            
            if (isNewUser) {
              sessionStorage.setItem('analytiq-just-signed-up', 'true')
            }
          }
        }
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

  const handleAuthRequired = () => {
    setAuthModalTab('signup')
    setAuthModalOpen(true)
  }

  return (
    <AnalysisProvider user={user} onAuthRequired={handleAuthRequired}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex flex-col">
        <Header 
          user={user} 
          onSignInClick={handleSignInClick}
          onSignUpClick={handleSignUpClick}
          onShowOnboarding={() => setForceShowOnboarding(true)}
        />
        <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl flex-1">
          <Hero />
          <InputSection />
          <ResultsSection />
        </main>
        <Footer />
        <AuthModal 
          open={authModalOpen} 
          onOpenChange={(open) => {
            setAuthModalOpen(open)
            if (!open) {
              setAuthModalMessage(null) // Clear message when modal closes
            }
          }}
          defaultTab={authModalTab}
          initialMessage={authModalMessage}
        />
        {(showOnboarding || forceShowOnboarding) && (
          <Onboarding 
            onComplete={() => {
              completeOnboarding()
              setForceShowOnboarding(false)
            }} 
        />
        )}
      </div>
    </AnalysisProvider>
  )
}
