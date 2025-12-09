import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeStudy } from '@/lib/services/analysisService'
import { AnalysisRequest } from '@/lib/types/analysis'

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

    const body: AnalysisRequest = await request.json()
    const { inputType, content } = body

    if (!inputType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: inputType and content' },
        { status: 400 }
      )
    }

    // Call your existing analysis service
    const result = await analyzeStudy({ inputType, content })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}

