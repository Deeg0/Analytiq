'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getSavedStudies, deleteSavedStudy, type SavedStudy } from '@/app/actions/studies'
import { AnalysisProvider } from '@/lib/contexts/AnalysisContext'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ResultsSection from '@/components/ResultsSection'
import { useAnalysis } from '@/lib/contexts/AnalysisContext'

function SavedStudiesContent() {
  const { setResults } = useAnalysis()
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([])
  const [loadingStudies, setLoadingStudies] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudy, setSelectedStudy] = useState<SavedStudy | null>(null)

  useEffect(() => {
    loadSavedStudies()
  }, [])

  const loadSavedStudies = async () => {
    setLoadingStudies(true)
    setError(null)
    try {
      const studies = await getSavedStudies()
      setSavedStudies(studies)
    } catch (err: any) {
      setError(err.message || 'Failed to load saved studies')
    } finally {
      setLoadingStudies(false)
    }
  }

  const handleSelectStudy = (study: SavedStudy) => {
    setSelectedStudy(study)
    // Load the study results into the context
    setResults(study.analysis_result, study.input_type as 'url' | 'text', study.input_content)
  }

  const handleDelete = async (studyId: string) => {
    if (!confirm('Are you sure you want to delete this saved study?')) {
      return
    }

    try {
      await deleteSavedStudy(studyId)
      setSavedStudies(savedStudies.filter(s => s.id !== studyId))
      if (selectedStudy?.id === studyId) {
        setSelectedStudy(null)
        setResults(null)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete study')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loadingStudies ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : savedStudies.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No saved studies yet.</p>
            <Link href="/">
              <Button>Analyze Your First Study</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Saved Studies List */}
          <div className="lg:col-span-1 space-y-4">
            {savedStudies.map((study) => (
              <Card
                key={study.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedStudy?.id === study.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleSelectStudy(study)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {study.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(study.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge variant="outline" className="text-xs">
                      {study.input_type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(study.created_at)}
                    </span>
                  </div>
                  {study.analysis_result?.trustScore && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          Score: {study.analysis_result.trustScore.overall}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            study.analysis_result.trustScore.overall >= 80
                              ? 'border-green-500 text-green-600'
                              : study.analysis_result.trustScore.overall >= 60
                              ? 'border-yellow-500 text-yellow-600'
                              : study.analysis_result.trustScore.overall >= 40
                              ? 'border-orange-500 text-orange-600'
                              : 'border-red-500 text-red-600'
                          }
                        >
                          {study.analysis_result.trustScore.rating}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Selected Study Details */}
          <div className="lg:col-span-2">
            {selectedStudy ? (
              <div>
                <Card className="mb-4">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="mb-2">{selectedStudy.title}</CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{selectedStudy.input_type.toUpperCase()}</Badge>
                          <span className="text-sm text-muted-foreground">
                            Saved {formatDate(selectedStudy.created_at)}
                          </span>
                        </div>
                      </div>
                      {selectedStudy.input_type === 'url' && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <a
                            href={selectedStudy.input_content}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Open URL
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                </Card>
                {/* Render the analysis results using ResultsSection */}
                <ResultsSection />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Select a study from the list to view its analysis
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default function SavedStudiesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }

    const supabase = createClient()
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (!session) {
        router.push('/')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <AnalysisProvider user={user}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <Header user={user} />
        <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Saved Studies</h1>
            <p className="text-muted-foreground">
              View and manage your saved study analyses
            </p>
          </div>
          <SavedStudiesContent />
        </main>
      </div>
    </AnalysisProvider>
  )
}
