'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AnalysisResult } from '@/lib/types/analysis'

interface AnalysisContextType {
  loading: boolean
  results: AnalysisResult | null
  error: string | null
  analyzeUrl: (url: string) => Promise<void>
  analyzeText: (text: string) => Promise<void>
  saveAnalysis: (title?: string) => Promise<{ success: boolean; error?: string }>
  saving: boolean
  isSavedAnalysis?: boolean // Flag to indicate if viewing a saved analysis
}

export const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

interface AnalysisProviderProps {
  children: ReactNode
  user?: any
  onAuthRequired?: () => void
}

export function AnalysisProvider({ children, user, onAuthRequired }: AnalysisProviderProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Clear analysis results on page load/reload
  useEffect(() => {
    setResults(null)
    setError(null)
    setLoading(false)
  }, []) // Empty dependency array means this runs once on mount

  // Determine which API endpoint to use
  const getApiUrl = () => {
    // Use Railway backend if configured, otherwise use Next.js API route
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (backendUrl) {
      return `${backendUrl}/api/analyze`
    }
    return '/api/analyze'
  }

  const analyzeUrl = async (url: string) => {
    // Check if user is authenticated - always require sign in
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    // Clear old results immediately when starting new analysis
    setResults(null)
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'url', content: url }),
      })
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`)
      }
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the study')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const analyzeText = async (text: string) => {
    // Check if user is authenticated - always require sign in
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    // Clear old results immediately when starting new analysis
    setResults(null)
    setError(null)
    setLoading(true)
    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputType: 'text', content: text }),
      })
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text()
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`)
      }
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }
      setResults(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the study')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const saveAnalysis = async (title?: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      }
      return { success: false, error: 'You must be signed in to save analyses' }
    }

    if (!results) {
      return { success: false, error: 'No analysis results to save' }
    }

    setSaving(true)
    try {
      const response = await fetch('/api/saved-analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          analysisData: results,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save analysis')
      }

      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to save analysis' }
    } finally {
      setSaving(false)
    }
  }

  return (
    <AnalysisContext.Provider value={{ loading, results, error, analyzeUrl, analyzeText, saveAnalysis, saving, isSavedAnalysis: false }}>
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

