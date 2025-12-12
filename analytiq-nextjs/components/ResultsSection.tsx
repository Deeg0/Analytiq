'use client'

import { useState, useEffect } from 'react'
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
  const { results, error, saveAnalysis, saving, isSavedAnalysis } = useAnalysis()
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('simple')
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

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
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Save Button - Only show if not viewing a saved analysis */}
      {results && !isSavedAnalysis && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          {saveError && (
            <Alert variant="destructive" className="py-2 px-3 sm:px-4">
              <AlertDescription className="text-xs sm:text-sm">{saveError}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || saved}
            variant={saved ? "default" : "outline"}
            className="gap-2 w-full sm:w-auto"
            size="sm"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Saved!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{saving ? 'Saving...' : 'Save Analysis'}</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Score Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`bg-gradient-to-br ${getScoreRatingColor(overallPercentage)} rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 text-white mb-4 sm:mb-6 md:mb-8`}>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full bg-white/25 backdrop-blur-md border-2 sm:border-4 border-white/40 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{results.trustScore.overall}</span>
                <span className="text-[10px] sm:text-xs uppercase tracking-wider opacity-90 font-semibold">Score</span>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 md:mb-3">
                  {results.trustScore.rating}
                </h3>
                <p className="opacity-95 text-xs sm:text-sm md:text-base lg:text-lg">
                  Analysis complete
                </p>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
            {Object.entries(results.trustScore.breakdown).map(([key, data]: [string, any]) => {
              const percentage = Math.round((data.score / data.maxScore) * 100)
              const colorClass = getScoreColor(percentage)
              const bgColorClass = getScoreBgColor(percentage)
              const sectionId = `category-${key}`
              
              return (
                <Card 
                  key={key} 
                  className="cursor-pointer hover:bg-muted/70 transition-all hover:shadow-md active:scale-[0.98]"
                  onClick={() => scrollToSection(sectionId)}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h4 className="font-semibold text-sm sm:text-base leading-tight">{categoryNames[key] || key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <Badge variant="outline" className={`${colorClass} text-xs shrink-0`}>
                        {percentage}%
                      </Badge>
                    </div>
                    <div className={`text-xl sm:text-2xl font-bold mb-2 ${colorClass}`}>
                      {data.score}/{data.maxScore}
                    </div>
                    <div className="bg-muted relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full">
                      <div 
                        className={`h-full transition-all ${bgColorClass}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground">
                      Tap to view details →
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="simple" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
                <span className="hidden sm:inline">Simple Summary</span>
                <span className="sm:hidden">Simple</span>
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
                <span className="hidden sm:inline">Technical Critique</span>
                <span className="sm:hidden">Technical</span>
              </TabsTrigger>
              <TabsTrigger value="bias" className="text-xs sm:text-sm py-2 px-2 sm:px-4">
                <span className="hidden sm:inline">Bias Report</span>
                <span className="sm:hidden">Bias</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="simple" className="mt-4">
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{results.simpleSummary}</p>
            </TabsContent>
            <TabsContent value="technical" className="mt-4 space-y-6">
              <div>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed mb-6">{results.technicalCritique}</p>
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
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{results.biasReport}</p>
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
