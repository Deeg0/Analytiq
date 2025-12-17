import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AnalysisRequest } from '@/lib/types/analysis'
import { analyzeStudy } from '@/lib/services/analysisService'

// Increase timeout for long-running AI analysis
export const maxDuration = 300 // 5 minutes
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    let body: AnalysisRequest
    try {
      body = await request.json()
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const { inputType, content } = body

    if (!inputType || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: inputType and content' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Create a ReadableStream for streaming responses
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        try {
          // Send initial status
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'status', message: 'Starting analysis...' })}\n\n`))
          
          // Start analysis (this will take time)
          const result = await analyzeStudy({ inputType, content })
          
          // Send progress updates
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', message: 'Analysis complete', progress: 100 })}\n\n`))
          
          // Send final result
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', data: result })}\n\n`))
          
          controller.close()
        } catch (error: any) {
          console.error('Streaming analysis error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: error.message || 'Analysis failed' })}\n\n`))
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Analysis failed',
        ...(process.env.NODE_ENV === 'development' && { 
          details: error.stack,
          code: error.code 
        })
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
