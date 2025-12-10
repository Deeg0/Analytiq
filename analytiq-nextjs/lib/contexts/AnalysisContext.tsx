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
      
      // Get response text first
      const responseText = await response.text()
      
      // Try to parse as JSON first
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // If JSON parsing fails, check for HTML timeout errors
        if (responseText.includes('Inactivity Timeout') || responseText.includes('<HTML>') || responseText.includes('<html>')) {
          throw new Error('Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
        }
        // If it's not HTML timeout, it's an invalid response
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`)
      }
      
      // Check if response is not OK
      if (!response.ok) {
        // Use error message from JSON if available, otherwise use status-based message
        const errorMessage = data.error || data.errorMessage || data.details
        if (response.status === 504 || response.status === 502) {
          throw new Error(errorMessage || 'Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
        }
        throw new Error(errorMessage || `Request failed with status ${response.status}`)
      }
      setResults(data)
    } catch (err: any) {
      // Handle fetch errors (network issues, timeouts, etc.)
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your connection and try again.')
      } else if (err.message?.includes('timeout') || err.message?.includes('Timeout') || err.message?.includes('Inactivity Timeout')) {
        setError('Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
      } else {
        setError(err.message || 'An error occurred while analyzing the study')
      }
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
      
      // Get response text first
      const responseText = await response.text()
      
      // Try to parse as JSON first
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // If JSON parsing fails, check for HTML timeout errors
        if (responseText.includes('Inactivity Timeout') || responseText.includes('<HTML>') || responseText.includes('<html>')) {
          throw new Error('Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
        }
        // If it's not HTML timeout, it's an invalid response
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`)
      }
      
      // Check if response is not OK
      if (!response.ok) {
        // Use error message from JSON if available, otherwise use status-based message
        const errorMessage = data.error || data.errorMessage || data.details
        if (response.status === 504 || response.status === 502) {
          throw new Error(errorMessage || 'Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
        }
        throw new Error(errorMessage || `Request failed with status ${response.status}`)
      }
      setResults(data)
    } catch (err: any) {
      // Handle fetch errors (network issues, timeouts, etc.)
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error: Unable to connect to the server. Please check your connection and try again.')
      } else if (err.message?.includes('timeout') || err.message?.includes('Timeout') || err.message?.includes('Inactivity Timeout')) {
        setError('Request timeout: The analysis took too long. Please try again with a shorter input or try again later.')
      } else {
        setError(err.message || 'An error occurred while analyzing the study')
      }
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

