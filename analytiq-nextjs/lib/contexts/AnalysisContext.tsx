'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { AnalysisResult } from '@/lib/types/analysis'

interface AnalysisContextType {
  loading: boolean
  results: AnalysisResult | null
  error: string | null
  user: any
  inputType: 'url' | 'text' | null
  inputContent: string | null
  analyzeUrl: (url: string) => Promise<void>
  analyzeText: (text: string) => Promise<void>
  setResults: (results: AnalysisResult | null, inputType?: 'url' | 'text', inputContent?: string) => void
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
  const [inputType, setInputType] = useState<'url' | 'text' | null>(null)
  const [inputContent, setInputContent] = useState<string | null>(null)

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
    // Check if user is authenticated (only for Next.js API route)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl && !user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    setInputType('url')
    setInputContent(url)
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
    // Check if user is authenticated (only for Next.js API route)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl && !user && onAuthRequired) {
      onAuthRequired()
      return
    }

    setLoading(true)
    setError(null)
    setInputType('text')
    setInputContent(text)
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

  const setResultsDirectly = (newResults: AnalysisResult | null, newInputType?: 'url' | 'text', newInputContent?: string) => {
    setResults(newResults)
    if (newInputType) setInputType(newInputType)
    if (newInputContent) setInputContent(newInputContent)
    setError(null)
  }

  return (
    <AnalysisContext.Provider value={{ loading, results, error, user, inputType, inputContent, analyzeUrl, analyzeText, setResults: setResultsDirectly }}>
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

