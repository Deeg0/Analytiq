"use client"

import * as React from "react"
import { useEffect, useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { IconArrowLeft } from "@tabler/icons-react"

// Component to render formatted analysis (same as study-analysis page)
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
    const riskMatch = trimmed.match(/\b(High|Low|Moderate|Very Low)\s+(risk|certainty)/i)
    if (riskMatch) {
      const level = riskMatch[1]
      const variant = 
        level.toLowerCase().includes('high') || level.toLowerCase().includes('very low')
          ? 'destructive'
          : level.toLowerCase().includes('moderate')
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
  
  // Remove "Analysis of the Study:" and similar prefixes
  cleaned = cleaned
    .replace(/^Analysis of the Study[:\s]*["']?[^"']*["']?\s*/i, '')
    .replace(/^Analysis:\s*/i, '')
    .trim()
  
  // Find the first ## section header (main section, not subsection)
  // Look for patterns like "## 1. " or "## 2. " etc.
  const firstMainSectionMatch = cleaned.match(/^(.*?)(^## \d+\.\s+.+$)/m)
  if (firstMainSectionMatch) {
    cleaned = firstMainSectionMatch[2].trim()
  } else {
    // Fallback: find first ## section header
    const firstSectionMatch = cleaned.match(/^(.*?)(^## .+$)/m)
    if (firstSectionMatch && firstSectionMatch[1].length > 0) {
      cleaned = firstSectionMatch[2].trim()
    }
  }
  
  return cleaned
}

const renderAnalysis = (text: string) => {
  const cleanedText = cleanAnalysisText(text)
  const sections = cleanedText.split(/(?=^## )/m).filter(Boolean)
  
  return (
    <div className="space-y-6">
      {sections.map((section, sectionIndex) => {
        const lines = section.trim().split('\n')
        const titleLine = lines[0]?.trim()
        if (!titleLine?.startsWith('## ')) return null
        
        const mainTitle = titleLine.replace(/^## /, '').trim()
        const sectionNumber = mainTitle.match(/^\d+\./)?.[0]?.replace('.', '')
        const cleanTitle = mainTitle.replace(/^\d+\.\s*/, '')
        
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
                subsections.map((subsection, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="font-semibold text-base text-foreground">
                      {subsection.title}
                    </h4>
                    <div className="space-y-2">
                      {subsection.content.map((item, itemIdx) => renderListItem(item, itemIdx))}
                    </div>
                    {idx < subsections.length - 1 && <Separator className="my-4" />}
                  </div>
                ))
              ) : (
                <div className="space-y-2">
                  {content.map((line, lineIdx) => renderListItem(line, lineIdx))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default function ViewSavedStudyPage() {
  const [fileName, setFileName] = useState<string>("")
  const [analysisResult, setAnalysisResult] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Get analysis from sessionStorage
    const stored = sessionStorage.getItem('viewingAnalysis')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        setFileName(data.fileName || "Study")
        setAnalysisResult(data.analysis || "")
      } catch (err) {
        console.error("Error parsing stored analysis:", err)
        router.push('/saved-studies')
      }
    } else {
      router.push('/saved-studies')
    }
  }, [router])

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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/saved-studies')}
                    className="w-fit gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    Back to Saved Studies
                  </Button>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    {fileName}
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Analysis results for this study
                  </p>
                </div>
              </div>
            </div>

            {/* Analysis Results */}
            <div className="px-4 pb-8 md:px-6">
              {analysisResult && renderAnalysis(analysisResult)}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

