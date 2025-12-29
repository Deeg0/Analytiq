"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  IconFileText,
  IconTrash,
  IconEye,
  IconCalendar,
  IconDatabase,
} from "@tabler/icons-react"
import { createSupabaseClient } from "@/lib/supabase/client"

interface SavedStudy {
  id: string
  file_name: string
  file_size: number | null
  analysis_result: string
  created_at: string
  updated_at: string
}

export default function SavedStudiesPage() {
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSavedStudies()
  }, [])

  const fetchSavedStudies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/onboarding')
        return
      }

      // Fetch saved studies
      const { data, error: fetchError } = await supabase
        .from('saved_studies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setSavedStudies(data || [])
    } catch (err) {
      console.error("Error fetching saved studies:", err)
      setError(err instanceof Error ? err.message : "Failed to load saved studies.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStudy = async (studyId: string) => {
    if (!confirm("Are you sure you want to delete this saved study?")) {
      return
    }

    try {
      const supabase = createSupabaseClient()
      
      const { error: deleteError } = await supabase
        .from('saved_studies')
        .delete()
        .eq('id', studyId)

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      setSavedStudies(savedStudies.filter(study => study.id !== studyId))
    } catch (err) {
      console.error("Error deleting study:", err)
      setError(err instanceof Error ? err.message : "Failed to delete study.")
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateAnalysis = (analysis: string, maxLength: number = 200) => {
    if (analysis.length <= maxLength) return analysis
    return analysis.substring(0, maxLength) + "..."
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
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Saved Studies
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Your Saved Studies
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Access and manage your previously analyzed studies.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : savedStudies.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <IconDatabase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved studies yet</h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      Start analyzing studies to save them here for quick access later.
                    </p>
                    <Button asChild>
                      <Link href="/study-analysis">
                        Analyze a Study
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {savedStudies.map((study) => (
                    <Card key={study.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <IconFileText className="h-5 w-5 text-primary shrink-0" />
                            <CardTitle className="text-base truncate">{study.file_name}</CardTitle>
                          </div>
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <IconCalendar className="h-3 w-3" />
                          <span className="text-xs">{formatDate(study.created_at)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(study.file_size)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {truncateAnalysis(study.analysis_result)}
                        </p>
                        <Separator />
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              // Store analysis in sessionStorage to view it
                              sessionStorage.setItem('viewingAnalysis', JSON.stringify({
                                fileName: study.file_name,
                                analysis: study.analysis_result,
                              }))
                              router.push('/saved-studies/view')
                            }}
                          >
                            <IconEye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudy(study.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

