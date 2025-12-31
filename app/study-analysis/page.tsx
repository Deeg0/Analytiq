"use client"

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { Suspense } from "react"
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
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  IconChartLine,
  IconUpload,
  IconFileText,
  IconChartBar,
  IconBrain,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
  IconBookmark,
  IconBookmarkFilled,
  IconLink,
} from "@tabler/icons-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useSearchParams } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

function StudyAnalysisContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(true)
  const [showHideDialog, setShowHideDialog] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [studyMetadata, setStudyMetadata] = useState<any>(null)
  const [urlInput, setUrlInput] = useState("")
  const [useUrl, setUseUrl] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Check localStorage on mount to see if "How It Works" should be hidden
  useEffect(() => {
    const hidePermanently = localStorage.getItem("hideHowItWorks-study-analysis")
    if (hidePermanently === "true") {
      setShowHowItWorks(false)
    }
  }, [])

  // Scroll to results when analysis is complete
  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [analysisResult])

  // Check for pending URL from search page
  useEffect(() => {
    const fromSearch = searchParams?.get("fromSearch")
    if (fromSearch === "true") {
      const pendingUrl = sessionStorage.getItem("pendingStudyUrl")
      const pendingMetadata = sessionStorage.getItem("pendingStudyMetadata")
      
      if (pendingUrl) {
        // Set URL and switch to URL mode
        setUrlInput(pendingUrl)
        setUseUrl(true)
        setShowHowItWorks(false)
        
        if (pendingMetadata) {
          try {
            const metadata = JSON.parse(pendingMetadata)
            setStudyMetadata(metadata)
          } catch (err) {
            console.error("Error parsing metadata:", err)
          }
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem("pendingStudyUrl")
        sessionStorage.removeItem("pendingStudyMetadata")
      } else {
        // Check for old format (pending analysis)
        const pendingData = sessionStorage.getItem("pendingStudyAnalysis")
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData)
            if (data.analysis) {
              // Set the analysis result
              setAnalysisResult(data.analysis)
              setStudyMetadata(data.studyMetadata)
              setShowHowItWorks(false)
              setIsSaved(false)
              // Clear sessionStorage
              sessionStorage.removeItem("pendingStudyAnalysis")
            }
          } catch (err) {
            console.error("Error loading pending analysis:", err)
          }
        }
      }
    }
  }, [searchParams])

  const handleFileSelect = (file: File) => {
    // Validate file type by extension (more reliable than MIME type)
    const fileName = file.name.toLowerCase()
    const validExtensions = [".pdf", ".txt"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      setError("Invalid file type. Please upload a PDF or TXT file.")
      return
    }

    // Validate file size (50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size exceeds 50MB limit.")
      return
    }

    if (file.size === 0) {
      setError("File is empty. Please select a valid file.")
      return
    }

    setSelectedFile(file)
    setError(null)
    setAnalysisResult(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleAnalyze = async () => {
    if (useUrl && urlInput.trim()) {
      // Analyze from URL
      setIsAnalyzing(true)
      setError(null)
      setAnalysisResult(null)

      try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-from-url`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: urlInput.trim(),
            title: studyMetadata?.title || null,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.analysis) {
          setAnalysisResult(data.analysis)
          setStudyMetadata(data.source || {})
          setIsSaved(false)
          setShowHowItWorks(false)
        } else {
          throw new Error("No analysis received from server")
        }
      } catch (err) {
        console.error("Error analyzing study from URL:", err)
        setError(err instanceof Error ? err.message : "Failed to analyze study from URL. Please try again.")
      } finally {
        setIsAnalyzing(false)
      }
      return
    }

    if (!selectedFile) {
      setError("Please select a file or enter a URL to analyze.")
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResult(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      console.log(`Sending request to: ${API_BASE_URL}/api/analyze-study`)
      const response = await fetch(`${API_BASE_URL}/api/analyze-study`, {
        method: "POST",
        body: formData,
      })

      console.log(`Response status: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error response:", errorData)
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", { 
        success: data.success, 
        hasAnalysis: !!data.analysis,
        analysisLength: data.analysis?.length || 0 
      })

      if (data.success && data.analysis) {
        console.log("Setting analysis result, length:", data.analysis.length)
        setAnalysisResult(data.analysis)
        setIsSaved(false) // Reset saved state when new analysis is done
      } else {
        console.error("Invalid response structure:", data)
        throw new Error("No analysis received from server")
      }
    } catch (err) {
      console.error("Error analyzing study:", err)
      setError(err instanceof Error ? err.message : "Failed to analyze study. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveStudy = async () => {
    if (!selectedFile || !analysisResult) {
      setError("No study to save. Please analyze a study first.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("You must be logged in to save studies.")
      }

      // Clean analysis text before saving
      const cleanedAnalysis = cleanAnalysisText(analysisResult)

      // Save to Supabase
      const { error: insertError } = await supabase
        .from('saved_studies')
        .insert({
          user_id: user.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          analysis_result: cleanedAnalysis,
          study_type: 'analysis',
        })

      if (insertError) {
        throw insertError
      }

      setIsSaved(true)
    } catch (err) {
      console.error("Error saving study:", err)
      setError(err instanceof Error ? err.message : "Failed to save study. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setAnalysisResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  // Helper to render text with bold formatting
  const renderBoldText = (text: string, key?: string) => {
    if (!text.includes('**')) return <span key={key}>{text}</span>
    const parts = text.split('**').filter(Boolean)
    return (
      <span key={key}>
        {parts.map((part, idx) => (
          <span key={idx} className={idx % 2 === 1 ? "font-semibold text-foreground" : ""}>
            {part}
          </span>
        ))}
      </span>
    )
  }

  // Helper to detect and render tables
  const renderTable = (lines: string[], startIndex: number) => {
    const tableLines: string[] = []
    let i = startIndex
    
    // Find where table starts and ends (collect consecutive lines with |)
    while (i < lines.length) {
      const line = lines[i]?.trim()
      // Stop if we hit a non-table line (but allow empty lines within table)
      if (line && !line.includes('|')) break
      if (line) tableLines.push(line)
      i++
    }
    
    if (tableLines.length < 2) return null
    
    // Parse table rows, filtering out separator rows (dash-only rows)
    const rows: string[][] = []
    for (const line of tableLines) {
      // Split by | and clean up cells (remove empty cells at start/end from markdown format)
      const rawCells = line.split('|').map(cell => cell.trim())
      // Remove empty cells at the start and end (markdown tables have these)
      const cells = rawCells.filter((cell, idx) => {
        if (idx === 0 || idx === rawCells.length - 1) {
          return cell.length > 0 // Keep first/last only if they have content
        }
        return true
      })
      
      // Skip separator rows (rows that are mostly dashes, colons, or empty)
      const isSeparatorRow = cells.every(cell => 
        cell.match(/^[\s-:]+$/) || cell.length === 0
      )
      
      if (!isSeparatorRow && cells.length > 0) {
        rows.push(cells)
      }
    }
    
    if (rows.length < 1) return null
    
    // First row is headers
    const headers = rows[0]
    const dataRows = rows.slice(1)
    
    // Ensure all rows have the same number of columns as headers
    const normalizedRows = dataRows.map(row => {
      const normalized = [...row]
      while (normalized.length < headers.length) {
        normalized.push('')
      }
      return normalized.slice(0, headers.length)
    })
    
    return (
      <div key={startIndex} className="overflow-x-auto my-6 rounded-lg border border-border bg-card shadow-sm">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {headers.map((header, idx) => (
                <th key={idx} className="px-4 py-3 text-left font-semibold text-sm text-foreground">
                  {renderBoldText(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-border/50 last:border-b-0 hover:bg-muted/20 transition-colors">
                {headers.map((_, cellIdx) => {
                  const cell = row[cellIdx] || ''
                  
                  // Check if cell contains risk level keywords
                  const riskKeywords = ['High', 'Low', 'Moderate', 'Some concerns', 'Unclear', 'Not applicable', 'Very Low']
                  const matchingKeyword = riskKeywords.find(keyword => 
                    cell.toLowerCase().includes(keyword.toLowerCase())
                  )
                  
                  let cellContent: React.ReactNode = renderBoldText(cell)
                  
                  // Style risk levels with badges (only if it's primarily the risk level)
                  if (matchingKeyword) {
                    // Check if the cell is mostly just the risk level (short or starts with it)
                    const cellLower = cell.toLowerCase()
                    const keywordLower = matchingKeyword.toLowerCase()
                    const isPrimarilyRiskLevel = 
                      cellLower === keywordLower ||
                      (cellLower.startsWith(keywordLower) && cell.length < 80) ||
                      (cell.length < 30 && cellLower.includes(keywordLower))
                    
                    if (isPrimarilyRiskLevel) {
                      const variant = 
                        matchingKeyword.toLowerCase().includes('high') || 
                        matchingKeyword.toLowerCase().includes('concerns') ||
                        matchingKeyword.toLowerCase().includes('very low')
                          ? 'destructive'
                          : matchingKeyword.toLowerCase().includes('moderate') || 
                            matchingKeyword.toLowerCase().includes('unclear')
                          ? 'outline'
                          : matchingKeyword.toLowerCase().includes('not applicable')
                          ? 'secondary'
                          : 'secondary'
                      cellContent = <Badge variant={variant} className="text-xs font-medium">{cell}</Badge>
                    }
                  }
                  
                  return (
                    <td key={cellIdx} className="px-4 py-3 text-sm text-foreground align-top">
                      {cellContent}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Helper to render list items
  const renderListItem = (item: string, index: number) => {
    const trimmed = item.trim()
    
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const text = trimmed.replace(/^[-*]\s+/, '')
      return (
        <div key={index} className="flex gap-3">
          <span className="text-muted-foreground mt-1">•</span>
          <div className="flex-1">{renderBoldText(text)}</div>
        </div>
      )
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s+(.+)/)
      if (match) {
        return (
          <div key={index} className="flex gap-3">
            <span className="text-muted-foreground font-medium mt-1">{match[1]}</span>
            <div className="flex-1">{renderBoldText(match[2])}</div>
          </div>
        )
      }
    }
    if (trimmed) {
      // Check for standalone risk level labels (e.g., "Low" on its own line before text)
      const riskKeywords = ['High', 'Low', 'Moderate', 'Some concerns', 'Unclear', 'Not applicable']
      if (riskKeywords.some(keyword => trimmed === keyword || trimmed.startsWith(keyword + ' '))) {
        const level = riskKeywords.find(kw => trimmed.toLowerCase().includes(kw.toLowerCase()))
        if (level && trimmed.length < 100) {
          const variant = 
            level.toLowerCase().includes('high') || level.toLowerCase().includes('concerns')
              ? 'destructive'
              : level.toLowerCase().includes('moderate') || level.toLowerCase().includes('unclear')
              ? 'outline'
              : level.toLowerCase().includes('not applicable')
              ? 'secondary'
              : 'secondary'
          return (
            <div key={index} className="flex items-start gap-2">
              <Badge variant={variant} className="mt-0.5">{level}</Badge>
            </div>
          )
        }
      }
      
      // Check for risk/certainty badges
      const riskMatch = trimmed.match(/\b(High|Low|Moderate|Very Low|Some concerns|Unclear)\s+(risk|certainty)/i)
      if (riskMatch) {
        const level = riskMatch[1]
        const variant = 
          level.toLowerCase().includes('high') || level.toLowerCase().includes('very low') || level.toLowerCase().includes('concerns')
            ? 'destructive'
            : level.toLowerCase().includes('moderate') || level.toLowerCase().includes('unclear')
            ? 'outline'
            : 'secondary'
        const rest = trimmed.replace(riskMatch[0], '').trim()
        return (
          <div key={index} className="flex items-start gap-2 flex-wrap">
            <Badge variant={variant} className="mt-0.5">{level}</Badge>
            {rest && <span className="flex-1">{renderBoldText(rest)}</span>}
          </div>
        )
      }
      return <p key={index} className="text-muted-foreground leading-relaxed">{renderBoldText(trimmed)}</p>
    }
    return null
  }

  // Helper to clean analysis text by removing unwanted prefixes
  const cleanAnalysisText = (text: string): string => {
    let cleaned = text.trim()
    
    // Remove "Analysis of the Study:" and similar prefixes (but keep everything after)
    cleaned = cleaned
      .replace(/^Analysis of the Study[:\s]*["']?[^"']*["']?\s*/i, '')
      .replace(/^Analysis:\s*/i, '')
      .trim()
    
    // Find the position of the first ## section header and keep everything from there onwards
    const firstSectionMatch = cleaned.match(/^## \d+\.\s+/m)
    if (firstSectionMatch) {
      const firstSectionIndex = cleaned.indexOf(firstSectionMatch[0])
      if (firstSectionIndex > 0) {
        // Remove any text before the first section header
        cleaned = cleaned.substring(firstSectionIndex).trim()
      }
    } else {
      // Fallback: find first ## section header (any format)
      const firstAnySectionMatch = cleaned.match(/^## /m)
      if (firstAnySectionMatch) {
        const firstSectionIndex = cleaned.indexOf(firstAnySectionMatch[0])
        if (firstSectionIndex > 0) {
          cleaned = cleaned.substring(firstSectionIndex).trim()
        }
      }
    }
    
    return cleaned
  }

  // Component to render formatted analysis
  const renderAnalysis = (text: string) => {
    console.log("renderAnalysis called with text length:", text.length)
    const cleanedText = cleanAnalysisText(text)
    console.log("After cleanAnalysisText, length:", cleanedText.length)
    const sections = cleanedText.split(/(?=^## )/m).filter(Boolean)
    console.log("Number of sections found:", sections.length)
    
    if (sections.length === 0) {
      console.error("No sections found after cleaning!")
      console.log("Cleaned text:", cleanedText.substring(0, 500))
    }
    
    return (
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => {
          const lines = section.trim().split('\n')
          const titleLine = lines[0]?.trim()
          if (!titleLine?.startsWith('## ')) return null
          
          const mainTitle = titleLine.replace(/^## /, '').trim()
          const sectionNumber = mainTitle.match(/^\d+\./)?.[0]?.replace('.', '')
          const cleanTitle = mainTitle.replace(/^\d+\.\s*/, '')
          
          // Extract subsections and content
          const content: string[] = []
          const subsections: { title: string; content: string[] }[] = []
          let currentSubsection: { title: string; content: string[] } | null = null
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i]
            if (line.trim().startsWith('### ')) {
              if (currentSubsection) {
                subsections.push(currentSubsection)
              }
              currentSubsection = {
                title: line.replace(/^### /, '').trim(),
                content: []
              }
            } else if (currentSubsection) {
              currentSubsection.content.push(line)
            } else if (line.trim()) {
              content.push(line)
            }
          }
          if (currentSubsection) {
            subsections.push(currentSubsection)
          }
          
          return (
            <Card key={sectionIndex} className="overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  {sectionNumber && (
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {sectionNumber}
                    </span>
                  )}
                  <span>{cleanTitle}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {subsections.length > 0 ? (
                  subsections.map((subsection, idx) => {
                    // Process content to handle tables
                    const processedContent: React.ReactNode[] = []
                    let i = 0
                    
                    while (i < subsection.content.length) {
                      const line = subsection.content[i]?.trim() || ''
                      
                      // Check if this line starts a table
                      if (line.includes('|')) {
                        const tableResult = renderTable(subsection.content, i)
                        if (tableResult) {
                          processedContent.push(tableResult)
                          // Skip all table lines
                          while (i < subsection.content.length && subsection.content[i]?.trim().includes('|')) {
                            i++
                          }
                          continue
                        }
                      }
                      
                      // Regular content
                      const result = renderListItem(subsection.content[i], i)
                      if (result) {
                        processedContent.push(result)
                      }
                      i++
                    }
                    
                    return (
                      <div key={idx} className="space-y-3">
                        <h4 className="font-semibold text-base text-foreground">
                          {subsection.title}
                        </h4>
                        <div className="space-y-2">
                          {processedContent}
                        </div>
                        {idx < subsections.length - 1 && <Separator className="my-4" />}
                      </div>
                    )
                  })
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const processedContent: React.ReactNode[] = []
                      let i = 0
                      
                      while (i < content.length) {
                        const line = content[i]?.trim() || ''
                        
                        // Check if this line starts a table
                        if (line.includes('|')) {
                          const tableResult = renderTable(content, i)
                          if (tableResult) {
                            processedContent.push(tableResult)
                            // Skip all table lines
                            while (i < content.length && content[i]?.trim().includes('|')) {
                              i++
                            }
                            continue
                          }
                        }
                        
                        // Regular content
                        const result = renderListItem(content[i], i)
                        if (result) {
                          processedContent.push(result)
                        }
                        i++
                      }
                      
                      return processedContent
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
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
                    Study Analysis
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Analyze Your Research Study
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Upload your scientific study (PDF or TXT) and get comprehensive AI-powered analysis with risk of bias assessment, statistical validity review, and GRADE certainty evaluation.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              <div className={`grid grid-cols-1 gap-6 ${showHowItWorks ? 'lg:grid-cols-3' : ''}`}>
                {/* Upload Section */}
                <Card className={showHowItWorks ? "lg:col-span-2" : ""}>
                  <CardHeader>
                    <CardTitle>Upload Your Study</CardTitle>
                    <CardDescription>
                      Upload your research study file or paste a URL for analysis. Supported formats: PDF, TXT. Note: Only URLs are supported (not DOI or PDF links).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* URL Input Option */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {!useUrl ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUseUrl(true)
                              setSelectedFile(null)
                              if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                            className="gap-2"
                          >
                            <IconLink className="h-4 w-4" />
                            Use URL Instead
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setUseUrl(false)
                              setUrlInput("")
                            }}
                          >
                            Use File Instead
                          </Button>
                        )}
                      </div>
                      {useUrl && (
                        <div className="space-y-2">
                          <Label htmlFor="url-input">Enter Study URL</Label>
                          <Input
                            id="url-input"
                            type="text"
                            placeholder="https://pubmed.ncbi.nlm.nih.gov/12345678 or https://example.com/study"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isAnalyzing}
                            className="font-mono text-sm"
                          />
                          <p className="text-xs text-muted-foreground">
                            Only URLs are supported (not DOI or PDF links). Paste the study page URL (e.g., PubMed page URL).
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Upload Area */}
                    {!useUrl && (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? "border-primary bg-primary/5"
                          : selectedFile
                          ? "border-muted-foreground/25"
                          : "border-muted-foreground/25 hover:border-primary/50 cursor-pointer"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={(e) => {
                        if (!selectedFile && !isAnalyzing) {
                          fileInputRef.current?.click()
                        }
                      }}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.txt,application/pdf,text/plain"
                        onChange={handleFileInputChange}
                        className="hidden"
                        disabled={isAnalyzing}
                      />
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <IconUpload className="h-6 w-6 text-primary" />
                        </div>
                        {selectedFile ? (
                          <div className="space-y-2 w-full">
                            <div className="flex items-center justify-center gap-2">
                              <IconFileText className="h-5 w-5 text-primary" />
                              <span className="font-medium">{selectedFile.name}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveFile()
                                }}
                                className="ml-2 text-muted-foreground hover:text-destructive"
                                disabled={isAnalyzing}
                              >
                                <IconX className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(selectedFile.size)}
                            </p>
                          </div>
                        ) : (
                        <div className="space-y-2">
                            <h3 className="font-medium">Drag and drop your file here</h3>
                          <p className="text-sm text-muted-foreground">
                            or click to browse
                          </p>
                        </div>
                        )}
                        {!selectedFile && (
                          <Button
                            variant="outline"
                            className="mt-2"
                            type="button"
                            disabled={isAnalyzing}
                            onClick={(e) => {
                              e.stopPropagation()
                              fileInputRef.current?.click()
                            }}
                          >
                            Select File
                        </Button>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Maximum file size: 50MB
                        </p>
                      </div>
                    </div>
                    )}

                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleAnalyze}
                      disabled={(useUrl ? !urlInput.trim() : !selectedFile) || isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Spinner className="h-4 w-4 mr-2" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                      <IconBrain className="h-4 w-4 mr-2" />
                          Analyze Study
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Info Card */}
                {showHowItWorks && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle>How It Works</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHideDialog(true)}
                        className="h-8 w-8 p-0"
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <IconUpload className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                          <h4 className="font-medium text-sm">Upload Study</h4>
                        <p className="text-xs text-muted-foreground">
                            Upload your scientific study in PDF or TXT format.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <IconBrain className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">AI Analysis</h4>
                        <p className="text-xs text-muted-foreground">
                            Our AI analyzes your study using Cochrane Handbook, RoB 2, ROBINS-I/ROBINS-E, Newcastle-Ottawa Scale, GRADE, and PICO/PECO frameworks.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                        <IconChartBar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">View Results</h4>
                        <p className="text-xs text-muted-foreground">
                            Review comprehensive analysis reports and assessments.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                )}
                {!showHowItWorks && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowHowItWorks(true)
                        localStorage.removeItem("hideHowItWorks-study-analysis")
                      }}
                      className="gap-2"
                    >
                      <IconInfoCircle className="h-4 w-4" />
                      Show How It Works
                    </Button>
                  </div>
                )}
              </div>

              {/* Hide Permanently Dialog */}
              <AlertDialog open={showHideDialog} onOpenChange={setShowHideDialog}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hide "How It Works"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Would you like to hide this section permanently? You can always show it again using the "Show How It Works" button.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setShowHowItWorks(false)
                        localStorage.setItem("hideHowItWorks-study-analysis", "true")
                        setShowHideDialog(false)
                      }}
                    >
                      Hide Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Analysis Results */}
              {analysisResult && (
                <div ref={resultsRef} className="mt-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight mb-2">Analysis Results</h2>
                      <p className="text-muted-foreground">
                        Comprehensive evidence-based analysis of your study
                      </p>
                    </div>
                    <Button
                      onClick={handleSaveStudy}
                      disabled={isSaving || isSaved}
                      variant={isSaved ? "outline" : "default"}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Spinner className="h-4 w-4" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <IconBookmarkFilled className="h-4 w-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <IconBookmark className="h-4 w-4" />
                          Save Study
                        </>
                      )}
                    </Button>
                  </div>
                  {renderAnalysis(analysisResult)}
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function StudyAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <StudyAnalysisContent />
    </Suspense>
  )
}
