import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'
import { AnalysisRequest } from '@/lib/types/analysis'

// Increase timeout for long-running AI analysis (Railway allows up to 5 minutes)
export const maxDuration = 300 // 5 minutes in seconds
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    let body: AnalysisRequest
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { inputType, content } = body

    if (!inputType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: inputType and content' },
        { status: 400 }
      )
    }

    // Call your existing analysis service
    const result = await analyzeStudy({ inputType, content })

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
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

