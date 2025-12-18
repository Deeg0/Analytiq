'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  FileText,
  Eye,
  Lightbulb,
  Loader2
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
  | 'complete'

const EXAMPLE_STUDY_URL = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10577092/'

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const { loading, results, analyzeUrl } = useAnalysis()
  const [isVisible, setIsVisible] = useState(true)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Monitor analysis progress
  useEffect(() => {
    if (currentStep === 'input-guide' && loading) {
      setCurrentStep('waiting-analysis')
    }
  }, [loading, currentStep])

  // When analysis completes, move to results overview
  useEffect(() => {
    if (currentStep === 'waiting-analysis' && results && !loading) {
      setTimeout(() => {
        const resultsElement = document.getElementById('analysis-results')
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        setTimeout(() => {
          setCurrentStep('results-overview')
        }, 1000)
      }, 500)
    }
  }, [results, loading, currentStep])

  // Update target rect for spotlight positioning
  useEffect(() => {
    const updateTargetRect = () => {
      let target: HTMLElement | null = null
      
      if (currentStep === 'input-guide') {
        target = document.querySelector('[data-onboarding-target="input"]') as HTMLElement
      } else if (currentStep === 'results-overview') {
        target = document.getElementById('analysis-results')
      }

      if (target) {
        const rect = target.getBoundingClientRect()
        setTargetRect(rect)
      } else {
        setTargetRect(null)
      }
    }

    updateTargetRect()
    
    if (currentStep === 'input-guide' || currentStep === 'results-overview') {
      updateIntervalRef.current = setInterval(updateTargetRect, 100)
      window.addEventListener('scroll', updateTargetRect)
      window.addEventListener('resize', updateTargetRect)
    }

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current)
      }
      window.removeEventListener('scroll', updateTargetRect)
      window.removeEventListener('resize', updateTargetRect)
    }
  }, [currentStep])

  // Highlight target element
  useEffect(() => {
    const inputTarget = document.querySelector('[data-onboarding-target="input"]') as HTMLElement
    if (currentStep === 'input-guide' && inputTarget) {
      inputTarget.style.transition = 'all 0.3s ease'
      inputTarget.style.transform = 'scale(1.01)'
      inputTarget.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      inputTarget.style.zIndex = '40'
      inputTarget.style.position = 'relative'
    } else if (inputTarget) {
      inputTarget.style.transform = ''
      inputTarget.style.boxShadow = ''
      inputTarget.style.zIndex = ''
      inputTarget.style.position = ''
    }
  }, [currentStep])

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('input-guide')
        setTimeout(() => {
          const inputSection = document.querySelector('[data-onboarding-target="input"]')
          inputSection?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 100)
        break
      case 'input-guide':
        // User needs to enter URL - wait for them
        break
      case 'waiting-analysis':
        // Wait for analysis
        break
      case 'results-overview':
        handleComplete()
        break
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    onComplete()
  }

  const handleUseExample = () => {
    analyzeUrl(EXAMPLE_STUDY_URL)
  }

  if (!isVisible) return null

  // Render welcome modal
  if (currentStep === 'welcome') {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full relative">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold">Welcome to AnalytIQ!</h2>
              <p className="text-muted-foreground">
                Let's analyze your first study together. We'll guide you through each step right on the page.
              </p>
              <div className="flex gap-3 justify-center pt-4">
                <Button variant="outline" onClick={handleSkip}>
                  Skip
                </Button>
                <Button onClick={handleNext} className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render spotlight overlay for other steps
  if (!targetRect) return null

  const spotlightX = targetRect.left + targetRect.width / 2
  const spotlightY = targetRect.top + targetRect.height / 2
  const spotlightRadius = Math.max(targetRect.width, targetRect.height) / 2 + 20

  return (
    <>
      {/* Dark overlay with spotlight cutout */}
      <div 
        className="fixed inset-0 z-40 pointer-events-auto"
        style={{
          background: `radial-gradient(ellipse ${spotlightRadius * 2}px ${spotlightRadius * 2}px at ${spotlightX}px ${spotlightY}px, transparent 0%, transparent 45%, rgba(0,0,0,0.75) 45%)`,
        }}
        onClick={(e) => {
          // Allow clicks through to the highlighted element
          if (currentStep === 'input-guide') {
            const inputTarget = document.querySelector('[data-onboarding-target="input"]')
            if (inputTarget && inputTarget.contains(e.target as Node)) {
              return
            }
          }
        }}
      />
      
      {/* Tooltip card */}
      <div
        className="fixed z-50 pointer-events-auto"
        style={{
          top: `${targetRect.bottom + 20}px`,
          left: `${Math.min(targetRect.left, window.innerWidth - 420)}px`,
          maxWidth: '400px',
        }}
      >
        <Card className="shadow-2xl border-2 border-primary bg-background">
          <CardContent className="p-5">
            {currentStep === 'input-guide' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Step 1: Enter a Study URL</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Paste a study URL in the field above. We'll use this example study about red meat consumption and cancer risk:
                    </p>
                    <div className="bg-muted rounded-md p-2 mb-3 border">
                      <code className="text-xs break-all text-foreground">{EXAMPLE_STUDY_URL}</code>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handleUseExample}
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          'Use Example Study'
                        )}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleSkip}
                      >
                        Skip
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Or paste your own study URL in the input field above.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'waiting-analysis' && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8">
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-primary/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-full h-full border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Analyzing Study...</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI is analyzing the study. This may take a moment. We'll show you the results next!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'results-overview' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Analysis Complete! 🎉</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Here's what you're seeing in the results:
                    </p>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span><strong>Trust Score:</strong> Overall reliability rating (0-100) - higher is better</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span><strong>Category Breakdown:</strong> Scores for Methodology, Evidence Strength, Bias Detection, Reproducibility, and Statistical Validity</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span><strong>Key Takeaways:</strong> Main findings and insights from the study</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span><strong>Detailed Analysis:</strong> Technical critique, bias report, and expert context</span>
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-900 dark:text-blue-100">
                          <strong>Tip:</strong> Click on any category card to see detailed breakdowns. Switch between "Simple Summary", "Technical Critique", and "Bias Report" tabs to explore different views.
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleComplete} className="w-full gap-2">
                      Got it! Let me explore
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
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
      sessionStorage.removeItem('analytiq-just-signed-up')
      return
    }

    // Check if this is a new signup (user just signed up)
    const justSignedUp = sessionStorage.getItem('analytiq-just-signed-up') === 'true'
    
    // Also check if user was created very recently (within last 5 minutes) as a fallback
    const userCreatedAt = user.created_at ? new Date(user.created_at).getTime() : 0
    const userUpdatedAt = user.updated_at ? new Date(user.updated_at).getTime() : userCreatedAt
    const isVeryNewUser = userCreatedAt > 0 && (
      (Date.now() - userCreatedAt < 300000) || 
      (Math.abs(userCreatedAt - userUpdatedAt) < 10000)
    )

    const shouldShow = (justSignedUp || isVeryNewUser) && !completed
    
    setShowOnboarding(shouldShow)
    setIsLoading(false)
  }, [user, forceShow])

  const completeOnboarding = () => {
    if (user?.id) {
      const completedKey = `analytiq-onboarding-completed-${user.id}`
      localStorage.setItem(completedKey, 'true')
      sessionStorage.removeItem('analytiq-just-signed-up')
    } else {
      localStorage.setItem('analytiq-onboarding-completed', 'true')
    }
    setShowOnboarding(false)
  }

  return { showOnboarding, isLoading, completeOnboarding }
}
