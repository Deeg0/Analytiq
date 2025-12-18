'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  FileText,
  Search,
  TrendingUp,
  Eye,
  BookOpen
} from 'lucide-react'
import { useAnalysis } from '@/lib/contexts/AnalysisContext'

interface OnboardingProps {
  onComplete: () => void
}

type OnboardingStep = 
  | 'welcome'
  | 'input-guide'
  | 'waiting-analysis'
  | 'results-overview'
  | 'results-details'
  | 'complete'

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [isOpen, setIsOpen] = useState(true)
  const { loading, results, analyzeUrl, analyzeText } = useAnalysis()
  
  // Sample study URL for demo
  const sampleUrl = 'https://www.nature.com/articles/s41586-023-06221-2'

  // Monitor analysis progress - move to waiting when analysis starts
  useEffect(() => {
    if (currentStep === 'input-guide' && loading) {
      setCurrentStep('waiting-analysis')
    }
  }, [loading, currentStep])

  // When analysis completes, move to results overview
  useEffect(() => {
    if (currentStep === 'waiting-analysis' && results && !loading) {
      // Scroll to results section
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results')
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        // Move to next step after scrolling
        setTimeout(() => {
          setCurrentStep('results-overview')
        }, 800)
      }, 500)
    }
  }, [results, loading, currentStep])

  const progress = {
    welcome: 0,
    'input-guide': 20,
    'waiting-analysis': 40,
    'results-overview': 60,
    'results-details': 80,
    complete: 100
  }[currentStep]

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('input-guide')
        break
      case 'input-guide':
        // User should analyze a study - wait for them to do it
        break
      case 'waiting-analysis':
        // Wait for analysis to complete
        break
      case 'results-overview':
        setCurrentStep('results-details')
        break
      case 'results-details':
        handleComplete()
        break
      default:
        handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsOpen(false)
    onComplete()
  }

  const handleAnalyzeSample = () => {
    analyzeUrl(sampleUrl)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                Welcome to AnalytIQ
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
                Let's get you started! We'll walk you through analyzing your first study and understanding the results.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-foreground">What you'll learn:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>How to analyze a scientific study</li>
                  <li>Understanding trust scores and ratings</li>
                  <li>Interpreting detailed analysis results</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'input-guide':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Step 1: Analyze a Study
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
                To get started, you need to analyze a study. You can paste a URL or enter text/abstract directly.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                  💡 Quick Start
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                  Click the button below to analyze a sample study, or enter your own study URL/text in the form above.
                </p>
                <Button onClick={handleAnalyzeSample} className="w-full sm:w-auto">
                  Analyze Sample Study
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-left text-sm space-y-2">
                <p className="font-semibold text-foreground">Supported formats:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>Web pages (HTML articles, journals)</li>
                  <li>PDF files (.pdf)</li>
                  <li>DOI links (doi.org)</li>
                  <li>Journal sites (PubMed, arXiv, etc.)</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'waiting-analysis':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Analyzing Study...
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Our AI is analyzing the study. This may take a moment. We'll guide you through the results once it's complete!
              </p>
            </div>
          </div>
        )

      case 'results-overview':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Analysis Complete!
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
                Great! Your study has been analyzed. Let's explore what the results mean.
              </p>
              {results && (
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-4xl font-bold text-primary">
                      {results.trustScore.overall}
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-semibold">
                        {results.trustScore.rating}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Overall Trust Score
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This score represents the overall reliability of the study across 5 key categories.
                  </p>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-4 text-left text-sm space-y-2">
                <p className="font-semibold text-foreground">What you'll see in the results:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li><strong>Trust Score:</strong> Overall reliability rating</li>
                  <li><strong>Category Breakdown:</strong> Scores for 5 key areas</li>
                  <li><strong>Key Takeaways:</strong> Main findings and insights</li>
                  <li><strong>Detailed Analysis:</strong> Technical critique and bias report</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'results-details':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-6">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
                <Eye className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Understanding Your Results
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
                Here's how to interpret the analysis results:
              </p>
              <div className="space-y-4 text-left">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Category Scores</p>
                      <p className="text-sm text-muted-foreground">
                        Each category (Methodology, Evidence Strength, Bias, etc.) is scored individually. Click on any category card to see detailed breakdowns.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Search className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Detailed Analysis Tabs</p>
                      <p className="text-sm text-muted-foreground">
                        Switch between "Simple Summary", "Technical Critique", and "Bias Report" to explore different aspects of the analysis.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold mb-1">Save Your Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        You can save analyses for later reference. Access them anytime from the "Saved" page in the header.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" showCloseButton={false}>
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              {currentStep === 'welcome' && 'Step 1 of 5'}
              {currentStep === 'input-guide' && 'Step 2 of 5'}
              {currentStep === 'waiting-analysis' && 'Step 3 of 5'}
              {currentStep === 'results-overview' && 'Step 4 of 5'}
              {currentStep === 'results-details' && 'Step 5 of 5'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="px-6 py-8 pb-6 max-h-[70vh] overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 pb-6 border-t pt-4">
          <div className="flex items-center justify-end gap-4">
            {(currentStep === 'welcome' || currentStep === 'results-overview' || currentStep === 'results-details') && (
              <Button
                onClick={handleNext}
                className="gap-2"
                size="lg"
              >
                {currentStep === 'results-details' ? (
                  <>
                    Get Started
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
            {(currentStep === 'input-guide' || currentStep === 'waiting-analysis') && (
              <div className="text-sm text-muted-foreground text-center flex-1">
                {currentStep === 'input-guide' && (
                  <p>Enter a study URL or text above, or use the sample button</p>
                )}
                {currentStep === 'waiting-analysis' && (
                  <p>Please wait while we analyze the study...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 -z-10 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to check if onboarding should be shown
export function useOnboarding(user: any, forceShow?: boolean) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }

    // If forced to show (via question mark button), show it immediately
    if (forceShow) {
      setShowOnboarding(true)
      setIsLoading(false)
      return
    }

    // Only show onboarding for signed-in users
    if (!user) {
      setShowOnboarding(false)
      setIsLoading(false)
      return
    }

    // Check if onboarding was already completed for this user
    const completedKey = `analytiq-onboarding-completed-${user.id}`
    const completed = localStorage.getItem(completedKey) === 'true'

    // If already completed, don't show onboarding
    if (completed) {
      setShowOnboarding(false)
      setIsLoading(false)
      // Clear any signup flags since onboarding is already done
      sessionStorage.removeItem('analytiq-just-signed-up')
      return
    }

    // Check if this is a new signup (user just signed up)
    const justSignedUp = sessionStorage.getItem('analytiq-just-signed-up') === 'true'
    
    // Also check if user was created very recently (within last 5 minutes) as a fallback
    // This helps catch cases where the flag might not be set, including email confirmations
    const userCreatedAt = user.created_at ? new Date(user.created_at).getTime() : 0
    const userUpdatedAt = user.updated_at ? new Date(user.updated_at).getTime() : userCreatedAt
    // Check if user was created recently OR if created_at and updated_at are very close (new account)
    const isVeryNewUser = userCreatedAt > 0 && (
      (Date.now() - userCreatedAt < 300000) || // Created within last 5 minutes
      (Math.abs(userCreatedAt - userUpdatedAt) < 10000) // Created and updated within 10 seconds (new account)
    )

    // Show onboarding if user just signed up (flag set) OR if they're a very new user
    // This ensures first-time signups and email confirmations always see onboarding
    const shouldShow = (justSignedUp || isVeryNewUser) && !completed
    
    setShowOnboarding(shouldShow)
    setIsLoading(false)

    // Clear the signup flag after checking (but only if we're showing onboarding)
    // This prevents it from showing again on page refresh
    if (justSignedUp && shouldShow) {
      // Don't remove immediately - wait until onboarding is completed
      // This allows the flag to persist if user refreshes during onboarding
    }
  }, [user, forceShow])

  const completeOnboarding = () => {
    if (user?.id) {
      const completedKey = `analytiq-onboarding-completed-${user.id}`
      localStorage.setItem(completedKey, 'true')
      // Clear the signup flag once onboarding is completed
      sessionStorage.removeItem('analytiq-just-signed-up')
    } else {
      localStorage.setItem('analytiq-onboarding-completed', 'true')
    }
    setShowOnboarding(false)
  }

  return { showOnboarding, isLoading, completeOnboarding }
}
