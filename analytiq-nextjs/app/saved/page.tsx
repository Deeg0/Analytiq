'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, ExternalLink, Loader2 } from 'lucide-react'
import { AnalysisResult } from '@/lib/types/analysis'
import ResultsSection from '@/components/ResultsSection'
import { AnalysisContext } from '@/lib/contexts/AnalysisContext'

interface SavedAnalysis {
  id: string
  title: string
  analysis_data: AnalysisResult
  created_at: string
  updated_at: string
}

export default function SavedAnalysesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
      setLoading(false)
      fetchSavedAnalyses()
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const fetchSavedAnalyses = async () => {
    setFetching(true)
    setError(null)
    try {
      const response = await fetch('/api/saved-analyses')
      if (!response.ok) {
        throw new Error('Failed to fetch saved analyses')
      }
      const data = await response.json()
      setSavedAnalyses(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load saved analyses')
    } finally {
      setFetching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved analysis?')) {
      return
    }

    try {
      const response = await fetch(`/api/saved-analyses/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete analysis')
      }

      setSavedAnalyses(savedAnalyses.filter(a => a.id !== id))
      if (selectedAnalysis && savedAnalyses.find(a => a.id === id)?.analysis_data === selectedAnalysis) {
        setSelectedAnalysis(null)
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete analysis')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (selectedAnalysis) {
    return (
      <SavedAnalysisViewer 
        analysis={selectedAnalysis} 
        user={user}
        onBack={() => setSelectedAnalysis(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header user={user} />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Saved Analyses</h1>
          <p className="text-muted-foreground">View and manage your saved study analyses</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {fetching ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : savedAnalyses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No saved analyses yet.</p>
              <Button onClick={() => router.push('/')} variant="outline">
                Analyze a Study
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedAnalyses.map((saved) => (
              <Card key={saved.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="mb-2">{saved.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Saved {formatDate(saved.created_at)}</span>
                        {saved.analysis_data?.trustScore && (
                          <Badge variant="outline">
                            Score: {saved.analysis_data.trustScore.overall}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedAnalysis(saved.analysis_data)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDelete(saved.id)}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {saved.analysis_data?.metadata && (
                  <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {saved.analysis_data.metadata.title && (
                        <p><strong>Title:</strong> {saved.analysis_data.metadata.title}</p>
                      )}
                      {saved.analysis_data.metadata.authors && saved.analysis_data.metadata.authors.length > 0 && (
                        <p><strong>Authors:</strong> {saved.analysis_data.metadata.authors.slice(0, 3).join(', ')}
                          {saved.analysis_data.metadata.authors.length > 3 && '...'}
                        </p>
                      )}
                      {saved.analysis_data.metadata.journal && (
                        <p><strong>Journal:</strong> {saved.analysis_data.metadata.journal}</p>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

// Component to display a saved analysis
function SavedAnalysisViewer({ 
  analysis, 
  user,
  onBack 
}: { 
  analysis: AnalysisResult
  user: any
  onBack: () => void
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header user={user} />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            onClick={onBack}
            variant="outline"
            className="gap-2"
          >
            ← Back to Saved Analyses
          </Button>
        </div>
        <AnalysisContext.Provider value={{
          loading: false,
          results: analysis,
          error: null,
          analyzeUrl: async () => {},
          analyzeText: async () => {},
          saveAnalysis: async () => ({ success: false, error: 'Cannot save from saved view' }),
          saving: false,
        }}>
          <ResultsSection />
        </AnalysisContext.Provider>
      </main>
    </div>
  )
}
