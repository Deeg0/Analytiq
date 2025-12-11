import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisResult } from '@/lib/types/analysis'

// GET - Fetch all saved analyses for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved analyses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch saved analyses' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in GET /api/saved-analyses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved analyses' },
      { status: 500 }
    )
  }
}

// POST - Save a new analysis
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { title, analysisData } = body

    if (!analysisData) {
      return NextResponse.json(
        { error: 'Missing required field: analysisData' },
        { status: 400 }
      )
    }

    // Generate title from metadata if not provided
    const finalTitle = title || analysisData.metadata?.title || 
      `Analysis - ${new Date().toLocaleDateString()}`

    const { data, error } = await supabase
      .from('saved_analyses')
      .insert({
        user_id: session.user.id,
        title: finalTitle,
        analysis_data: analysisData,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving analysis:', error)
      return NextResponse.json(
        { error: 'Failed to save analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in POST /api/saved-analyses:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save analysis' },
      { status: 500 }
    )
  }
}
