import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'
import { AnalysisRequest } from '@/lib/types/analysis'

export async function POST(request: NextRequest) {
  try {
    // Check authentication with error handling
    let supabase
    try {
      supabase = await createClient()
    } catch (supabaseError: any) {
      console.error('Supabase client creation error:', supabaseError)
      return NextResponse.json(
        { error: 'Authentication service error', details: supabaseError.message },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    let session
    try {
      const sessionResult = await supabase.auth.getSession()
      session = sessionResult.data?.session
    } catch (sessionError: any) {
      console.error('Session check error:', sessionError)
      return NextResponse.json(
        { error: 'Session check failed', details: sessionError.message },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    let body: AnalysisRequest
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { inputType, content } = body

    if (!inputType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: inputType and content' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Call your existing analysis service with timeout protection
    let result
    try {
      result = await analyzeStudy({ inputType, content })
    } catch (analysisError: any) {
      console.error('Analysis service error:', analysisError)
      console.error('Error stack:', analysisError.stack)
      return NextResponse.json(
        { 
          error: 'Analysis failed', 
          details: analysisError.message || 'Unknown error occurred',
          type: analysisError.name || 'Error'
        },
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Unexpected error in API route:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    // Ensure we always return JSON, even on errors
    return NextResponse.json(
      { 
        error: 'An unknown error has occurred',
        details: error.message || 'No error details available',
        type: error.name || 'Error'
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

