"use client"

import * as React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  IconSearch,
  IconFileText,
  IconExternalLink,
  IconAlertCircle,
  IconDatabase,
  IconBook,
  IconChartLine,
  IconTableExport,
  IconBookmark,
  IconLoader,
  IconX,
} from "@tabler/icons-react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface Study {
  pmid?: string | null
  title: string | null
  authors: string[] | null
  journal: string | null
  year: string | null
  doi: string | null
  citationCount: number | null
  paperUrl: string | null
  semanticScholarId?: string | null
  source?: string | null
  arxivId?: string | null
  biorxivId?: string | null
  openAlexId?: string | null
}

interface SearchResults {
  clinicalStudies: Study[]
  academicContext: Study[]
  query: string
  totalResults: number
  sources?: {
    pubmed?: number
    semanticScholar?: number
    openAlex?: number
    arxiv?: number
    biorxiv?: number
  }
}


export default function DocumentationPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<SearchResults | null>(null)
  const [savingStudy, setSavingStudy] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("")
  const [currentResultCount, setCurrentResultCount] = useState<number>(3)
  const MAX_RESULTS = 20

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) {
      setError("Please enter a search query")
      return
    }

    setIsSearching(true)
    setError(null)
    setResults(null)
    setCurrentSearchQuery(searchQuery.trim())
    setCurrentResultCount(3)

    try {
      // Initially fetch only 3 results to save time
      const response = await fetch(
        `${API_BASE_URL}/api/search-studies?q=${encodeURIComponent(searchQuery.trim())}&maxPubMed=3&maxRelated=0&maxOpenAlex=0&maxArXiv=0&maxBioRxiv=0`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResults({
          clinicalStudies: data.clinicalStudies || [],
          academicContext: data.academicContext || [],
          query: data.query || searchQuery,
          totalResults: data.totalResults || 0,
          sources: data.sources || {},
        })
      } else {
        throw new Error("No results received from server")
      }
    } catch (err) {
      console.error("Error searching studies:", err)
      setError(err instanceof Error ? err.message : "Failed to search studies. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleShowMore = async () => {
    if (!currentSearchQuery || !results) return

    const nextCount = Math.min(currentResultCount + 3, MAX_RESULTS)
    if (nextCount === currentResultCount) return // Already at max

    setIsLoadingMore(true)
    setError(null)

    try {
      // Fetch next batch of results (3 more, up to max)
      const response = await fetch(
        `${API_BASE_URL}/api/search-studies?q=${encodeURIComponent(currentSearchQuery)}&maxPubMed=${nextCount}&maxRelated=0&maxOpenAlex=0&maxArXiv=0&maxBioRxiv=0&cache=false`
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        setResults({
          clinicalStudies: data.clinicalStudies || [],
          academicContext: data.academicContext || [],
          query: data.query || currentSearchQuery,
          totalResults: data.totalResults || 0,
          sources: data.sources || {},
        })
        setCurrentResultCount(nextCount)
      } else {
        throw new Error("No results received from server")
      }
    } catch (err) {
      console.error("Error loading more studies:", err)
      setError(err instanceof Error ? err.message : "Failed to load more studies. Please try again.")
    } finally {
      setIsLoadingMore(false)
    }
  }

  const formatAuthors = (authors: string[] | null) => {
    if (!authors || authors.length === 0) return "Unknown authors"
    if (authors.length === 1) return authors[0]
    if (authors.length <= 3) return authors.join(", ")
    return `${authors.slice(0, 3).join(", ")}, et al.`
  }

  const handleAnalyzeStudy = async (study: Study) => {
    // Prioritize paperUrl, then PubMed link (the link the PubMed button would take you to)
    let urlToUse = study.paperUrl
    if (!urlToUse && study.pmid) {
      urlToUse = `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`
    }

    if (!urlToUse) {
      setError("No URL available for this study. Please ensure the study has a paper URL or PubMed ID.")
      return
    }

    // Store URL in sessionStorage and navigate to analysis page
    sessionStorage.setItem("pendingStudyUrl", urlToUse)
    sessionStorage.setItem("pendingStudyMetadata", JSON.stringify({
      title: study.title,
      authors: study.authors,
      journal: study.journal,
      year: study.year,
      doi: study.doi,
      pmid: study.pmid,
      citationCount: study.citationCount,
      paperUrl: study.paperUrl,
      source: study.source,
    }))
    
    router.push("/study-analysis?fromSearch=true")
  }

  const handleExtractData = async (study: Study) => {
    // Prioritize paperUrl, then PubMed link (the link the PubMed button would take you to)
    let urlToUse = study.paperUrl
    if (!urlToUse && study.pmid) {
      urlToUse = `https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`
    }

    if (!urlToUse) {
      setError("No URL available for this study. Please ensure the study has a paper URL or PubMed ID.")
      return
    }

    // Store URL in sessionStorage and navigate to extraction page
    sessionStorage.setItem("pendingExtractionUrl", urlToUse)
    sessionStorage.setItem("pendingExtractionMetadata", JSON.stringify({
      title: study.title,
      authors: study.authors,
      journal: study.journal,
      year: study.year,
      doi: study.doi,
      pmid: study.pmid,
      citationCount: study.citationCount,
      paperUrl: study.paperUrl,
      source: study.source,
    }))
    
    router.push("/data-extraction?fromSearch=true")
  }

  const handleSaveStudy = async (study: Study) => {
    setSavingStudy(study.doi || study.pmid || study.title || "unknown")
    
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("You must be logged in to save studies")
      }

      // Create a study metadata entry
      // Note: This saves metadata only. For full analysis, user needs to analyze the study first
      const studyMetadata = {
        user_id: user.id,
        file_name: study.title || "Untitled Study",
        file_size: null,
        analysis_result: JSON.stringify({
          metadata: {
            title: study.title,
            authors: study.authors,
            journal: study.journal,
            year: study.year,
            doi: study.doi,
            pmid: study.pmid,
            citationCount: study.citationCount,
            paperUrl: study.paperUrl,
            source: study.source,
          },
          note: "This is a saved study from search results. Analyze the study to get a full analysis.",
        }),
      }

      const { error: insertError } = await supabase
        .from("saved_studies")
        .insert([studyMetadata])

      if (insertError) {
        throw insertError
      }

      // Show success message
      setError(null)
      // You could add a toast notification here
    } catch (err) {
      console.error("Error saving study:", err)
      setError(err instanceof Error ? err.message : "Failed to save study")
    } finally {
      setSavingStudy(null)
    }
  }

  const StudyCard = ({ study, isClinical = true }: { study: Study; isClinical?: boolean }) => {
    return (
      <Card className="transition-all hover:shadow-md hover:border-primary/20">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base mb-2 break-words whitespace-normal">
                  {study.title || "Untitled"}
                </CardTitle>
            <div className="flex flex-wrap gap-2 mb-2">
              {study.source && (
                <Badge variant="secondary" className="text-xs">
                  {study.source}
                </Badge>
              )}
              {isClinical && study.pmid && (
                <Badge variant="secondary" className="text-xs">
                  <IconDatabase className="h-3 w-3 mr-1" />
                  PMID: {study.pmid}
                </Badge>
              )}
              {study.doi && (
                <Badge variant="outline" className="text-xs">
                  DOI: {study.doi.substring(0, 20)}{study.doi.length > 20 ? '...' : ''}
                </Badge>
              )}
              {study.citationCount !== null && study.citationCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {study.citationCount.toLocaleString()} citations
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          {study.authors && study.authors.length > 0 && (
            <div>
              <span className="text-muted-foreground">Authors: </span>
              <span className="break-words whitespace-normal">{formatAuthors(study.authors)}</span>
            </div>
          )}
          {study.journal && (
            <div>
              <span className="text-muted-foreground">Journal: </span>
              <span className="break-words whitespace-normal">{study.journal}</span>
            </div>
          )}
          {study.year && (
            <div>
              <span className="text-muted-foreground">Year: </span>
              <span>{study.year}</span>
            </div>
          )}
          <div className="space-y-2 pt-2">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2">
              {(study.paperUrl || study.doi) && (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAnalyzeStudy(study)}
                    className="text-xs"
                  >
                    <IconChartLine className="h-3 w-3 mr-1" />
                    Analyze
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleExtractData(study)}
                    className="text-xs"
                  >
                    <IconTableExport className="h-3 w-3 mr-1" />
                    Extract
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveStudy(study)}
                disabled={savingStudy !== null}
                className="text-xs col-span-2"
              >
                {savingStudy === (study.doi || study.pmid || study.title) ? (
                  <>
                    <IconLoader className="h-3 w-3 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconBookmark className="h-3 w-3 mr-1" />
                    Save to Library
                  </>
                )}
              </Button>
            </div>
            
            {/* External Links */}
            <div className="flex gap-2 pt-1">
              {study.paperUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 text-xs"
                >
                  <a href={study.paperUrl} target="_blank" rel="noopener noreferrer">
                    <IconExternalLink className="h-3 w-3 mr-1" />
                    View Paper
                  </a>
                </Button>
              )}
              {study.pmid && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1 text-xs"
                >
                  <a
                    href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconFileText className="h-3 w-3 mr-1" />
                    PubMed
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    )
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {/* Header Section */}
            <div className="px-4 pt-6 pb-4 md:px-6 lg:pt-8 lg:pb-6">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Study Search
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Find Research Studies
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                  Search across multiple databases including PubMed, Semantic Scholar, OpenAlex, arXiv, and bioRxiv/medRxiv for comprehensive research coverage.
                  </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {/* Search Form */}
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1 relative">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search for studies (e.g., 'diabetes treatment', 'cancer prevention')"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        disabled={isSearching}
                        className="pl-10"
                      />
                    </div>
                    <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                      {isSearching ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <IconSearch className="h-4 w-4 mr-2" />
                          Search
                        </>
                      )}
                    </Button>
                  </form>
                  </CardContent>
                </Card>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Results */}
              {results && (
                <div className="space-y-6">
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    Search Results
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Found {results.totalResults} studies for "{results.query}"
                  </p>
                  {results.sources && Object.keys(results.sources).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {results.sources.pubmed > 0 && (
                        <Badge variant="outline" className="text-xs">
                          PubMed: {results.sources.pubmed}
                        </Badge>
                      )}
                      {results.sources.semanticScholar > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Semantic Scholar: {results.sources.semanticScholar}
                        </Badge>
                      )}
                      {results.sources.openAlex > 0 && (
                        <Badge variant="outline" className="text-xs">
                          OpenAlex: {results.sources.openAlex}
                        </Badge>
                      )}
                      {results.sources.arxiv > 0 && (
                        <Badge variant="outline" className="text-xs">
                          arXiv: {results.sources.arxiv}
                        </Badge>
                      )}
                      {results.sources.biorxiv > 0 && (
                        <Badge variant="outline" className="text-xs">
                          bioRxiv/medRxiv: {results.sources.biorxiv}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>

                  {/* Clinical Studies (from PubMed) */}
                  {results.clinicalStudies.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <IconDatabase className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Clinical Studies (PubMed)</h3>
                        <Badge variant="secondary">{results.clinicalStudies.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.clinicalStudies.map((study, idx) => (
                          <StudyCard key={study.pmid || `clinical-${idx}`} study={study} isClinical={true} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Academic Context (from Semantic Scholar) */}
                  {results.academicContext.length > 0 && (
                    <div>
                      {results.clinicalStudies.length > 0 && <Separator className="my-6" />}
                      <div className="flex items-center gap-2 mb-4">
                        <IconBook className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Related Academic Papers</h3>
                        <Badge variant="secondary">{results.academicContext.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {results.academicContext.map((study, idx) => (
                          <StudyCard key={study.semanticScholarId || `academic-${idx}`} study={study} isClinical={false} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Show More Button */}
                  {results && (results.clinicalStudies.length > 0 || results.academicContext.length > 0) && (
                    <div className="flex justify-center pt-6">
                      {currentResultCount >= MAX_RESULTS ? (
                        <div className="text-sm text-muted-foreground">
                          Maximum results reached ({MAX_RESULTS})
                        </div>
                      ) : (
                        <Button
                          onClick={handleShowMore}
                          disabled={isLoadingMore}
                          size="lg"
                          variant="outline"
                          className="gap-2"
                        >
                          {isLoadingMore ? (
                            <>
                              <Spinner className="h-4 w-4" />
                              Loading More...
                            </>
                          ) : (
                            <>
                              <IconSearch className="h-4 w-4" />
                              Show More
                            </>
                          )}
                  </Button>
                      )}
                    </div>
                  )}

                  {/* No Results */}
                  {results.totalResults === 0 && (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No studies found. Try a different search query.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Empty State */}
              {!results && !isSearching && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">
                      Search for research studies
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Enter keywords, topics, or study titles to find relevant papers from multiple academic databases.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
