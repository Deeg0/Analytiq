'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { Home, HelpCircle, BookOpen } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface HeaderProps {
  user?: any
  onSignInClick?: () => void
  onSignUpClick?: () => void
  onShowOnboarding?: () => void
}

export default function Header({ user, onSignInClick, onSignUpClick, onShowOnboarding }: HeaderProps) {
  const supabase = createClient()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
    }
  }

  const handleShowOnboarding = () => {
    // Remove onboarding completion for current user so they can see it again
    if (user?.id) {
      localStorage.removeItem(`analytiq-onboarding-completed-${user.id}`)
    } else {
      // For anonymous users, remove global completion flag
      localStorage.removeItem('analytiq-onboarding-completed')
    }
    // Trigger onboarding to show directly without reload
    if (onShowOnboarding) {
      onShowOnboarding()
    }
  }

  return (
    <header className="border-b border-border/50 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
              <Image 
                src="/assets/AnalytIQlogo.png" 
                alt="AnalytIQ Logo" 
                width={64} 
                height={64}
                className="h-10 sm:h-14 md:h-16 w-auto drop-shadow-lg relative z-10"
              />
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold tracking-tight leading-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Analyt<span className="text-primary">IQ</span>
            </h1>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {!isHomePage && (
              <Link href="/">
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>
            )}
            {isHomePage && (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-9 w-9"
                onClick={handleShowOnboarding}
                title="Show onboarding tour"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
            {user && (
              <>
                <Link href="/saved">
                  <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-auto sm:px-3">
                    <BookOpen className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Saved</span>
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground hidden md:inline max-w-[120px] truncate">
                  {user.email}
                </span>
              </>
            )}
            {user ? (
              <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs sm:text-sm">
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            ) : (
              <>
                <Button onClick={onSignInClick} variant="outline" size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">In</span>
                </Button>
                <Button onClick={onSignUpClick} size="sm" className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Up</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

