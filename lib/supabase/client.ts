import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

// For client-side usage (browser) with SSR support
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Simple client for client components (when you don't need SSR cookie handling)
export function getSupabaseClient() {
  // Access environment variables directly - Next.js exposes NEXT_PUBLIC_* vars to the browser
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
    )
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

