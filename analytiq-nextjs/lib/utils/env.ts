/**
 * Environment variable validation
 * Validates all required environment variables on startup
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
} as const

const optionalEnvVars = {
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS || '8000',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const

export function validateEnv() {
  const missing: string[] = []

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  }
}

// Validate on module load (only in server-side code)
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    console.error('Environment validation failed:', error)
    // Don't throw in development to allow for easier local development
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
  }
}
