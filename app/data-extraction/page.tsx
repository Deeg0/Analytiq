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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  IconTableExport,
  IconUpload,
  IconFileText,
  IconDatabase,
  IconDownload,
  IconX,
  IconAlertCircle,
  IconCheck,
  IconLink,
} from "@tabler/icons-react"
import { useAuth } from "@/hooks/useAuth"
import { useSearchParams } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

interface ExtractedData {
  studyIdentification?: {
    title?: string
    authors?: string[]
    publicationYear?: string
    journal?: string
    doi?: string
  }
  studyDesign?: {
    studyType?: string
    setting?: string
    period?: string
  }
  participants?: {
    totalSampleSize?: number
    // RCT-specific
    interventionGroupSize?: number
    controlGroupSize?: number
    // Cohort-specific
    exposureGroupSize?: number
    unexposedGroupSize?: number
    // Case-control specific
    numberOfCases?: number
    numberOfControls?: number
    // Common fields
    ageRange?: string
    genderDistribution?: string
    inclusionCriteria?: string[]
    exclusionCriteria?: string[]
    baselineCharacteristics?: any
  }
  // RCT-specific
  interventions?: {
    interventionDescription?: string
    dosageTiming?: string
    comparator?: string
    followUpDuration?: string
  }
  // Observational study-specific
  exposures?: {
    exposureDescription?: string
    exposureMeasurement?: string
    confoundersAdjusted?: string[]
    matchingCriteria?: string[]
    followUpDuration?: string
  }
  outcomes?: {
    primaryOutcomes?: Array<{
      name?: string
      description?: string
      measurementMethod?: string
      timePoints?: string[]
    }>
    secondaryOutcomes?: Array<{
      name?: string
      description?: string
      measurementMethod?: string
      timePoints?: string[]
    }>
  }
  results?: {
    primaryOutcomes?: Array<{
      outcomeName?: string
      // RCT-specific
      interventionGroup?: any
      controlGroup?: any
      // Cohort-specific
      exposedGroup?: any
      unexposedGroup?: any
      // Case-control specific
      cases?: any
      controls?: any
      // Common
      effectSize?: string
      confidenceInterval?: string
      pValue?: string
      statisticalTest?: string
    }>
    secondaryOutcomes?: any[]
    // RCT-specific
    adverseEvents?: string
    attritionRate?: string
    // Cohort-specific
    lossToFollowUp?: string
    // Diagnostic study-specific
    sensitivity?: number
    specificity?: number
    ppv?: number // Positive Predictive Value
    npv?: number // Negative Predictive Value
    auc?: number // Area Under Curve
    // Meta-analysis specific
    pooledEffect?: string
    heterogeneity?: any
  }
  statisticalAnalysis?: {
    methods?: string[]
    software?: string
    sampleSizeCalculation?: string
  }
  funding?: {
    source?: string
    conflictsOfInterest?: string
    registrationNumber?: string
  }
}

function DataExtractionContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [useUrl, setUseUrl] = useState(false)
  const [studyMetadata, setStudyMetadata] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Scroll to results when extraction is complete
  useEffect(() => {
    if (extractedData && resultsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [extractedData])

  // Check for pending URL from search page
  useEffect(() => {
    const fromSearch = searchParams?.get("fromSearch")
    if (fromSearch === "true") {
      const pendingUrl = sessionStorage.getItem("pendingExtractionUrl")
      
      if (pendingUrl) {
        // Set URL and switch to URL mode
        setUrlInput(pendingUrl)
        setUseUrl(true)
        
        // Load metadata if available
        const metadataStr = sessionStorage.getItem("pendingExtractionMetadata")
        if (metadataStr) {
          try {
            const metadata = JSON.parse(metadataStr)
            setStudyMetadata(metadata)
          } catch (err) {
            console.error("Error parsing metadata:", err)
          }
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem("pendingExtractionUrl")
        sessionStorage.removeItem("pendingExtractionMetadata")
      } else {
        // Check for old format (pending extraction data)
        const pendingData = sessionStorage.getItem("pendingDataExtraction")
        if (pendingData) {
          try {
            const data = JSON.parse(pendingData)
            if (data.extractedData) {
              // Set the extracted data
              setExtractedData(data.extractedData)
              // Clear sessionStorage
              sessionStorage.removeItem("pendingDataExtraction")
            }
          } catch (err) {
            console.error("Error loading pending extraction:", err)
          }
        }
      }
    }
  }, [searchParams])

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

  const handleFileSelect = (file: File) => {
    const fileName = file.name.toLowerCase()
    const validExtensions = [".pdf", ".txt"]
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext))
    
    if (!hasValidExtension) {
      setError("Invalid file type. Please upload a PDF or TXT file.")
      return
    }

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
    setExtractedData(null)
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

  const handleExtract = async () => {
    if (useUrl && urlInput.trim()) {
      // Extract from URL
      setIsExtracting(true)
      setError(null)
      setExtractedData(null)

      try {
        const response = await fetch(`${API_BASE_URL}/api/extract-from-url`, {
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

        const result = await response.json()

        if (result.success && result.data) {
          setExtractedData(result.data)
        } else {
          throw new Error("No data received from server")
        }
      } catch (err) {
        console.error("Error extracting data from URL:", err)
        setError(err instanceof Error ? err.message : "Failed to extract data from URL. Please try again.")
      } finally {
        setIsExtracting(false)
      }
      return
    }

    if (!selectedFile) {
      setError("Please select a file or enter a URL to extract data from.")
      return
    }

    setIsExtracting(true)
    setError(null)
    setExtractedData(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch(`${API_BASE_URL}/api/extract-data`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.data) {
        setExtractedData(result.data)
      } else {
        throw new Error("No data received from server")
      }
    } catch (err) {
      console.error("Error extracting data:", err)
      setError(err instanceof Error ? err.message : "Failed to extract data. Please try again.")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSaveExtraction = async () => {
    if (!extractedData) {
      setError("No extraction to save. Please extract data first.")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error("You must be logged in to save extractions.")
      }

      // Determine file name
      const fileName = selectedFile 
        ? selectedFile.name 
        : (extractedData.studyIdentification?.title || "Extracted Study") + ".json"

      // Convert extracted data to JSON string for storage
      const extractionJson = JSON.stringify(extractedData, null, 2)

      // Save to Supabase
      const { error: insertError } = await supabase
        .from('saved_studies')
        .insert({
          user_id: user.id,
          file_name: fileName,
          file_size: selectedFile?.size || null,
          analysis_result: extractionJson,
          study_type: 'extraction',
        })

      if (insertError) {
        throw insertError
      }

      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (err) {
      console.error("Error saving extraction:", err)
      setError(err instanceof Error ? err.message : "Failed to save extraction. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportCSV = () => {
    if (!extractedData) return

    // Helper to escape CSV values
    const escapeCSV = (value: any): string => {
      if (value === null || value === undefined) return ""
      const str = String(value)
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    // Helper to format array values
    const formatArray = (arr: any[]): string => {
      if (!arr || arr.length === 0) return ""
      return arr.filter(item => item !== null && item !== undefined).join("; ")
    }

    // Helper to format object values
    const formatObject = (obj: any): string => {
      if (!obj || typeof obj !== "object") return ""
      const entries = Object.entries(obj)
        .filter(([_, v]) => v !== null && v !== undefined)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? formatArray(v) : String(v)}`)
      return entries.join(" | ")
    }

    const rows: string[][] = []
    
    // Add header row
    rows.push(["Section", "Field", "Value"])

    // Study Identification Section
    if (extractedData.studyIdentification) {
      const id = extractedData.studyIdentification
      rows.push(["Study Identification", "Title", escapeCSV(id.title)])
      if (id.authors && id.authors.length > 0) {
        rows.push(["Study Identification", "Authors", escapeCSV(formatArray(id.authors))])
      }
      rows.push(["Study Identification", "Publication Year", escapeCSV(id.publicationYear)])
      rows.push(["Study Identification", "Journal", escapeCSV(id.journal)])
      rows.push(["Study Identification", "DOI", escapeCSV(id.doi)])
    }

    // Study Design Section
    if (extractedData.studyDesign) {
      const design = extractedData.studyDesign
      rows.push(["Study Design", "Study Type", escapeCSV(design.studyType)])
      rows.push(["Study Design", "Setting", escapeCSV(design.setting)])
      rows.push(["Study Design", "Period", escapeCSV(design.period)])
    }

    // Participants Section
    if (extractedData.participants) {
      const part = extractedData.participants
      rows.push(["Participants", "Total Sample Size", escapeCSV(part.totalSampleSize)])
      if (part.interventionGroupSize) {
        rows.push(["Participants", "Intervention Group Size", escapeCSV(part.interventionGroupSize)])
      }
      if (part.controlGroupSize) {
        rows.push(["Participants", "Control Group Size", escapeCSV(part.controlGroupSize)])
      }
      if (part.exposureGroupSize) {
        rows.push(["Participants", "Exposure Group Size", escapeCSV(part.exposureGroupSize)])
      }
      if (part.unexposedGroupSize) {
        rows.push(["Participants", "Unexposed Group Size", escapeCSV(part.unexposedGroupSize)])
      }
      if (part.numberOfCases) {
        rows.push(["Participants", "Number of Cases", escapeCSV(part.numberOfCases)])
      }
      if (part.numberOfControls) {
        rows.push(["Participants", "Number of Controls", escapeCSV(part.numberOfControls)])
      }
      rows.push(["Participants", "Age Range", escapeCSV(part.ageRange)])
      rows.push(["Participants", "Gender Distribution", escapeCSV(part.genderDistribution)])
      if (part.inclusionCriteria && part.inclusionCriteria.length > 0) {
        rows.push(["Participants", "Inclusion Criteria", escapeCSV(formatArray(part.inclusionCriteria))])
      }
      if (part.exclusionCriteria && part.exclusionCriteria.length > 0) {
        rows.push(["Participants", "Exclusion Criteria", escapeCSV(formatArray(part.exclusionCriteria))])
      }
    }

    // Interventions Section
    if (extractedData.interventions) {
      const interv = extractedData.interventions
      rows.push(["Interventions", "Intervention Description", escapeCSV(interv.interventionDescription)])
      rows.push(["Interventions", "Dosage/Timing", escapeCSV(interv.dosageTiming)])
      rows.push(["Interventions", "Comparator", escapeCSV(interv.comparator)])
      rows.push(["Interventions", "Follow-up Duration", escapeCSV(interv.followUpDuration)])
    }

    // Exposures Section
    if (extractedData.exposures) {
      const exp = extractedData.exposures
      rows.push(["Exposures", "Exposure Description", escapeCSV(exp.exposureDescription)])
      rows.push(["Exposures", "Exposure Measurement", escapeCSV(exp.exposureMeasurement)])
      if (exp.confoundersAdjusted && exp.confoundersAdjusted.length > 0) {
        rows.push(["Exposures", "Confounders Adjusted", escapeCSV(formatArray(exp.confoundersAdjusted))])
      }
      if (exp.matchingCriteria && exp.matchingCriteria.length > 0) {
        rows.push(["Exposures", "Matching Criteria", escapeCSV(formatArray(exp.matchingCriteria))])
      }
      rows.push(["Exposures", "Follow-up Duration", escapeCSV(exp.followUpDuration)])
    }

    // Outcomes Section
    if (extractedData.outcomes) {
      const outcomes = extractedData.outcomes
      
      // Primary Outcomes
      if (outcomes.primaryOutcomes && outcomes.primaryOutcomes.length > 0) {
        outcomes.primaryOutcomes.forEach((outcome, idx) => {
          const prefix = `Primary Outcome ${idx + 1}`
          rows.push(["Outcomes", `${prefix} - Name`, escapeCSV(outcome.name)])
          rows.push(["Outcomes", `${prefix} - Description`, escapeCSV(outcome.description)])
          rows.push(["Outcomes", `${prefix} - Measurement Method`, escapeCSV(outcome.measurementMethod)])
          if (outcome.timePoints && outcome.timePoints.length > 0) {
            rows.push(["Outcomes", `${prefix} - Time Points`, escapeCSV(formatArray(outcome.timePoints))])
          }
        })
      }

      // Secondary Outcomes
      if (outcomes.secondaryOutcomes && outcomes.secondaryOutcomes.length > 0) {
        outcomes.secondaryOutcomes.forEach((outcome, idx) => {
          const prefix = `Secondary Outcome ${idx + 1}`
          rows.push(["Outcomes", `${prefix} - Name`, escapeCSV(outcome.name)])
          rows.push(["Outcomes", `${prefix} - Description`, escapeCSV(outcome.description)])
          rows.push(["Outcomes", `${prefix} - Measurement Method`, escapeCSV(outcome.measurementMethod)])
          if (outcome.timePoints && outcome.timePoints.length > 0) {
            rows.push(["Outcomes", `${prefix} - Time Points`, escapeCSV(formatArray(outcome.timePoints))])
          }
        })
      }
    }

    // Results Section
    if (extractedData.results) {
      const results = extractedData.results

      // Primary Outcome Results
      if (results.primaryOutcomes && results.primaryOutcomes.length > 0) {
        results.primaryOutcomes.forEach((result, idx) => {
          const prefix = `Primary Outcome ${idx + 1} Results`
          rows.push(["Results", `${prefix} - Outcome Name`, escapeCSV(result.outcomeName)])
          
          // Intervention/Control Groups (RCT)
          if (result.interventionGroup) {
            rows.push(["Results", `${prefix} - Intervention Group`, escapeCSV(formatObject(result.interventionGroup))])
          }
          if (result.controlGroup) {
            rows.push(["Results", `${prefix} - Control Group`, escapeCSV(formatObject(result.controlGroup))])
          }
          
          // Exposed/Unexposed Groups (Cohort)
          if (result.exposedGroup) {
            rows.push(["Results", `${prefix} - Exposed Group`, escapeCSV(formatObject(result.exposedGroup))])
          }
          if (result.unexposedGroup) {
            rows.push(["Results", `${prefix} - Unexposed Group`, escapeCSV(formatObject(result.unexposedGroup))])
          }
          
          // Cases/Controls (Case-Control)
          if (result.cases) {
            rows.push(["Results", `${prefix} - Cases`, escapeCSV(formatObject(result.cases))])
          }
          if (result.controls) {
            rows.push(["Results", `${prefix} - Controls`, escapeCSV(formatObject(result.controls))])
          }
          
          rows.push(["Results", `${prefix} - Effect Size`, escapeCSV(result.effectSize)])
          rows.push(["Results", `${prefix} - Confidence Interval`, escapeCSV(result.confidenceInterval)])
          rows.push(["Results", `${prefix} - P-Value`, escapeCSV(result.pValue)])
          rows.push(["Results", `${prefix} - Statistical Test`, escapeCSV(result.statisticalTest)])
        })
      }

      // Diagnostic metrics
      if (results.sensitivity !== undefined) {
        rows.push(["Results", "Sensitivity", escapeCSV(results.sensitivity)])
      }
      if (results.specificity !== undefined) {
        rows.push(["Results", "Specificity", escapeCSV(results.specificity)])
      }
      if (results.ppv !== undefined) {
        rows.push(["Results", "Positive Predictive Value (PPV)", escapeCSV(results.ppv)])
      }
      if (results.npv !== undefined) {
        rows.push(["Results", "Negative Predictive Value (NPV)", escapeCSV(results.npv)])
      }
      if (results.auc !== undefined) {
        rows.push(["Results", "Area Under Curve (AUC)", escapeCSV(results.auc)])
      }

      // Other result fields
      rows.push(["Results", "Adverse Events", escapeCSV(results.adverseEvents)])
      rows.push(["Results", "Attrition Rate", escapeCSV(results.attritionRate)])
      rows.push(["Results", "Loss to Follow-up", escapeCSV(results.lossToFollowUp)])
      rows.push(["Results", "Pooled Effect", escapeCSV(results.pooledEffect)])
      if (results.heterogeneity) {
        rows.push(["Results", "Heterogeneity", escapeCSV(formatObject(results.heterogeneity))])
      }
    }

    // Statistical Analysis Section
    if (extractedData.statisticalAnalysis) {
      const stats = extractedData.statisticalAnalysis
      if (stats.methods && stats.methods.length > 0) {
        rows.push(["Statistical Analysis", "Methods", escapeCSV(formatArray(stats.methods))])
      }
      rows.push(["Statistical Analysis", "Software", escapeCSV(stats.software)])
      rows.push(["Statistical Analysis", "Sample Size Calculation", escapeCSV(stats.sampleSizeCalculation)])
    }

    // Funding Section
    if (extractedData.funding) {
      const funding = extractedData.funding
      rows.push(["Funding", "Source", escapeCSV(funding.source)])
      rows.push(["Funding", "Conflicts of Interest", escapeCSV(funding.conflictsOfInterest)])
      rows.push(["Funding", "Registration Number", escapeCSV(funding.registrationNumber)])
    }

    // Convert rows to CSV format
    const csvContent = rows.map(row => row.join(",")).join("\n")

    // Generate filename with study title if available
    const studyTitle = extractedData.studyIdentification?.title || "Extracted Study"
    const sanitizedTitle = studyTitle.replace(/[^a-z0-9]/gi, "_").substring(0, 50)
    const timestamp = new Date().toISOString().split("T")[0]
    const filename = `${sanitizedTitle}_${timestamp}.csv`

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined) return false
    if (typeof value === "string") {
      const trimmed = value.trim().toLowerCase()
      return trimmed !== "" && trimmed !== "n/a" && trimmed !== "na" && trimmed !== "not available"
    }
    if (Array.isArray(value)) return value.length > 0 && value.some(item => hasValue(item))
    if (typeof value === "object") return Object.keys(value).length > 0 && Object.values(value).some(v => hasValue(v))
    return true
  }

  const renderObjectAsTable = (obj: any): React.ReactNode => {
    if (!obj || typeof obj !== "object") return null
    
    const entries = Object.entries(obj).filter(([_, value]) => hasValue(value))
    if (entries.length === 0) return null
    
    return (
      <Table>
        <TableBody>
          {entries.map(([key, value]) => (
            <TableRow key={key}>
              <TableHead className="w-[180px] text-xs capitalize align-top">{key.replace(/([A-Z])/g, " $1").trim()}</TableHead>
              <TableCell className="text-sm break-words whitespace-normal">
                {Array.isArray(value) 
                  ? value.filter(item => hasValue(item)).join(", ") 
                  : typeof value === "object" 
                  ? renderObjectAsTable(value)
                  : String(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  const renderValue = (value: any): React.ReactNode => {
    if (!hasValue(value)) return null
    if (Array.isArray(value)) {
      const filtered = value.filter(item => hasValue(item))
      if (filtered.length === 0) return null
      return <span>{filtered.join(", ")}</span>
    }
    if (typeof value === "object") {
      return renderObjectAsTable(value)
    }
    return <span>{String(value)}</span>
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
                  Data Extraction
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Extract Data from Research Papers
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Use AI to systematically extract structured data (study results, participant details, interventions, outcomes) from research articles.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Upload Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Upload Your Study</CardTitle>
                  <CardDescription>
                    Upload your research study file or paste a URL to extract structured data. Supported formats: PDF, TXT. Note: Only URLs are supported (not DOI or PDF links).
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
                        <Label htmlFor="url-input-extract">Enter Study URL</Label>
                      <Input
                          id="url-input-extract"
                          type="text"
                          placeholder="https://pubmed.ncbi.nlm.nih.gov/12345678 or https://example.com/study"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          disabled={isExtracting}
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
                        if (!selectedFile && !isExtracting) {
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
                        disabled={isExtracting}
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
                                  setSelectedFile(null)
                                  setExtractedData(null)
                                  if (fileInputRef.current) fileInputRef.current.value = ""
                                }}
                                className="ml-2 text-muted-foreground hover:text-destructive"
                                disabled={isExtracting}
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
                            disabled={isExtracting}
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
                    onClick={handleExtract}
                    disabled={(useUrl ? !urlInput.trim() : !selectedFile) || isExtracting}
                  >
                    {isExtracting ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Extracting Data...
                      </>
                    ) : (
                      <>
                        <IconTableExport className="h-4 w-4 mr-2" />
                        Extract Data
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Extracted Data Results */}
              {extractedData && (
                <div ref={resultsRef} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold tracking-tight">Extracted Data</h2>
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={handleSaveExtraction} 
                        variant={isSaved ? "default" : "outline"}
                        className="gap-2"
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <>
                            <Spinner className="h-4 w-4" />
                            Saving...
                          </>
                        ) : isSaved ? (
                          <>
                            <IconCheck className="h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <IconDatabase className="h-4 w-4" />
                            Save Study
                          </>
                        )}
                      </Button>
                      <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                        <IconDownload className="h-4 w-4" />
                        Export to CSV
                      </Button>
                    </div>
                  </div>

                  {/* Study Identification */}
                  {extractedData.studyIdentification && (
                    (hasValue(extractedData.studyIdentification.title) ||
                     hasValue(extractedData.studyIdentification.authors) ||
                     hasValue(extractedData.studyIdentification.publicationYear) ||
                     hasValue(extractedData.studyIdentification.journal) ||
                     hasValue(extractedData.studyIdentification.doi)) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Study Identification</CardTitle>
                  </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              {hasValue(extractedData.studyIdentification.title) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Title</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.studyIdentification.title}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyIdentification.authors) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Authors</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.studyIdentification.authors.join(", ")}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyIdentification.publicationYear) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Publication Year</TableHead>
                                  <TableCell>{extractedData.studyIdentification.publicationYear}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyIdentification.journal) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Journal/Conference</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.studyIdentification.journal}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyIdentification.doi) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">DOI</TableHead>
                                  <TableCell className="break-words whitespace-normal font-mono text-sm">{extractedData.studyIdentification.doi}</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                </Card>
                    )
                  )}

                  {/* Study Design */}
                  {extractedData.studyDesign && (
                    (hasValue(extractedData.studyDesign.studyType) ||
                     hasValue(extractedData.studyDesign.setting) ||
                     hasValue(extractedData.studyDesign.period)) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Study Design</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              {hasValue(extractedData.studyDesign.studyType) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Study Type</TableHead>
                                  <TableCell className="break-words whitespace-normal font-medium">{extractedData.studyDesign.studyType}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyDesign.setting) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Study Setting/Location</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.studyDesign.setting}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.studyDesign.period) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Study Period/Duration</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.studyDesign.period}</TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    )
                  )}

                  {/* Participants */}
                  {extractedData.participants && (
                    (hasValue(extractedData.participants.totalSampleSize) ||
                     hasValue(extractedData.participants.interventionGroupSize) ||
                     hasValue(extractedData.participants.controlGroupSize) ||
                     hasValue(extractedData.participants.exposureGroupSize) ||
                     hasValue(extractedData.participants.unexposedGroupSize) ||
                     hasValue(extractedData.participants.numberOfCases) ||
                     hasValue(extractedData.participants.numberOfControls) ||
                     hasValue(extractedData.participants.ageRange) ||
                     hasValue(extractedData.participants.genderDistribution) ||
                     hasValue(extractedData.participants.inclusionCriteria) ||
                     hasValue(extractedData.participants.exclusionCriteria)) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Participants</CardTitle>
                  </CardHeader>
                        <CardContent>
                          <Table>
                            <TableBody>
                              {hasValue(extractedData.participants.totalSampleSize) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Total Sample Size</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.totalSampleSize.toLocaleString()} participants</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.interventionGroupSize) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Intervention Group Size</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.interventionGroupSize.toLocaleString()} participants</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.controlGroupSize) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Control Group Size</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.controlGroupSize.toLocaleString()} participants</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.exposureGroupSize) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Exposure Group Size</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.exposureGroupSize.toLocaleString()} participants</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.unexposedGroupSize) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Unexposed Group Size</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.unexposedGroupSize.toLocaleString()} participants</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.numberOfCases) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Number of Cases</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.numberOfCases.toLocaleString()} cases</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.numberOfControls) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Number of Controls</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.numberOfControls.toLocaleString()} controls</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.ageRange) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Age Range / Mean Age</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.ageRange}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.genderDistribution) && (
                                <TableRow>
                                  <TableHead className="w-[200px]">Gender Distribution</TableHead>
                                  <TableCell className="break-words whitespace-normal">{extractedData.participants.genderDistribution}</TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.inclusionCriteria) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Inclusion Criteria</TableHead>
                                  <TableCell className="break-words whitespace-normal">
                                    <ul className="list-disc list-inside space-y-1.5">
                                      {extractedData.participants.inclusionCriteria.filter(c => hasValue(c)).map((criteria, idx) => (
                                        <li key={idx} className="break-words">{criteria}</li>
                                      ))}
                                    </ul>
                                  </TableCell>
                                </TableRow>
                              )}
                              {hasValue(extractedData.participants.exclusionCriteria) && (
                                <TableRow>
                                  <TableHead className="w-[200px] align-top">Exclusion Criteria</TableHead>
                                  <TableCell className="break-words whitespace-normal">
                                    <ul className="list-disc list-inside space-y-1.5">
                                      {extractedData.participants.exclusionCriteria.filter(c => hasValue(c)).map((criteria, idx) => (
                                        <li key={idx} className="break-words">{criteria}</li>
                                      ))}
                                    </ul>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </CardContent>
                </Card>
                    )
                  )}

                  {/* Outcomes */}
                  {extractedData.outcomes && (
                    ((extractedData.outcomes.primaryOutcomes && extractedData.outcomes.primaryOutcomes.some(o => 
                      hasValue(o.name) || hasValue(o.description) || hasValue(o.measurementMethod) || hasValue(o.timePoints)
                    )) ||
                    (extractedData.outcomes.secondaryOutcomes && extractedData.outcomes.secondaryOutcomes.some(o => 
                      hasValue(o.name) || hasValue(o.description) || hasValue(o.measurementMethod) || hasValue(o.timePoints)
                    ))) && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Outcomes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {extractedData.outcomes.primaryOutcomes && extractedData.outcomes.primaryOutcomes.some(o => 
                            hasValue(o.name) || hasValue(o.description) || hasValue(o.measurementMethod) || hasValue(o.timePoints)
                          ) && (
                          <div>
                            <h4 className="font-semibold mb-3">Primary Outcomes</h4>
                            <div className="space-y-4">
                              {extractedData.outcomes.primaryOutcomes
                                .filter(o => hasValue(o.name) || hasValue(o.description) || hasValue(o.measurementMethod) || hasValue(o.timePoints))
                                .map((outcome, idx) => (
                                  <Card key={idx} className="bg-muted/50">
                                    <CardContent className="pt-4">
                                      <Table>
                                        <TableBody>
                                          {hasValue(outcome.name) && (
                                            <TableRow>
                                              <TableHead className="w-[200px]">Outcome Name</TableHead>
                                              <TableCell className="font-medium break-words whitespace-normal">{outcome.name}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.description) && (
                                            <TableRow>
                                              <TableHead className="w-[200px] align-top">Description</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.description}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.measurementMethod) && (
                                            <TableRow>
                                              <TableHead className="w-[200px] align-top">Measurement Method</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.measurementMethod}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.timePoints) && (
                                            <TableRow>
                                              <TableHead className="w-[200px]">Time Points Assessed</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.timePoints.filter(tp => hasValue(tp)).join(", ")}</TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                          </div>
                        )}
                        {extractedData.outcomes.secondaryOutcomes && extractedData.outcomes.secondaryOutcomes.length > 0 && (
                          <div>
                            <Separator />
                            <h4 className="font-semibold mb-3 mt-6">Secondary Outcomes</h4>
                            <div className="space-y-4">
                              {extractedData.outcomes.secondaryOutcomes
                                .filter(o => hasValue(o.name) || hasValue(o.description) || hasValue(o.measurementMethod) || hasValue(o.timePoints))
                                .map((outcome, idx) => (
                                  <Card key={idx} className="bg-muted/50">
                                    <CardContent className="pt-4">
                                      <Table>
                                        <TableBody>
                                          {hasValue(outcome.name) && (
                                            <TableRow>
                                              <TableHead className="w-[200px]">Outcome Name</TableHead>
                                              <TableCell className="font-medium break-words whitespace-normal">{outcome.name}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.description) && (
                                            <TableRow>
                                              <TableHead className="w-[200px] align-top">Description</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.description}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.measurementMethod) && (
                                            <TableRow>
                                              <TableHead className="w-[200px] align-top">Measurement Method</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.measurementMethod}</TableCell>
                                            </TableRow>
                                          )}
                                          {hasValue(outcome.timePoints) && (
                                            <TableRow>
                                              <TableHead className="w-[200px]">Time Points Assessed</TableHead>
                                              <TableCell className="break-words whitespace-normal">{outcome.timePoints.filter(tp => hasValue(tp)).join(", ")}</TableCell>
                                            </TableRow>
                                          )}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </Card>
                                ))}
                            </div>
                    </div>
                        )}
                      </CardContent>
                    </Card>
                    )
                  )}

                  {/* Results */}
                  {extractedData.results && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Results</CardTitle>
                  </CardHeader>
                      <CardContent className="space-y-6">
                        {extractedData.results.primaryOutcomes && extractedData.results.primaryOutcomes.some(r => 
                          hasValue(r.outcomeName) || hasValue(r.effectSize) || hasValue(r.confidenceInterval) || 
                          hasValue(r.pValue) || hasValue(r.statisticalTest) || hasValue(r.interventionGroup) || hasValue(r.controlGroup) ||
                          hasValue(r.exposedGroup) || hasValue(r.unexposedGroup) || hasValue(r.cases) || hasValue(r.controls)
                        ) && (
                          <div>
                            <h4 className="font-semibold mb-3">Primary Outcome Results</h4>
                            <div className="space-y-4">
                              {extractedData.results.primaryOutcomes
                                .filter(r => hasValue(r.outcomeName) || hasValue(r.effectSize) || hasValue(r.confidenceInterval) || 
                                  hasValue(r.pValue) || hasValue(r.statisticalTest) || hasValue(r.interventionGroup) || hasValue(r.controlGroup) ||
                                  hasValue(r.exposedGroup) || hasValue(r.unexposedGroup) || hasValue(r.cases) || hasValue(r.controls))
                                .map((result, idx) => (
                                <Card key={idx} className="bg-muted/50">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      {hasValue(result.outcomeName) ? (
                                        <>
                                          <Badge variant="secondary" className="text-xs">Outcome {idx + 1}</Badge>
                                          <span className="break-words whitespace-normal">{result.outcomeName}</span>
                                        </>
                                      ) : (
                                        <span>Outcome {idx + 1}</span>
                                      )}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="pt-0">
                                    {/* Summary Section */}
                                    {(hasValue(result.effectSize) || hasValue(result.pValue) || hasValue(result.confidenceInterval)) && (
                                      <div className="mb-4 p-3 bg-background rounded-lg border">
                                        <h5 className="font-semibold text-sm mb-2 text-muted-foreground">Summary</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                          {hasValue(result.effectSize) && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">Effect Size</p>
                                              <p className="font-semibold text-sm break-words whitespace-normal">{result.effectSize}</p>
                                            </div>
                                          )}
                                          {hasValue(result.confidenceInterval) && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">95% Confidence Interval</p>
                                              <p className="font-semibold text-sm break-words whitespace-normal">{result.confidenceInterval}</p>
                                            </div>
                                          )}
                                          {hasValue(result.pValue) && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">P-Value</p>
                                              <p className="font-semibold text-sm break-words whitespace-normal">{result.pValue}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <Table>
                                      <TableBody>
                                        {hasValue(result.outcomeName) && (
                                          <TableRow>
                                            <TableHead className="w-[200px]">Outcome Name</TableHead>
                                            <TableCell className="font-medium break-words whitespace-normal">{result.outcomeName}</TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.effectSize) && (
                                          <TableRow>
                                            <TableHead className="w-[200px]">Effect Size</TableHead>
                                            <TableCell className="break-words whitespace-normal">
                                              <span className="font-medium">{result.effectSize}</span>
                                              {result.effectSize && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  {result.effectSize.includes("RR") || result.effectSize.includes("HR") || result.effectSize.includes("OR") 
                                                    ? "Risk ratio, hazard ratio, or odds ratio comparing groups"
                                                    : result.effectSize.includes("MD") || result.effectSize.includes("SMD")
                                                    ? "Mean difference or standardized mean difference"
                                                    : "Effect measure comparing groups"}
                                                </p>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.confidenceInterval) && (
                                          <TableRow>
                                            <TableHead className="w-[200px]">95% Confidence Interval</TableHead>
                                            <TableCell className="break-words whitespace-normal">
                                              <span>{result.confidenceInterval}</span>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Range of plausible values for the true effect size
                                              </p>
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.pValue) && (
                                          <TableRow>
                                            <TableHead className="w-[200px]">P-Value</TableHead>
                                            <TableCell className="break-words whitespace-normal">
                                              <span className="font-medium">{result.pValue}</span>
                                              {result.pValue && (() => {
                                                const pValueStr = String(result.pValue).toLowerCase()
                                                const pValueNum = parseFloat(pValueStr.replace(/[<>=]/g, ''))
                                                let interpretation = ""
                                                if (!isNaN(pValueNum)) {
                                                  if (pValueNum < 0.001) {
                                                    interpretation = "Highly statistically significant (p < 0.001)"
                                                  } else if (pValueNum < 0.01) {
                                                    interpretation = "Very statistically significant (p < 0.01)"
                                                  } else if (pValueNum < 0.05) {
                                                    interpretation = "Statistically significant (p < 0.05)"
                                                  } else if (pValueNum < 0.10) {
                                                    interpretation = "Marginally significant (p < 0.10)"
                                                  } else {
                                                    interpretation = "Not statistically significant (p ≥ 0.05)"
                                                  }
                                                } else if (pValueStr.includes("ns") || pValueStr.includes("not significant")) {
                                                  interpretation = "Not statistically significant"
                                                } else if (pValueStr.includes("< 0.05") || pValueStr.includes("p < 0.05")) {
                                                  interpretation = "Statistically significant (p < 0.05)"
                                                }
                                                return interpretation ? (
                                                  <p className="text-xs text-muted-foreground mt-1">{interpretation}</p>
                                                ) : null
                                              })()}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.statisticalTest) && (
                                          <TableRow>
                                            <TableHead className="w-[200px]">Statistical Test Used</TableHead>
                                            <TableCell className="break-words whitespace-normal">
                                              {result.statisticalTest}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.interventionGroup) && renderObjectAsTable(result.interventionGroup) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Intervention Group Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.interventionGroup)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.controlGroup) && renderObjectAsTable(result.controlGroup) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Control Group Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.controlGroup)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.exposedGroup) && renderObjectAsTable(result.exposedGroup) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Exposed Group Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.exposedGroup)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.unexposedGroup) && renderObjectAsTable(result.unexposedGroup) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Unexposed Group Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.unexposedGroup)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.cases) && renderObjectAsTable(result.cases) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Cases Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.cases)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                        {hasValue(result.controls) && renderObjectAsTable(result.controls) && (
                                          <TableRow>
                                            <TableHead className="w-[200px] align-top pt-4">Controls Results</TableHead>
                                            <TableCell className="pt-4 break-words whitespace-normal">
                                              {renderObjectAsTable(result.controls)}
                                            </TableCell>
                                          </TableRow>
                                        )}
                                      </TableBody>
                                    </Table>
                                  </CardContent>
                </Card>
                              ))}
                            </div>
              </div>
                        )}
                        {/* Diagnostic Study Results */}
                        {(hasValue(extractedData.results.sensitivity) || hasValue(extractedData.results.specificity) ||
                          hasValue(extractedData.results.ppv) || hasValue(extractedData.results.npv) || hasValue(extractedData.results.auc)) && (
                          <div>
                            <Separator />
                            <h4 className="font-semibold mb-3 mt-6">Diagnostic Accuracy Metrics</h4>
                            <Table>
                              <TableBody>
                                {hasValue(extractedData.results.sensitivity) && (
                                  <TableRow>
                                    <TableHead className="w-[200px]">Sensitivity (True Positive Rate)</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.sensitivity}</TableCell>
                                  </TableRow>
                                )}
                                {hasValue(extractedData.results.specificity) && (
                                  <TableRow>
                                    <TableHead className="w-[200px]">Specificity (True Negative Rate)</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.specificity}</TableCell>
                                  </TableRow>
                                )}
                                {hasValue(extractedData.results.ppv) && (
                                  <TableRow>
                                    <TableHead className="w-[200px]">Positive Predictive Value (PPV)</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.ppv}</TableCell>
                                  </TableRow>
                                )}
                                {hasValue(extractedData.results.npv) && (
                                  <TableRow>
                                    <TableHead className="w-[200px]">Negative Predictive Value (NPV)</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.npv}</TableCell>
                                  </TableRow>
                                )}
                                {hasValue(extractedData.results.auc) && (
                                  <TableRow>
                                    <TableHead className="w-[200px]">Area Under ROC Curve (AUC)</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.auc}</TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                        {hasValue(extractedData.results.lossToFollowUp) && (
                          <div>
                            <Separator />
                            <div className="mt-4">
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableHead className="w-[200px]">Loss to Follow-up</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.lossToFollowUp}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                        {extractedData.results.adverseEvents && (
                          <div>
                            <Separator />
                            <div className="mt-4">
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableHead className="w-[200px] align-top">Adverse Events</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.adverseEvents}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                        {extractedData.results.attritionRate && (
              <div>
                            <Separator />
                            <div className="mt-4">
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableHead className="w-[200px]">Attrition/Dropout Rate</TableHead>
                                    <TableCell className="break-words whitespace-normal">{extractedData.results.attritionRate}</TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </div>
                </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Interventions (RCT-specific) */}
                  {extractedData.interventions && Object.entries(extractedData.interventions).some(([_, value]) => hasValue(value)) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Interventions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(extractedData.interventions)
                              .filter(([_, value]) => hasValue(value))
                              .map(([key, value]) => {
                                const rendered = renderValue(value)
                                return rendered ? (
                                  <TableRow key={key}>
                                    <TableHead className="w-[200px] align-top capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</TableHead>
                                    <TableCell className="break-words whitespace-normal">{rendered}</TableCell>
                                  </TableRow>
                                ) : null
                              })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Exposures (Observational studies) */}
                  {extractedData.exposures && Object.entries(extractedData.exposures).some(([_, value]) => hasValue(value)) && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Exposures</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(extractedData.exposures)
                              .filter(([_, value]) => hasValue(value))
                              .map(([key, value]) => {
                                const rendered = renderValue(value)
                                return rendered ? (
                                  <TableRow key={key}>
                                    <TableHead className="w-[200px] align-top capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</TableHead>
                                    <TableCell className="break-words whitespace-normal">{rendered}</TableCell>
                                  </TableRow>
                                ) : null
                              })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {extractedData.funding && Object.entries(extractedData.funding).some(([_, value]) => hasValue(value)) && (
                <Card>
                      <CardHeader>
                        <CardTitle>Funding & Conflicts</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableBody>
                            {Object.entries(extractedData.funding)
                              .filter(([_, value]) => hasValue(value))
                              .map(([key, value]) => {
                                const rendered = renderValue(value)
                                return rendered ? (
                                  <TableRow key={key}>
                                    <TableHead className="w-[200px] align-top capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</TableHead>
                                    <TableCell className="break-words whitespace-normal">{rendered}</TableCell>
                                  </TableRow>
                                ) : null
                              })}
                          </TableBody>
                        </Table>
                  </CardContent>
                </Card>
                  )}
              </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function DataExtractionPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <DataExtractionContent />
    </Suspense>
  )
}
