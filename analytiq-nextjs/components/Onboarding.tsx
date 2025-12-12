'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileText, 
  Search, 
  TrendingUp, 
  BookOpen, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Globe,
  FileUp,
  Hash
} from 'lucide-react'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  highlight?: string
}

const steps: OnboardingStep[] = [
  {
    title: 'Welcome to AnalytIQ',
    description: 'Your AI-powered scientific study analyzer. Get credibility scores, bias detection, and comprehensive analysis of research papers.',
    icon: <Sparkles className="h-12 w-12 text-primary" />,
    highlight: 'AI-Powered Analysis'
  },
  {
    title: 'Multiple Input Methods',
    description: 'Analyze studies by pasting a URL or entering text/abstracts directly. Choose the method that works best for your research.',
    icon: <FileText className="h-12 w-12 text-primary" />,
    highlight: 'URL • Text/Abstract'
  },
  {
    title: 'Comprehensive Scoring',
    description: 'Get detailed scores across 5 key categories: Methodology Quality, Evidence Strength, Bias Detection, Reproducibility, and Statistical Validity. Each category is thoroughly analyzed.',
    icon: <TrendingUp className="h-12 w-12 text-primary" />,
    highlight: '5 Scoring Categories'
  },
  {
    title: 'Save & Organize',
    description: 'Save your analyses for later reference. Search, filter by score or date, and organize your saved studies. Access your research history anytime.',
    icon: <BookOpen className="h-12 w-12 text-primary" />,
    highlight: 'Save Your Analyses'
  },
  {
    title: 'Expert Insights',
    description: 'Get detailed technical critiques, bias reports, and expert context. Understand study limitations, strengths, and how findings compare to field consensus.',
    icon: <Search className="h-12 w-12 text-primary" />,
    highlight: 'Deep Analysis'
  }
]

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isOpen, setIsOpen] = useState(true)

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsOpen(false)
    // onComplete callback will handle setting the completion flag
    onComplete()
  }

  const currentStepData = steps[currentStep]

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" showCloseButton={false}>
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
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
        <div className="px-6 py-8 pb-6">
          {/* Icon and Highlight */}
          <div className="flex flex-col items-center mb-8 animate-in fade-in-0 duration-500">
            <div className="mb-5 p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
              <div className="animate-in zoom-in-95 duration-500">
                {currentStepData.icon}
              </div>
            </div>
            {currentStepData.highlight && (
              <div className="px-5 py-2 rounded-full bg-primary/10 border border-primary/20 animate-in slide-in-from-bottom-2 duration-500">
                <span className="text-sm font-semibold text-primary">
                  {currentStepData.highlight}
                </span>
              </div>
            )}
          </div>

          {/* Title and Description */}
          <div className="text-center mb-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              {currentStepData.title}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {currentStepData.description}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-2 bg-primary/50 hover:bg-primary/70'
                    : 'w-2 bg-muted hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2 min-w-[100px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              className="gap-2 flex-1 max-w-xs"
              size="lg"
            >
              {currentStep === steps.length - 1 ? (
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
    
    // Also check if user was created very recently (within last 30 seconds) as a fallback
    // This helps catch cases where the flag might not be set
    const userCreatedAt = user.created_at ? new Date(user.created_at).getTime() : 0
    const isVeryNewUser = userCreatedAt > 0 && (Date.now() - userCreatedAt < 30000) // 30 seconds

    // Show onboarding if user just signed up (flag set) OR if they're a very new user
    // This ensures first-time signups always see onboarding
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
