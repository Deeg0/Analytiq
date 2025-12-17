/**
 * Input sanitization utilities
 * Prevents XSS and validates user inputs
 */

import validator from 'validator'

// Simple HTML tag stripper for server-side (no DOM needed)
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, '')
}

// Simple XSS prevention - remove potentially dangerous characters
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
}

// Maximum input sizes
export const MAX_INPUT_SIZES = {
  url: 2048, // 2KB for URLs
  text: 500000, // ~500KB for text (roughly 100k words)
  pdf: 10 * 1024 * 1024, // 10MB for PDFs
  doi: 256, // 256 chars for DOI
} as const

/**
 * Sanitize and validate URL
 */
export function sanitizeUrl(url: string): { valid: boolean; sanitized: string; error?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, sanitized: '', error: 'URL is required' }
  }

  const trimmed = url.trim()

  if (trimmed.length > MAX_INPUT_SIZES.url) {
    return { valid: false, sanitized: '', error: 'URL is too long' }
  }

  // Validate URL format
  if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
    return { valid: false, sanitized: '', error: 'Invalid URL format. Must start with http:// or https://' }
  }

  // Sanitize URL (remove any potential XSS)
  const sanitized = sanitizeString(trimmed)

  return { valid: true, sanitized }
}

/**
 * Sanitize and validate text input
 */
export function sanitizeText(text: string): { valid: boolean; sanitized: string; error?: string } {
  if (!text || typeof text !== 'string') {
    return { valid: false, sanitized: '', error: 'Text is required' }
  }

  const trimmed = text.trim()

  if (trimmed.length < 100) {
    return { valid: false, sanitized: '', error: 'Text must be at least 100 characters' }
  }

  if (trimmed.length > MAX_INPUT_SIZES.text) {
    return { valid: false, sanitized: '', error: 'Text is too long' }
  }

  // Sanitize HTML but preserve text content
  const sanitized = stripHtmlTags(trimmed)

  return { valid: true, sanitized }
}

/**
 * Sanitize and validate DOI
 */
export function sanitizeDoi(doi: string): { valid: boolean; sanitized: string; error?: string } {
  if (!doi || typeof doi !== 'string') {
    return { valid: false, sanitized: '', error: 'DOI is required' }
  }

  const trimmed = doi.trim()

  if (trimmed.length > MAX_INPUT_SIZES.doi) {
    return { valid: false, sanitized: '', error: 'DOI is too long' }
  }

  // Basic DOI format validation (10.xxxx/xxxx)
  const doiPattern = /^10\.\d{4,}\/.+/
  if (!doiPattern.test(trimmed)) {
    return { valid: false, sanitized: '', error: 'Invalid DOI format' }
  }

  const sanitized = sanitizeString(trimmed)

  return { valid: true, sanitized }
}

/**
 * Validate PDF base64 content
 */
export function validatePdfContent(content: string): { valid: boolean; error?: string } {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'PDF content is required' }
  }

  try {
    const buffer = Buffer.from(content, 'base64')
    
    if (buffer.length === 0) {
      return { valid: false, error: 'Invalid PDF: Empty file' }
    }

    if (buffer.length > MAX_INPUT_SIZES.pdf) {
      return { valid: false, error: 'PDF file is too large (max 10MB)' }
    }

    // Check PDF magic bytes (%PDF)
    const pdfHeader = buffer.slice(0, 4).toString('ascii')
    if (pdfHeader !== '%PDF') {
      return { valid: false, error: 'Invalid PDF format' }
    }

    return { valid: true }
  } catch (error: any) {
    return { valid: false, error: `PDF validation failed: ${error.message}` }
  }
}

/**
 * Sanitize input based on type
 */
export function sanitizeInput(
  inputType: 'url' | 'text' | 'doi' | 'pdf',
  content: string
): { valid: boolean; sanitized: string; error?: string } {
  switch (inputType) {
    case 'url':
      return sanitizeUrl(content)
    case 'text':
      return sanitizeText(content)
    case 'doi':
      return sanitizeDoi(content)
    case 'pdf':
      const pdfValidation = validatePdfContent(content)
      if (!pdfValidation.valid) {
        return { valid: false, sanitized: '', error: pdfValidation.error }
      }
      return { valid: true, sanitized: content } // PDFs are base64, don't sanitize
    default:
      return { valid: false, sanitized: '', error: `Unsupported input type: ${inputType}` }
  }
}
