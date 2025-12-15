import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'
import { AnalysisRequest } from '@/lib/types/analysis'

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing')
      return NextResponse.json(
        { error: 'Server configuration error: OpenAI API key not set' },
        { status: 500 }
      )
    }

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
    // Ensure we always return JSON, even on errors
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

