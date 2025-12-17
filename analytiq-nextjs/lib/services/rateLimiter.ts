/**
 * Rate limiting service
 * Prevents abuse and controls API costs
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'

// Rate limit configuration
export const RATE_LIMITS = {
  '/api/analyze': {
    requests: 20, // 20 requests
    windowMinutes: 60, // per hour
  },
  default: {
    requests: 100, // 100 requests
    windowMinutes: 60, // per hour
  },
} as const

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: Date
  limit: number
}

/**
 * Check and enforce rate limit for a user
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  const supabase = await createClient()
  
  const config = RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default
  const limit = config.requests
  const windowMinutes = config.windowMinutes
  
  // Calculate window start (current hour)
  const now = new Date()
  const windowStart = new Date(now)
  windowStart.setMinutes(0, 0, 0) // Round down to start of hour
  
  try {
    // Get or create rate limit record
    const { data: existing, error: fetchError } = await supabase
      .from('rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .eq('window_start', windowStart.toISOString())
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      logger.error('Rate limit check failed', fetchError, { userId, endpoint })
      // Fail open - allow request if we can't check rate limit
      return {
        allowed: true,
        remaining: limit,
        resetAt: new Date(windowStart.getTime() + windowMinutes * 60 * 1000),
        limit,
      }
    }

    if (existing) {
      // Check if limit exceeded
      if (existing.request_count >= limit) {
        const resetAt = new Date(windowStart.getTime() + windowMinutes * 60 * 1000)
        return {
          allowed: false,
          remaining: 0,
          resetAt,
          limit,
        }
      }

      // Increment count
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({
          request_count: existing.request_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (updateError) {
        logger.error('Rate limit update failed', updateError, { userId, endpoint })
      }

      return {
        allowed: true,
        remaining: limit - existing.request_count - 1,
        resetAt: new Date(windowStart.getTime() + windowMinutes * 60 * 1000),
        limit,
      }
    } else {
      // Create new rate limit record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          user_id: userId,
          endpoint,
          request_count: 1,
          window_start: windowStart.toISOString(),
        })

      if (insertError) {
        logger.error('Rate limit insert failed', insertError, { userId, endpoint })
        // Fail open
        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: new Date(windowStart.getTime() + windowMinutes * 60 * 1000),
          limit,
        }
      }

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: new Date(windowStart.getTime() + windowMinutes * 60 * 1000),
        limit,
      }
    }
  } catch (error) {
    logger.error('Rate limit check exception', error, { userId, endpoint })
    // Fail open - allow request if rate limiting fails
    return {
      allowed: true,
      remaining: limit,
      resetAt: new Date(windowStart.getTime() + windowMinutes * 60 * 1000),
      limit,
    }
  }
}

/**
 * Clean up old rate limit records (older than 24 hours)
 */
export async function cleanupOldRateLimits(): Promise<void> {
  const supabase = await createClient()
  const yesterday = new Date()
  yesterday.setHours(yesterday.getHours() - 24)

  const { error } = await supabase
    .from('rate_limits')
    .delete()
    .lt('window_start', yesterday.toISOString())

  if (error) {
    logger.error('Rate limit cleanup failed', error)
  }
}
