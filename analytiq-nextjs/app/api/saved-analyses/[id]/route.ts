import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// DELETE - Delete a saved analysis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // First verify the analysis belongs to the user
    const { data: existing, error: fetchError } = await supabase
      .from('saved_analyses')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Analysis not found or unauthorized' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('saved_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Error deleting analysis:', error)
      return NextResponse.json(
        { error: 'Failed to delete analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/saved-analyses/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete analysis' },
      { status: 500 }
    )
  }
}

// PUT - Update a saved analysis (e.g., update title)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('saved_analyses')
      .update({ title })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating analysis:', error)
      return NextResponse.json(
        { error: 'Failed to update analysis' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error in PUT /api/saved-analyses/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update analysis' },
      { status: 500 }
    )
  }
}
