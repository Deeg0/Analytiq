"use client"

import * as React from "react"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createSupabaseClient } from "@/lib/supabase/client"
import { IconCheck, IconArrowRight } from "@tabler/icons-react"

function EmailConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"confirming" | "success" | "error">("confirming")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        const supabase = createSupabaseClient()
        
        // Check for hash-based token (Supabase uses #access_token=...)
        const hash = window.location.hash
        if (hash && hash.includes('access_token')) {
          // Supabase handles hash-based tokens automatically
          // Wait a bit for the session to be established
          await new Promise(resolve => setTimeout(resolve, 500))
          
          // Check if we now have a session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          if (session && !sessionError) {
            // Email confirmed successfully
            setStatus("success")
            // Clean up URL
            window.history.replaceState({}, '', '/auth/confirm')
            return
          }
        }
        
        // Check for query params (token_hash or type)
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        
        if (tokenHash && type === 'signup') {
          // Handle token_hash (OTP verification)
          const { error: confirmError, data } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup',
          })

          if (confirmError) {
            setError(confirmError.message)
            setStatus("error")
            return
          }
          
          if (data?.session) {
            // Email confirmed successfully
            setStatus("success")
            // Clean up URL
            router.replace('/auth/confirm')
          }
        } else {
          // No confirmation tokens found, check if already confirmed
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setStatus("success")
          } else {
            setError("No confirmation token found. Please check your email and use the confirmation link.")
            setStatus("error")
          }
        }
      } catch (err) {
        console.error('Email confirmation error:', err)
        setError(err instanceof Error ? err.message : "Failed to confirm email")
        setStatus("error")
      }
    }

    handleEmailConfirmation()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src="/logoanaly.png"
            alt="AnalytIQ Logo"
            width={64}
            height={64}
            className="h-16 w-16"
          />
        </div>

        {status === "confirming" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirming your email...</CardTitle>
              <CardDescription>
                Please wait while we verify your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "success" && (
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <IconCheck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-center">Email Confirmed!</CardTitle>
              <CardDescription className="text-center">
                Your email has been successfully verified. You can now continue with your account setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => router.push("/onboarding")}
                className="w-full"
                size="lg"
              >
                Continue to Onboarding
                <IconArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}

        {status === "error" && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmation Failed</CardTitle>
              <CardDescription>
                There was an issue confirming your email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/onboarding")}
                  className="w-full"
                  size="lg"
                >
                  Return to Onboarding
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function EmailConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <EmailConfirmContent />
    </Suspense>
  )
}

