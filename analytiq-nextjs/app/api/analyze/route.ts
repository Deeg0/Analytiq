import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'
import { checkRateLimit } from '@/lib/services/rateLimiter'
import { logApiRequest, logUserActivity, logOpenAICost, calculateOpenAICost } from '@/lib/services/analytics'
import { validateAnalysisRequest, getClientIp, getUserAgent } from '@/lib/middleware/validation'
import { logger } from '@/lib/services/logger'
import { validateEnv } from '@/lib/utils/env'

// Increase timeout for long-running AI analysis (Railway allows up to 5 minutes)
export const maxDuration = 300 // 5 minutes in seconds
export const runtime = 'nodejs'

// Validate environment on module load
if (typeof window === 'undefined') {
  try {
    validateEnv()
  } catch (error) {
    logger.error('Environment validation failed', error)
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let requestId: string | null = null
  let userId: string | undefined

  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      const ip = getClientIp(request)
      const userAgent = getUserAgent(request)
      
      await logApiRequest({
        endpoint: '/api/analyze',
        method: 'POST',
        statusCode: 401,
        responseTimeMs: Date.now() - startTime,
        ipAddress: ip,
        userAgent,
      })

      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    userId = session.user.id

    // Log user activity
    await logUserActivity({
      userId,
      activityType: 'analysis_request',
      activityDetails: { endpoint: '/api/analyze' },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // Check rate limit
    const rateLimitResult = await checkRateLimit(userId, '/api/analyze')
    if (!rateLimitResult.allowed) {
      const resetSeconds = Math.ceil((rateLimitResult.resetAt.getTime() - Date.now()) / 1000)
      
      await logApiRequest({
        userId,
        endpoint: '/api/analyze',
        method: 'POST',
        statusCode: 429,
        responseTimeMs: Date.now() - startTime,
        errorMessage: 'Rate limit exceeded',
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      })

      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          limit: rateLimitResult.limit,
          resetAt: rateLimitResult.resetAt.toISOString(),
          retryAfter: resetSeconds,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
            'Retry-After': resetSeconds.toString(),
          },
        }
      )
    }

    // Validate and sanitize request
    const validationResult = await validateAnalysisRequest(request)
    if (!validationResult.valid) {
      requestId = await logApiRequest({
        userId,
        endpoint: '/api/analyze',
        method: 'POST',
        statusCode: validationResult.statusCode || 400,
        responseTimeMs: Date.now() - startTime,
        errorMessage: validationResult.error,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      })

      return NextResponse.json(
        { error: validationResult.error },
        { status: validationResult.statusCode || 400 }
      )
    }

    const { inputType, content } = validationResult.data!

    // Calculate request size
    const requestSizeBytes = Buffer.byteLength(JSON.stringify({ inputType, content }), 'utf8')

    // Call analysis service
    logger.info('Starting analysis', { userId, inputType })
    const analysisResult = await analyzeStudy({ inputType, content })
    const { result, tokenUsage } = analysisResult

    const responseTimeMs = Date.now() - startTime

    // Log successful API request
    requestId = await logApiRequest({
      userId,
      endpoint: '/api/analyze',
      method: 'POST',
      inputType,
      statusCode: 200,
      responseTimeMs,
      requestSizeBytes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // Log OpenAI costs if token usage is available
    if (tokenUsage && userId) {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
      const cost = calculateOpenAICost(
        model,
        tokenUsage.inputTokens,
        tokenUsage.outputTokens
      )

      await logOpenAICost({
        userId,
        requestId: requestId || undefined,
        model,
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        costUsd: cost,
      })

      logger.info('OpenAI cost logged', {
        userId,
        requestId: requestId || undefined,
        cost,
        tokens: tokenUsage.totalTokens,
      })
    }

    // Log user activity for successful analysis
    await logUserActivity({
      userId,
      activityType: 'analysis_completed',
      activityDetails: { 
        inputType,
        responseTimeMs,
        requestId,
        tokenUsage: tokenUsage?.totalTokens,
      },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': rateLimitResult.limit.toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
      },
    })
  } catch (error: any) {
    const responseTimeMs = Date.now() - startTime
    
    logger.error('Analysis error', error, {
      userId,
      endpoint: '/api/analyze',
      requestId: requestId || undefined,
    })

    // Log failed API request
    await logApiRequest({
      userId,
      endpoint: '/api/analyze',
      method: 'POST',
      statusCode: 500,
      responseTimeMs,
      errorMessage: error.message,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // Ensure we always return JSON, even on errors
    return NextResponse.json(
      { 
        error: error.message || 'Analysis failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.stack,
          code: error.code 
        })
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

