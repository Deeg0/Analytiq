'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { AnalysisResult } from '@/lib/types/analysis'

interface AnalysisContextType {
  loading: boolean
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
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeUrl = async (url: string) => {
    // Check if user is authenticated
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
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
    // Check if user is authenticated
    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/analyze', {
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

  return (
    <AnalysisContext.Provider value={{ loading, results, error, analyzeUrl, analyzeText }}>
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

