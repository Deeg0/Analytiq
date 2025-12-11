'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Trash2, ExternalLink, Loader2, Search, Calendar, TrendingUp } from 'lucide-react'
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
  const [filteredAnalyses, setFilteredAnalyses] = useState<SavedAnalysis[]>([])
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date')
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
      setFilteredAnalyses(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load saved analyses')
    } finally {
      setFetching(false)
    }
  }

  // Filter and sort analyses
  useEffect(() => {
    let filtered = [...savedAnalyses]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((analysis) => {
        const title = analysis.title?.toLowerCase() || ''
        const studyTitle = analysis.analysis_data?.metadata?.title?.toLowerCase() || ''
        const authors = analysis.analysis_data?.metadata?.authors?.join(' ')?.toLowerCase() || ''
        const journal = analysis.analysis_data?.metadata?.journal?.toLowerCase() || ''
        
        return title.includes(query) || 
               studyTitle.includes(query) || 
               authors.includes(query) || 
               journal.includes(query)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      } else {
        const scoreA = a.analysis_data?.trustScore?.overall || 0
        const scoreB = b.analysis_data?.trustScore?.overall || 0
        return scoreB - scoreA
      }
    })

    setFilteredAnalyses(filtered)
  }, [savedAnalyses, searchQuery, sortBy])

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
        setIsDialogOpen(false)
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
    })
  }

  const handleViewAnalysis = (analysis: AnalysisResult) => {
    setSelectedAnalysis(analysis)
    setIsDialogOpen(true)
  }

  // Scroll dialog content to top when it opens
  useEffect(() => {
    if (isDialogOpen) {
      // Small delay to ensure dialog content is rendered
      const timer = setTimeout(() => {
        const scrollContainer = document.querySelector('[data-slot="dialog-content"] .overflow-y-auto')
        if (scrollContainer) {
          scrollContainer.scrollTop = 0
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isDialogOpen])

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setSelectedAnalysis(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400 border-green-200'
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400 border-yellow-200'
    if (score >= 40) return 'text-orange-600 dark:text-orange-400 border-orange-200'
    return 'text-red-600 dark:text-red-400 border-red-200'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-950/20'
    if (score >= 60) return 'bg-yellow-50 dark:bg-yellow-950/20'
    if (score >= 40) return 'bg-orange-50 dark:bg-orange-950/20'
    return 'bg-red-50 dark:bg-red-950/20'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Header user={user} />
      <main className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 max-w-6xl">
        {/* Header Section */}
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
          <>
            {/* Search and Filter Bar */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, authors, or journal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={sortBy === 'date' ? 'default' : 'outline'}
                      onClick={() => setSortBy('date')}
                      className="gap-2"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4" />
                      Date
                    </Button>
                    <Button
                      variant={sortBy === 'score' ? 'default' : 'outline'}
                      onClick={() => setSortBy('score')}
                      className="gap-2"
                      size="sm"
                    >
                      <TrendingUp className="h-4 w-4" />
                      Score
                    </Button>
                  </div>
                </div>
                {searchQuery && (
                  <p className="text-sm text-muted-foreground mt-3">
                    Found {filteredAnalyses.length} {filteredAnalyses.length === 1 ? 'analysis' : 'analyses'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Analyses Grid */}
            {filteredAnalyses.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No analyses match your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAnalyses.map((saved) => {
                  const score = saved.analysis_data?.trustScore?.overall || 0
                  return (
                    <Card 
                      key={saved.id} 
                      className={`hover:shadow-lg transition-all cursor-pointer border-2 ${getScoreColor(score)}`}
                      onClick={() => handleViewAnalysis(saved.analysis_data)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="mb-2 line-clamp-2">{saved.title}</CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(saved.created_at)}</span>
                            </div>
                          </div>
                          {score > 0 && (
                            <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${getScoreBgColor(score)} border ${getScoreColor(score)} min-w-[60px]`}>
                              <span className="text-2xl font-bold">{score}</span>
                              <span className="text-xs">/100</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {saved.analysis_data?.metadata && (
                        <CardContent>
                          <div className="space-y-2">
                            {saved.analysis_data.metadata.title && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Study Title</p>
                                <p className="text-sm line-clamp-2">{saved.analysis_data.metadata.title}</p>
                              </div>
                            )}
                            {saved.analysis_data.metadata.authors && saved.analysis_data.metadata.authors.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Authors</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {saved.analysis_data.metadata.authors.slice(0, 2).join(', ')}
                                  {saved.analysis_data.metadata.authors.length > 2 && ` +${saved.analysis_data.metadata.authors.length - 2} more`}
                                </p>
                              </div>
                            )}
                            {saved.analysis_data.metadata.journal && (
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground mb-1">Journal</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">{saved.analysis_data.metadata.journal}</p>
                              </div>
                            )}
                            {saved.analysis_data.trustScore && (
                              <div className="pt-2 border-t">
                                <Badge variant="outline" className="text-xs">
                                  {saved.analysis_data.trustScore.rating}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      )}
                      <CardContent className="pt-0 pb-4">
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewAnalysis(saved.analysis_data)
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View Details
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(saved.id)
                            }}
                            variant="outline"
                            size="sm"
                            className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Analysis Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="line-clamp-2">
              {selectedAnalysis?.metadata?.title || 'Analysis Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4" id="dialog-scroll-container">
            {selectedAnalysis && (
              <AnalysisContext.Provider value={{
                loading: false,
                results: selectedAnalysis,
                error: null,
                analyzeUrl: async () => {},
                analyzeText: async () => {},
                saveAnalysis: async () => ({ success: false, error: 'Cannot save from saved view' }),
                saving: false,
                isSavedAnalysis: true, // Flag to hide save button
              }}>
                <ResultsSection />
              </AnalysisContext.Provider>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

