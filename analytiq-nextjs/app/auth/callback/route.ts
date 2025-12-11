import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const signup = requestUrl.searchParams.get('signup')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)
    
    // If this was a signup, add flag to redirect URL
    if (signup === 'true' || (data.user && data.user.created_at === data.user.updated_at)) {
      const redirectUrl = new URL('/', requestUrl.origin)
      redirectUrl.searchParams.set('new_signup', 'true')
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}

