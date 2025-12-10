'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

interface HeaderProps {
  user?: any
  onSignInClick?: () => void
  onSignUpClick?: () => void
}

export default function Header({ user, onSignInClick, onSignUpClick }: HeaderProps) {
  const supabase = createClient()

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await supabase.auth.signOut()
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              Analyt<span className="text-primary">IQ</span>
            </h1>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            {user && (
              <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline truncate max-w-[120px] sm:max-w-none">
                {user.email}
              </span>
            )}
            {user ? (
              <Button onClick={handleSignOut} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                Sign Out
              </Button>
            ) : (
              <>
                <Button onClick={onSignInClick} variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  Sign In
                </Button>
                <Button onClick={onSignUpClick} size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

