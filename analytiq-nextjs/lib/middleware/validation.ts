/**
 * Request validation middleware
 * Validates API requests before processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sanitizeInput, MAX_INPUT_SIZES } from '@/lib/utils/sanitize'
import { logger } from '@/lib/services/logger'

// Request body schema
const AnalysisRequestSchema = z.object({
  inputType: z.enum(['url', 'text', 'doi', 'pdf']),
  content: z.string().min(1),
})

/**
 * Validate request body size
 */
function validateRequestSize(request: NextRequest): { valid: boolean; error?: string } {
  const contentLength = request.headers.get('content-length')
  
  if (contentLength) {
    const sizeBytes = parseInt(contentLength, 10)
    const maxSize = 15 * 1024 * 1024 // 15MB total request size
    
    if (sizeBytes > maxSize) {
      return {
        valid: false,
        error: `Request body too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate and sanitize analysis request
 */
export async function validateAnalysisRequest(
  request: NextRequest
): Promise<{ valid: boolean; data?: any; error?: string; statusCode?: number }> {
  try {
    // Check request size
    const sizeCheck = validateRequestSize(request)
    if (!sizeCheck.valid) {
      return {
        valid: false,
        error: sizeCheck.error,
        statusCode: 413, // Payload Too Large
      }
    }

    // Parse JSON
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid JSON in request body',
        statusCode: 400,
      }
    }

    // Validate schema
    const validationResult = AnalysisRequestSchema.safeParse(body)
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return {
        valid: false,
        error: `Validation failed: ${errors}`,
        statusCode: 400,
      }
    }

    const { inputType, content } = validationResult.data

    // Sanitize and validate input
    const sanitizationResult = sanitizeInput(inputType, content)
    if (!sanitizationResult.valid) {
      return {
        valid: false,
        error: sanitizationResult.error || 'Input validation failed',
        statusCode: 400,
      }
    }

    return {
      valid: true,
      data: {
        inputType,
        content: sanitizationResult.sanitized,
      },
    }
  } catch (error: any) {
    logger.error('Request validation exception', error)
    return {
      valid: false,
      error: 'Request validation failed',
      statusCode: 500,
    }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIp || undefined
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}
