'use client'

import { createContext, useContext, useState, useRef, ReactNode } from 'react'
import { AnalysisResult } from '@/lib/types/analysis'

interface AnalysisContextType {
  loading: boolean
  progress: number
  estimatedTimeRemaining: number | null
  results: AnalysisResult | null
  error: string | null
  analyzeUrl: (url: string) => Promise<void>
  analyzeText: (text: string) => Promise<void>
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

interface AnalysisProviderProps {
  children: ReactNode
  user?: any
  onAuthRequired?: () => void
}

export function AnalysisProvider({ children, user, onAuthRequired }: AnalysisProviderProps) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Estimate time based on input type and content length
  const estimateTime = (inputType: string, content: string): number => {
    const baseTime = 15 // Base time in seconds
    let additionalTime = 0
    
    if (inputType === 'url') {
      additionalTime = 20 // URL scraping takes longer
    } else if (inputType === 'text') {
      // Estimate based on text length (roughly 1 second per 500 characters)
      additionalTime = Math.max(10, Math.min(30, content.length / 500))
    }
    
    return Math.round(baseTime + additionalTime)
  }
  
  // Simulate progress updates
  const simulateProgress = (totalTime: number) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }
    
    const startTime = Date.now()
    progressIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000
      const progressPercent = Math.min(95, (elapsed / totalTime) * 100)
      const remaining = Math.max(0, totalTime - elapsed)
      
      setProgress(progressPercent)
      setEstimatedTimeRemaining(Math.round(remaining))
      
      if (progressPercent >= 95) {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }
      }
    }, 500)
  }
  
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const analyzeUrl = async (url: string) => {
    // Check if user is authenticated
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)
    
    const estimatedTime = estimateTime('url', url)
    setEstimatedTimeRemaining(estimatedTime)
    
    simulateProgress(estimatedTime)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'url', content: url }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setProgress(100)
      setEstimatedTimeRemaining(0)
      setResults(data)
    } catch (err: any) {
      setError(err.message)
      setResults(null)
    } finally {
      clearProgressInterval()
      setLoading(false)
      setProgress(0)
      setEstimatedTimeRemaining(null)
    }
  }

  const analyzeText = async (text: string) => {
    // Check if user is authenticated
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)
    
    const estimatedTime = estimateTime('text', text)
    setEstimatedTimeRemaining(estimatedTime)
    
    simulateProgress(estimatedTime)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'text', content: text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      setProgress(100)
      setEstimatedTimeRemaining(0)
      setResults(data)
    } catch (err: any) {
      setError(err.message)
      setResults(null)
    } finally {
      clearProgressInterval()
      setLoading(false)
      setProgress(0)
      setEstimatedTimeRemaining(null)
    }
  }

  return (
    <AnalysisContext.Provider value={{ loading, progress, estimatedTimeRemaining, results, error, analyzeUrl, analyzeText }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
}

