'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useAnalysis } from '@/lib/contexts/AnalysisContext'
import { Save, Check } from 'lucide-react'

// Helper function to get color based on score percentage
function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600 dark:text-green-400'
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-400'
  if (percentage >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  if (percentage >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function getScoreRatingColor(overall: number): string {
  if (overall >= 80) return 'from-green-500 via-green-600 to-green-700'
  if (overall >= 60) return 'from-yellow-500 via-yellow-600 to-yellow-700'
  if (overall >= 40) return 'from-orange-500 via-orange-600 to-orange-700'
  return 'from-red-500 via-red-600 to-red-700'
}

// Helper function to format titles: replace underscores, capitalize words
function formatTitle(text: string): string {
  if (!text) return text
  // Replace underscores with spaces
  const withSpaces = text.replace(/_/g, ' ')
  // Split by spaces and capitalize each word
  return withSpaces
    .split(' ')
    .map(word => {
      // Handle empty strings
      if (!word) return word
      // Capitalize first letter and lowercase the rest
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export default function ResultsSection() {
  const { results, error, saveAnalysis, saving, isSavedAnalysis, loading } = useAnalysis()
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('simple')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)
  const [hasScrolled, setHasScrolled] = useState(false)

  const scrollToSection = (id: string) => {
    // Switch to technical tab first
    setActiveTab('technical')
    
    // Small delay to ensure tab content is rendered before scrolling
    setTimeout(() => {
      const element = document.getElementById(id)
      if (element) {
        // Scroll to center
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Trigger highlight
        setHighlightedSection(id)
      }
    }, 100)
  }

  // Remove highlight class when animation completes
  useEffect(() => {
    if (highlightedSection) {
      const timer = setTimeout(() => {
        setHighlightedSection(null)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [highlightedSection])

  // Reset saved state when results change
  useEffect(() => {
    setSaved(false)
    setSaveError(null)
  }, [results])

  // Auto-scroll to results when analysis finishes
  useEffect(() => {
    if (results && !loading && !hasScrolled && resultsRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
        setHasScrolled(true)
      }, 300)
    }
    // Reset scroll flag when results change
    if (!results) {
      setHasScrolled(false)
    }
  }, [results, loading, hasScrolled])

  const handleSave = async () => {
    setSaveError(null)
    const title = results?.metadata?.title || undefined
    const result = await saveAnalysis(title)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      setSaveError(result.error || 'Failed to save analysis')
    }
  }

  if (!results && !error) return null

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!results) return null

  const overallPercentage = results.trustScore.overall
  const categoryNames: Record<string, string> = {
    methodology: 'Methodology Quality',
    evidenceStrength: 'Evidence Strength',
    bias: 'Bias Detection',
    reproducibility: 'Reproducibility',
    statisticalValidity: 'Statistical Validity',
  }

  return (
    <div ref={resultsRef} id="analysis-results" className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Save Button - Only show if not viewing a saved analysis */}
      {results && !isSavedAnalysis && (
        <div className="flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {saveError && (
              <Alert variant="destructive" className="py-2 px-4">
                <AlertDescription className="text-sm">{saveError}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={handleSave}
              disabled={saving || saved}
              variant={saved ? "default" : "outline"}
              className="gap-2"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Analysis'}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Score Card - Cleaner Design */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold">Trust Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`bg-gradient-to-br ${getScoreRatingColor(overallPercentage)} rounded-xl p-6 sm:p-8 text-white mb-6`}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm border-3 border-white/30 flex flex-col items-center justify-center shadow-lg">
                <span className="text-3xl sm:text-4xl font-bold">{results.trustScore.overall}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-90 font-semibold">/100</span>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-xl sm:text-2xl font-bold mb-1">
                  {results.trustScore.rating}
                </h3>
                <p className="opacity-90 text-sm">
                  Overall Study Reliability
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown - Cleaner Design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(results.trustScore.breakdown).map(([key, data]: [string, any]) => {
              const percentage = Math.round((data.score / data.maxScore) * 100)
              const colorClass = getScoreColor(percentage)
              const bgColorClass = getScoreBgColor(percentage)
              const sectionId = `category-${key}`
              
              return (
                <Card 
                  key={key} 
                  className="cursor-pointer hover:bg-muted/50 transition-all hover:shadow-md border"
                  onClick={() => scrollToSection(sectionId)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-base">{categoryNames[key] || key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <Badge variant="outline" className={`${colorClass} font-semibold`}>
                        {percentage}%
                      </Badge>
                    </div>
                    <div className={`text-3xl font-bold mb-3 ${colorClass}`}>
                      {data.score}<span className="text-lg text-muted-foreground">/{data.maxScore}</span>
                    </div>
                    <div className="bg-muted/50 relative h-2.5 w-full overflow-hidden rounded-full">
                      <div 
                        className={`h-full transition-all duration-300 ${bgColorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground font-medium">
                      Click for details →
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Key Takeaways */}
      {results.keyTakeaways && results.keyTakeaways.length > 0 && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">🔑</span>
              Key Takeaways
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-relaxed">{takeaway.point}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {takeaway.category}
                      </Badge>
                      {takeaway.importance === 'high' && (
                        <Badge variant="outline" className="text-xs text-orange-600 border-orange-600">
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Limitations */}
      {results.studyLimitations && results.studyLimitations.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Study Limitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.studyLimitations.map((limitation, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${
                  limitation.severity === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-200' :
                  limitation.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200' :
                  'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      limitation.severity === 'high' ? 'bg-red-500 text-white' :
                      limitation.severity === 'medium' ? 'bg-orange-500 text-white' :
                      'bg-yellow-500 text-white'
                    }`}>
                      {limitation.severity === 'high' ? '!' : limitation.severity === 'medium' ? '~' : '•'}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{limitation.limitation}</p>
                      <p className="text-sm text-muted-foreground mb-2">{limitation.impact}</p>
                      {limitation.affectsConclusion && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                          Affects Conclusions
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Author & Journal Credibility */}
      {(results.metadata.authorCredibility || results.metadata.journalCredibility) && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">📚</span>
              Credibility Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.metadata.authorCredibility && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Author Credibility</h4>
                  <div className="space-y-2 text-sm">
                    {results.metadata.authorCredibility.credibilityScore !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Credibility Score:</span>
                        <Badge variant="outline" className={
                          results.metadata.authorCredibility.credibilityScore >= 80 ? 'text-green-600 border-green-600' :
                          results.metadata.authorCredibility.credibilityScore >= 60 ? 'text-yellow-600 border-yellow-600' :
                          'text-red-600 border-red-600'
                        }>
                          {results.metadata.authorCredibility.credibilityScore}/100
                        </Badge>
                      </div>
                    )}
                    {results.metadata.authorCredibility.hIndex !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">H-Index:</span>
                        <span className="font-medium">{results.metadata.authorCredibility.hIndex}</span>
                      </div>
                    )}
                    {results.metadata.authorCredibility.publicationCount !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Publications:</span>
                        <span className="font-medium">{results.metadata.authorCredibility.publicationCount}</span>
                      </div>
                    )}
                    {results.metadata.authorCredibility.conflictHistory && results.metadata.authorCredibility.conflictHistory.length > 0 && (
                      <div className="mt-2 pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-1">Conflict History:</p>
                        <ul className="text-xs space-y-1">
                          {results.metadata.authorCredibility.conflictHistory.map((conflict, idx) => (
                            <li key={idx} className="text-orange-600">• {conflict}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {results.metadata.journalCredibility && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-semibold mb-3">Journal Credibility</h4>
                  <div className="space-y-2 text-sm">
                    {results.metadata.journalCredibility.impactFactor !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Impact Factor:</span>
                        <span className="font-medium">{results.metadata.journalCredibility.impactFactor}</span>
                      </div>
                    )}
                    {results.metadata.journalCredibility.reputationScore !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reputation:</span>
                        <Badge variant="outline" className={
                          results.metadata.journalCredibility.reputationScore >= 80 ? 'text-green-600 border-green-600' :
                          results.metadata.journalCredibility.reputationScore >= 60 ? 'text-yellow-600 border-yellow-600' :
                          'text-red-600 border-red-600'
                        }>
                          {results.metadata.journalCredibility.reputationScore}/100
                        </Badge>
                      </div>
                    )}
                    {results.metadata.journalCredibility.quartile && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Quartile:</span>
                        <Badge variant="outline" className={
                          results.metadata.journalCredibility.quartile === 'Q1' ? 'text-green-600 border-green-600' :
                          results.metadata.journalCredibility.quartile === 'Q2' ? 'text-yellow-600 border-yellow-600' :
                          results.metadata.journalCredibility.quartile === 'Q3' ? 'text-orange-600 border-orange-600' :
                          'text-red-600 border-red-600'
                        }>
                          {results.metadata.journalCredibility.quartile}
                        </Badge>
                      </div>
                    )}
                    {results.metadata.journalCredibility.isPredatory && (
                      <div className="mt-2 pt-2 border-t">
                        <Badge variant="destructive" className="text-xs">
                          ⚠️ Potential Predatory Journal
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Replication & Follow-up */}
      {results.replicationInfo && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              Replication & Follow-up
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.replicationInfo.replicationAttempts && results.replicationInfo.replicationAttempts.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Replication Attempts</h4>
                  <div className="space-y-2">
                    {results.replicationInfo.replicationAttempts.map((attempt, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
                        <Badge variant="outline" className={
                          attempt.outcome === 'confirmed' ? 'text-green-600 border-green-600' :
                          attempt.outcome === 'failed' ? 'text-red-600 border-red-600' :
                          attempt.outcome === 'partial' ? 'text-yellow-600 border-yellow-600' :
                          'text-gray-600 border-gray-600'
                        }>
                          {attempt.outcome === 'confirmed' ? '✓ Confirmed' :
                           attempt.outcome === 'failed' ? '✗ Failed' :
                           attempt.outcome === 'partial' ? '~ Partial' : '? Unknown'}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{attempt.study}</p>
                          {attempt.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{attempt.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {results.replicationInfo.followUpStudies && results.replicationInfo.followUpStudies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Follow-up Studies</h4>
                  <ul className="space-y-1 text-sm">
                    {results.replicationInfo.followUpStudies.map((study, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{study}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.replicationInfo.updates && results.replicationInfo.updates.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Updates & Corrections</h4>
                  <div className="space-y-2">
                    {results.replicationInfo.updates.map((update, idx) => (
                      <div key={idx} className="p-2 rounded bg-muted/50 text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {update.type === 'retraction' ? '🚫 Retraction' :
                             update.type === 'correction' ? '✏️ Correction' :
                             update.type === 'erratum' ? '📝 Erratum' : '🔄 Update'}
                          </Badge>
                          {update.date && (
                            <span className="text-xs text-muted-foreground">{update.date}</span>
                          )}
                        </div>
                        <p className="text-muted-foreground">{update.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simple">Simple Summary</TabsTrigger>
              <TabsTrigger value="technical">Technical Critique</TabsTrigger>
              <TabsTrigger value="bias">Bias Report</TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">{results.simpleSummary}</p>
              </div>
            </TabsContent>
            <TabsContent value="technical" className="mt-4 space-y-6">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-6 text-base">{results.technicalCritique}</p>
                <Separator className="my-6" />
                
                {/* Category Details */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold mb-4">Category Breakdown</h3>
                  {Object.entries(results.trustScore.breakdown).map(([key, data]: [string, any]) => {
                    const percentage = Math.round((data.score / data.maxScore) * 100)
                    const colorClass = getScoreColor(percentage)
                    const bgColorClass = getScoreBgColor(percentage)
                    const sectionId = `category-${key}`
                    
                    return (
                      <Card 
                        key={key} 
                        id={sectionId} 
                        className={`scroll-mt-20 transition-all duration-500 ${
                          highlightedSection === sectionId 
                            ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.01]' 
                            : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {categoryNames[key] || key.replace(/([A-Z])/g, ' $1').trim()}
                            </CardTitle>
                            <div className="flex items-center gap-2">
                              <span className={`text-2xl font-bold ${colorClass}`}>
                                {data.score}/{data.maxScore}
                              </span>
                              <Badge variant="outline" className={colorClass}>
                                {percentage}%
                              </Badge>
                            </div>
                          </div>
                          <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full mt-2">
                            <div 
                              className={`h-full transition-all ${bgColorClass}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {data.details && (
                            <div>
                              <h4 className="font-semibold mb-2">Details</h4>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                {data.details}
                              </p>
                            </div>
                          )}
                          
                          {data.strengths && data.strengths.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Strengths</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {data.strengths.map((strength: string, idx: number) => (
                                  <li key={idx}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {data.issues && data.issues.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">Issues</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {data.issues.map((issue: string, idx: number) => (
                                  <li key={idx}>{issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Flaw Detection */}
                {results.flawDetection && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Flaw Detection</h3>
                      
                      {results.flawDetection.fallacies && results.flawDetection.fallacies.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">Logical Fallacies</h4>
                          <div className="space-y-4">
                            {results.flawDetection.fallacies.map((fallacy, idx) => (
                              <Card key={idx} className="border-red-200 dark:border-red-800">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge variant="destructive" className="mb-2">
                                      {formatTitle(fallacy.type)}
                                    </Badge>
                                    {fallacy.severity && (
                                      <Badge variant="outline" className={
                                        fallacy.severity === 'high' ? 'border-red-500 text-red-600' :
                                        fallacy.severity === 'medium' ? 'border-yellow-500 text-yellow-600' :
                                        'border-gray-500 text-gray-600'
                                      }>
                                        {fallacy.severity.charAt(0).toUpperCase() + fallacy.severity.slice(1)} Severity
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{fallacy.description}</p>
                                  {fallacy.quote && (
                                    <div className="bg-muted p-3 rounded-md my-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">Quote:</p>
                                      <p className="text-sm italic">"{fallacy.quote}"</p>
                                      {fallacy.quoteLocation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Location: {fallacy.quoteLocation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {fallacy.debunking && (
                                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md mt-2">
                                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Analysis:</p>
                                      <p className="text-sm text-red-900 dark:text-red-300">{fallacy.debunking}</p>
                                    </div>
                                  )}
                                  {fallacy.impact && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      <strong>Impact:</strong> {fallacy.impact}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.flawDetection.confounders && results.flawDetection.confounders.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-3 text-orange-600 dark:text-orange-400">Confounding Factors</h4>
                          <div className="space-y-3">
                            {results.flawDetection.confounders.map((confounder, idx) => (
                              <Card key={idx} className="border-orange-200 dark:border-orange-800">
                                <CardContent className="p-4">
                                  <h5 className="font-semibold mb-2">{formatTitle(confounder.factor)}</h5>
                                  <p className="text-sm text-muted-foreground mb-2">{confounder.description}</p>
                                  {confounder.quote && (
                                    <div className="bg-muted p-3 rounded-md my-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">Quote:</p>
                                      <p className="text-sm italic">"{confounder.quote}"</p>
                                      {confounder.quoteLocation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Location: {confounder.quoteLocation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {confounder.debunking && (
                                    <p className="text-sm text-muted-foreground mt-2">{confounder.debunking}</p>
                                  )}
                                  {confounder.impact && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                      <strong>Impact:</strong> {confounder.impact}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.flawDetection.validityThreats && results.flawDetection.validityThreats.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-3 text-red-600 dark:text-red-400">Validity Threats</h4>
                          <div className="space-y-3">
                            {results.flawDetection.validityThreats.map((threat, idx) => (
                              <Card key={idx} className="border-red-200 dark:border-red-800">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <h5 className="font-semibold">{formatTitle(threat.threat)}</h5>
                                    {threat.severity && (
                                      <Badge variant="outline" className={
                                        threat.severity === 'high' ? 'border-red-500 text-red-600' :
                                        threat.severity === 'medium' ? 'border-yellow-500 text-yellow-600' :
                                        'border-gray-500 text-gray-600'
                                      }>
                                        {threat.severity.charAt(0).toUpperCase() + threat.severity.slice(1)} Severity
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{threat.description}</p>
                                  {threat.quote && (
                                    <div className="bg-muted p-3 rounded-md my-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">Quote:</p>
                                      <p className="text-sm italic">"{threat.quote}"</p>
                                      {threat.quoteLocation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Location: {threat.quoteLocation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {threat.debunking && (
                                    <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md mt-2">
                                      <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Analysis:</p>
                                      <p className="text-sm text-red-900 dark:text-red-300">{threat.debunking}</p>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {results.flawDetection.issues && results.flawDetection.issues.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-semibold mb-3">Other Issues</h4>
                          <div className="space-y-3">
                            {results.flawDetection.issues.map((issue, idx) => (
                              <Card key={idx}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge variant="outline">{formatTitle(issue.category)}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                                  {issue.quote && (
                                    <div className="bg-muted p-3 rounded-md my-2">
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">Quote:</p>
                                      <p className="text-sm italic">"{issue.quote}"</p>
                                      {issue.quoteLocation && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Location: {issue.quoteLocation}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {issue.debunking && (
                                    <p className="text-sm text-muted-foreground mt-2">{issue.debunking}</p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Evidence Hierarchy */}
                {results.evidenceHierarchy && (
                  <>
                    <Separator className="my-6" />
                    <Card>
                      <CardHeader>
                        <CardTitle>Evidence Hierarchy</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Level */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-muted-foreground">Evidence Level</span>
                            <Badge variant="outline" className="capitalize text-sm">
                              {results.evidenceHierarchy.level.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>

                        {/* Position in Hierarchy - Visual Indicator */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-muted-foreground">Position in Hierarchy</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold">
                                {results.evidenceHierarchy.position}
                              </span>
                              <span className="text-muted-foreground">/</span>
                              <span className="text-muted-foreground">6</span>
                            </div>
                          </div>
                          {/* Visual hierarchy bar */}
                          <div className="relative">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-muted-foreground">Strongest</span>
                              <span className="text-xs text-muted-foreground">Weakest</span>
                            </div>
                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                              {/* Filled portion */}
                              <div 
                                className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                                  results.evidenceHierarchy.position <= 2 
                                    ? 'bg-green-500' 
                                    : results.evidenceHierarchy.position <= 4 
                                    ? 'bg-yellow-500' 
                                    : 'bg-red-500'
                                }`}
                                style={{ width: `${((7 - results.evidenceHierarchy.position) / 6) * 100}%` }}
                              />
                              {/* Position indicator */}
                              <div 
                                className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground rounded-full z-10"
                                style={{ left: `${((7 - results.evidenceHierarchy.position) / 6) * 100}%`, transform: 'translate(-50%, -50%)' }}
                              />
                            </div>
                            {/* Hierarchy labels */}
                            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                              <span>1</span>
                              <span>2</span>
                              <span>3</span>
                              <span>4</span>
                              <span>5</span>
                              <span>6</span>
                            </div>
                          </div>
                        </div>

                        {/* Quality Within Level */}
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-muted-foreground">Quality Within Level</span>
                            <Badge 
                              variant="outline" 
                              className={`capitalize text-sm ${
                                results.evidenceHierarchy.qualityWithinLevel === 'high'
                                  ? 'border-green-500 text-green-600 dark:text-green-400'
                                  : results.evidenceHierarchy.qualityWithinLevel === 'medium'
                                  ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                                  : 'border-red-500 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {results.evidenceHierarchy.qualityWithinLevel}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Causal Inference Evaluation */}
                {results.causalInference && (
                  <>
                    <Separator className="my-6" />
                    <Card className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Causal Inference Assessment</CardTitle>
                          <Badge 
                            variant={results.causalInference.canEstablishCausality ? "default" : "destructive"}
                            className={
                              results.causalInference.canEstablishCausality 
                                ? 'bg-green-600 hover:bg-green-700' 
                                : 'bg-red-600 hover:bg-red-700'
                            }
                          >
                            {results.causalInference.canEstablishCausality ? 'Can Establish Causality' : 'Cannot Establish Causality'}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Badge variant="outline" className={
                            results.causalInference.confidence === 'high' ? 'border-green-500 text-green-600' :
                            results.causalInference.confidence === 'medium' ? 'border-yellow-500 text-yellow-600' :
                            'border-red-500 text-red-600'
                          }>
                            {results.causalInference.confidence.charAt(0).toUpperCase() + results.causalInference.confidence.slice(1)} Confidence
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Assessment</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {results.causalInference.reasoning}
                          </p>
                        </div>

                        {results.causalInference.requirementsForCausality.met.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-green-600 dark:text-green-400">Requirements Met</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.causalInference.requirementsForCausality.met.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.causalInference.requirementsForCausality.unmet.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">Requirements Not Met</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.causalInference.requirementsForCausality.unmet.map((req, idx) => (
                                <li key={idx}>{req}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.causalInference.studyDesignLimitations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-orange-600 dark:text-orange-400">Study Design Limitations</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.causalInference.studyDesignLimitations.map((limitation, idx) => (
                                <li key={idx}>{limitation}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.causalInference.alternativeExplanations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Alternative Explanations</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.causalInference.alternativeExplanations.map((explanation, idx) => (
                                <li key={idx}>{explanation}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bradford Hill Criteria */}
                        {results.causalInference.bradfordHillCriteria && results.causalInference.bradfordHillCriteria.impliesCausation && (
                          <div className="mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-lg">Bradford Hill Criteria for Causation</h4>
                              <Badge variant="outline" className={
                                results.causalInference.bradfordHillCriteria.criteriaMet >= 7 ? 'border-green-500 text-green-600' :
                                results.causalInference.bradfordHillCriteria.criteriaMet >= 4 ? 'border-yellow-500 text-yellow-600' :
                                'border-red-500 text-red-600'
                              }>
                                {results.causalInference.bradfordHillCriteria.criteriaMet}/{results.causalInference.bradfordHillCriteria.criteriaTotal} Criteria Met
                              </Badge>
                            </div>
                            
                            {results.causalInference.bradfordHillCriteria.overallAssessment && (
                              <div className="mb-4 p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {results.causalInference.bradfordHillCriteria.overallAssessment}
                                </p>
                              </div>
                            )}

                            <div className="space-y-3">
                              {results.causalInference.bradfordHillCriteria.criteria.map((criterion, idx) => (
                                <Card key={idx} className={
                                  criterion.met && (criterion.strength === 'strong' || criterion.strength === 'moderate')
                                    ? 'border-green-500 border-l-4' 
                                    : criterion.met && criterion.strength === 'weak'
                                    ? 'border-yellow-500 border-l-4'
                                    : 'border-red-500 border-l-4'
                                }>
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <h5 className="font-semibold">{criterion.criterion}</h5>
                                        <Badge 
                                          variant={criterion.met && (criterion.strength === 'strong' || criterion.strength === 'moderate') ? "default" : "secondary"}
                                          className={
                                            criterion.met && criterion.strength === 'strong' ? 'bg-green-600 hover:bg-green-700' :
                                            criterion.met && criterion.strength === 'moderate' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                            criterion.met && criterion.strength === 'weak' ? 'bg-orange-500 hover:bg-orange-600' :
                                            'bg-gray-500 hover:bg-gray-600'
                                          }
                                        >
                                          {criterion.met ? 'Met' : 'Not Met'}
                                        </Badge>
                                        {criterion.strength !== 'none' && (
                                          <Badge variant="outline" className="capitalize">
                                            {criterion.strength}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    {criterion.evidence && (
                                      <p className="text-sm text-muted-foreground mb-2">{criterion.evidence}</p>
                                    )}
                                    {criterion.notes && (
                                      <p className="text-xs text-muted-foreground italic">{criterion.notes}</p>
                                    )}
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Expert Context */}
                {results.expertContext && (
                  <>
                    <Separator className="my-6" />
                    <Card>
                      <CardHeader>
                        <CardTitle>Expert Context</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {results.expertContext.consensus && (
                          <div>
                            <h4 className="font-semibold mb-2">Field Consensus</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                              {results.expertContext.consensus}
                            </p>
                          </div>
                        )}
                        {results.expertContext.controversies && results.expertContext.controversies.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-yellow-600 dark:text-yellow-400">Controversies</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.expertContext.controversies.map((controversy, idx) => (
                                <li key={idx}>{controversy}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {results.expertContext.recentUpdates && results.expertContext.recentUpdates.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Recent Updates</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.expertContext.recentUpdates.map((update, idx) => (
                                <li key={idx}>{update}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {results.expertContext.relatedStudies && results.expertContext.relatedStudies.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Related Studies</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                              {results.expertContext.relatedStudies.map((study, idx) => (
                                <li key={idx}>{study}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Recommendations */}
                {results.recommendations && results.recommendations.length > 0 && (
                  <>
                    <Separator className="my-6" />
                    <Card>
                      <CardHeader>
                        <CardTitle>Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                          {results.recommendations.map((recommendation, idx) => (
                            <li key={idx} className="leading-relaxed">{recommendation}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="bias" className="mt-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-base">{results.biasReport}</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Study Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Study Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {results.metadata.title && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Title</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.title}</p>
            </div>
          )}
          
          {results.metadata.authors && results.metadata.authors.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Authors</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.authors.join(', ')}</p>
            </div>
          )}
          
          {results.metadata.affiliations && results.metadata.affiliations.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Affiliations</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {results.metadata.affiliations.map((affiliation, idx) => (
                  <li key={idx}>{affiliation}</li>
                ))}
              </ul>
            </div>
          )}
          
          {results.metadata.journal && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Journal</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.journal}</p>
            </div>
          )}
          
          {results.metadata.publicationDate && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Publication Date</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.publicationDate}</p>
            </div>
          )}
          
          {results.metadata.doi && (
            <div>
              <h4 className="font-semibold text-sm mb-1">DOI</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.doi}</p>
            </div>
          )}
          
          {results.metadata.studyType && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Study Type</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.studyType}</p>
            </div>
          )}
          
          {results.metadata.sampleSize && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Sample Size</h4>
              <p className="text-sm text-muted-foreground">N = {results.metadata.sampleSize}</p>
            </div>
          )}
          
          {results.metadata.funding && results.metadata.funding.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1 text-red-600 dark:text-red-400">Funding Sources</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {results.metadata.funding.map((fund, idx) => (
                  <li key={idx}>{fund}</li>
                ))}
              </ul>
            </div>
          )}
          
          {results.metadata.impactFactor && (
            <div>
              <h4 className="font-semibold text-sm mb-1">Impact Factor</h4>
              <p className="text-sm text-muted-foreground">{results.metadata.impactFactor}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
