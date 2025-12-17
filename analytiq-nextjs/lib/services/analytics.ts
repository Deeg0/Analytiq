/**
 * Analytics and tracking service
 * Tracks API usage, costs, and user activity
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'

interface ApiRequestLog {
  userId?: string
  endpoint: string
  method: string
  inputType?: string
  statusCode: number
  responseTimeMs?: number
  requestSizeBytes?: number
  errorMessage?: string
  ipAddress?: string
  userAgent?: string
}

interface UserActivityLog {
  userId: string
  activityType: string
  activityDetails?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

interface OpenAICostLog {
  userId?: string
  requestId?: string
  model: string
  inputTokens: number
  outputTokens: number
  costUsd: number
}

/**
 * Log API request
 */
export async function logApiRequest(log: ApiRequestLog): Promise<string | null> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('api_requests')
      .insert({
        user_id: log.userId || null,
        endpoint: log.endpoint,
        method: log.method,
        input_type: log.inputType || null,
        status_code: log.statusCode,
        response_time_ms: log.responseTimeMs || null,
        request_size_bytes: log.requestSizeBytes || null,
        error_message: log.errorMessage || null,
        ip_address: log.ipAddress || null,
        user_agent: log.userAgent || null,
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to log API request', error, { endpoint: log.endpoint })
      return null
    }

    return data.id
  } catch (error) {
    logger.error('Exception logging API request', error, { endpoint: log.endpoint })
    return null
  }
}

/**
 * Log user activity
 */
export async function logUserActivity(log: UserActivityLog): Promise<void> {
  const supabase = await createClient()
  
  try {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert({
        user_id: log.userId,
        activity_type: log.activityType,
        activity_details: log.activityDetails || null,
        ip_address: log.ipAddress || null,
        user_agent: log.userAgent || null,
      })

    if (error) {
      logger.error('Failed to log user activity', error, { userId: log.userId, activityType: log.activityType })
    }
  } catch (error) {
    logger.error('Exception logging user activity', error, { userId: log.userId })
  }
}

/**
 * Log OpenAI API cost
 */
export async function logOpenAICost(log: OpenAICostLog): Promise<void> {
  const supabase = await createClient()
  
  try {
    // Insert cost record
    const { error: costError } = await supabase
      .from('openai_costs')
      .insert({
        user_id: log.userId || null,
        request_id: log.requestId || null,
        model: log.model,
        input_tokens: log.inputTokens,
        output_tokens: log.outputTokens,
        cost_usd: log.costUsd,
      })

    if (costError) {
      logger.error('Failed to log OpenAI cost', costError)
      return
    }

    // Update user analytics summary
    if (log.userId) {
      const { error: analyticsError } = await supabase.rpc('increment_user_analytics', {
        p_user_id: log.userId,
        p_cost_usd: log.costUsd,
      })

      if (analyticsError) {
        // If RPC doesn't exist, try direct update
        const { data: existing } = await supabase
          .from('user_analytics')
          .select('*')
          .eq('user_id', log.userId)
          .single()

        if (existing) {
          await supabase
            .from('user_analytics')
            .update({
              total_analyses: existing.total_analyses + 1,
              total_cost_usd: parseFloat(existing.total_cost_usd) + log.costUsd,
              last_analysis_at: new Date().toISOString(),
            })
            .eq('user_id', log.userId)
        } else {
          await supabase
            .from('user_analytics')
            .insert({
              user_id: log.userId,
              total_analyses: 1,
              total_cost_usd: log.costUsd,
              last_analysis_at: new Date().toISOString(),
            })
        }
      }
    }
  } catch (error) {
    logger.error('Exception logging OpenAI cost', error)
  }
}

/**
 * Calculate OpenAI cost based on model and tokens
 */
export function calculateOpenAICost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  // Pricing per 1M tokens (as of 2024)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'gpt-4': { input: 30.00, output: 60.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  }

  const modelPricing = pricing[model] || pricing['gpt-4o-mini']
  
  const inputCost = (inputTokens / 1_000_000) * modelPricing.input
  const outputCost = (outputTokens / 1_000_000) * modelPricing.output
  
  return inputCost + outputCost
}

/**
 * Get user analytics
 */
export async function getUserAnalytics(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_analytics')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    logger.error('Failed to get user analytics', error, { userId })
    return null
  }

  return data
}
