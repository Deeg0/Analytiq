import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const signup = requestUrl.searchParams.get('signup')
  const type = requestUrl.searchParams.get('type') // Supabase adds 'type' param for email confirmation

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    // Check if this is an email confirmation
    const isEmailConfirmation = type === 'signup' || type === 'email'
    
    if (error) {
      // If there's an error, redirect to login with a message
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('email_confirmed', 'error')
      redirectUrl.searchParams.set('message', 'There was an issue confirming your email. Please try signing in.')
      return NextResponse.redirect(redirectUrl)
    }
    
    // If session exists, user is automatically signed in
    if (data.session) {
      // If this was a signup or email confirmation, add flag to redirect URL
      // Email confirmation always means it's a new user who should see onboarding
      if (signup === 'true' || isEmailConfirmation || (data.user && data.user.created_at === data.user.updated_at)) {
        const redirectUrl = new URL('/', requestUrl.origin)
        redirectUrl.searchParams.set('email_confirmed', 'success')
        redirectUrl.searchParams.set('new_signup', 'true')
        // Also add a flag specifically for email confirmation
        if (isEmailConfirmation) {
          redirectUrl.searchParams.set('email_confirmation', 'true')
        }
        return NextResponse.redirect(redirectUrl)
      }
      
      // Regular sign in - redirect to home
      return NextResponse.redirect(new URL('/', requestUrl.origin))
    } else {
      // No session created - redirect to login with message
      // This happens when email confirmation doesn't auto-sign-in
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('email_confirmed', 'success')
      redirectUrl.searchParams.set('email_confirmation', 'true')
      redirectUrl.searchParams.set('message', 'Email confirmed! Please sign in to continue.')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

