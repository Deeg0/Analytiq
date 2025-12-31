"use client"

import * as React from "react"
import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  IconChartLine,
  IconFileText,
  IconTableExport,
  IconArrowRight,
  IconCheck,
  IconBrandGoogle,
} from "@tabler/icons-react"

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSignIn, setIsSignIn] = useState(false)
  const [emailConfirmationPending, setEmailConfirmationPending] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [cameFromOAuth, setCameFromOAuth] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    organization: "",
    researchField: "",
  })

  // Check if user is already authenticated (e.g., coming from email confirmation or OAuth)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        // If user has a session and is on step 1, move to step 2
        if (session && step === 1) {
          // Check if user has already completed onboarding
          // We use onboarding_completed flag to distinguish from Google-provided data
          const onboardingCompleted = session.user.user_metadata?.onboarding_completed === true
          if (onboardingCompleted) {
            // User has completed onboarding, redirect to dashboard
            router.push('/dashboard')
          } else {
            // User is authenticated but hasn't completed profile, move to step 2
            setStep(2)
            setEmailConfirmationPending(false)
            // Check if user came from OAuth (has provider metadata)
            const provider = session.user.app_metadata?.provider
            if (provider === 'google' || provider === 'oauth') {
              setCameFromOAuth(true)
            }
            // Pre-fill email from session
            if (session.user.email) {
              setFormData(prev => ({ ...prev, email: session.user.email || "" }))
            }
            // Pre-fill name from Google if available (user_metadata.name or user_metadata.full_name from Google)
            const googleName = session.user.user_metadata?.name || session.user.user_metadata?.full_name
            if (googleName) {
              setFormData(prev => {
                // Only set if not already set
                if (!prev.name) {
                  return { ...prev, name: googleName }
                }
                return prev
              })
            }
          }
        }
      } catch (err) {
        console.error('Session check error:', err)
      }
    }

    checkSession()
    // Also listen for auth state changes (for OAuth redirects)
    const supabase = createSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session && step === 1) {
        // Check if user has completed onboarding using our dedicated flag
        const onboardingCompleted = session.user.user_metadata?.onboarding_completed === true
        if (!onboardingCompleted) {
          // New user from OAuth, move to step 2
          setStep(2)
          setEmailConfirmationPending(false)
          setCameFromOAuth(true)
          if (session.user.email) {
            setFormData(prev => ({ ...prev, email: session.user.email || "" }))
          }
          const googleName = session.user.user_metadata?.name || session.user.user_metadata?.full_name
          if (googleName) {
            setFormData(prev => {
              if (!prev.name) {
                return { ...prev, name: googleName }
              }
              return prev
            })
          }
        } else {
          // Existing user, redirect to dashboard
          router.push('/dashboard')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [step, router])


  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleNext = async () => {
    if (step === 1) {
      // On step 1, sign up or sign in the user
      if (isSignIn) {
        await handleSignIn()
      } else {
        await handleSignup()
      }
    } else if (step === 2) {
      // On step 2, update user metadata with personal information
      await handleUpdateProfile()
    } else if (step < 3) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      // Going back from step 2 to step 1 - show confirmation dialog
      setShowLogoutDialog(true)
    } else if (step === 3) {
      // Going back from step 3 to step 2 - just go back
      setStep(2)
      setError(null)
    }
  }

  const handleConfirmLogout = async () => {
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      // Reset form and state
      setFormData({
        name: "",
        email: "",
        password: "",
        organization: "",
        researchField: "",
      })
      setStep(1)
      setError(null)
      setEmailConfirmationPending(false)
      setPendingEmail(null)
      setCameFromOAuth(false)
      setShowLogoutDialog(false)
    } catch (err) {
      console.error('Error signing out:', err)
      // Still go back even if sign out fails
      setStep(1)
      setError(null)
      setEmailConfirmationPending(false)
      setPendingEmail(null)
      setCameFromOAuth(false)
      setShowLogoutDialog(false)
    }
  }

  const handleSignup = async () => {
    // Validate form
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      // Sign up the user with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (data.user) {
        // Check if email confirmation is required
        if (data.session) {
          // Email confirmation not required, move to step 2
          setStep(2)
        } else {
          // Email confirmation required
          setEmailConfirmationPending(true)
          setPendingEmail(formData.email)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async () => {
    // Validate form
    if (!formData.email || !formData.password) {
      setError("Email and password are required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()

      // Sign in the user
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (data.user) {
        // Check if user has completed onboarding
        const onboardingCompleted = data.user.user_metadata?.onboarding_completed === true
        if (onboardingCompleted) {
          // User has completed onboarding, redirect to dashboard
        router.push("/dashboard")
        } else {
          // User hasn't completed onboarding, move to step 2
          setStep(2)
          if (data.user.email) {
            setFormData(prev => ({ ...prev, email: data.user.email || "" }))
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    // Validate that name is provided
    if (!formData.name) {
      setError("Name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      
      // First, verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error("Session expired. Please sign in again.")
      }
      
      // Update user metadata with personal information
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.name,
          organization: formData.organization || null,
          research_field: formData.researchField || null,
          onboarding_completed: true, // Flag to indicate onboarding is complete
        },
      })

      if (updateError) {
        // If update fails due to JWT issue, try refreshing the session first
        if (updateError.message.includes('JWT') || updateError.message.includes('sub claim')) {
          // Refresh the session and try again
          const { error: refreshError } = await supabase.auth.refreshSession()
          
          if (refreshError) {
            throw new Error("Session expired. Please sign in again.")
          }
          
          // Try updating again after refresh
          const { error: retryError } = await supabase.auth.updateUser({
            data: {
              full_name: formData.name,
              organization: formData.organization || null,
              research_field: formData.researchField || null,
              onboarding_completed: true, // Flag to indicate onboarding is complete
            },
          })
          
          if (retryError) {
            throw new Error(retryError.message)
          }
        } else {
          throw new Error(updateError.message)
        }
      }

      // Move to step 3 on success
      setStep(3)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    // Redirect to dashboard after successful onboarding
    router.push("/dashboard")
  }

  const handleGoogleSignIn = async () => {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in with Google")
    }
  }

  const features = [
    {
      icon: IconChartLine,
      title: "Study Analysis",
      description: "Statistical analysis and data processing tools.",
    },
    {
      icon: IconFileText,
      title: "Documentation",
      description: "Create, organize, and share research papers and reports.",
    },
    {
      icon: IconTableExport,
      title: "Data Extraction",
      description: "Extract structured data and tables from research documents.",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logoanaly.png"
              alt="AnalytIQ Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-lg font-semibold">AnalytIQ</span>
          </div>
          {/* No skip button - step 2 is required for new users */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Progress Indicator - Only show when not signing in */}
        {!isSignIn && (
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3].map((s) => (
                <React.Fragment key={s}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step >= s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step > s ? <IconCheck className="h-4 w-4" /> : s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`h-1 w-16 transition-colors ${
                        step > s ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Signup */}
        {step === 1 && !emailConfirmationPending && (
          <div className="space-y-8">
            {!isSignIn && (
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">
                  Create Your Account
                </h1>
                <p className="text-xl text-muted-foreground">
                  Get started with AnalytIQ.
                </p>
              </div>
            )}

            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle>{isSignIn ? "Sign In" : "Sign Up"}</CardTitle>
                <CardDescription>
                  {isSignIn
                    ? "Enter your email and password to sign in to your account."
                    : "Enter your email and password to create your account."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password (min. 6 characters)"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="w-full"
                  disabled={!formData.email || !formData.password || isLoading}
                >
                  {isLoading
                    ? isSignIn
                      ? "Signing In..."
                      : "Creating Account..."
                    : isSignIn
                    ? "Sign In"
                    : "Create Account"}
                  {!isLoading && <IconArrowRight className="h-4 w-4" />}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <IconBrandGoogle className="h-5 w-5" />
                  {isSignIn ? "Sign in" : "Sign up"} with Google
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignIn(!isSignIn)
                      setError(null)
                    }}
                    className="text-primary hover:underline"
                    disabled={isLoading}
                  >
                    {isSignIn
                      ? "Don't have an account? Sign up"
                      : "Already have an account? Sign in"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Email Confirmation Pending */}
        {step === 1 && emailConfirmationPending && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <IconCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Check Your Email
              </h1>
              <p className="text-xl text-muted-foreground">
                We've sent a confirmation link to <strong>{pendingEmail}</strong>
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Please click the confirmation link in the email to verify your account. Once confirmed, you'll be automatically taken to the next step.
              </p>
            </div>

            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEmailConfirmationPending(false)
                      setPendingEmail(null)
                    }}
                  >
                    Back to Sign Up
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">
                Tell us about yourself
              </h1>
              <p className="text-xl text-muted-foreground">
                Help us personalize your experience.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  We'll use this information to customize your workspace.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    placeholder="University, Company, etc."
                    value={formData.organization}
                    onChange={(e) =>
                      handleInputChange("organization", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="researchField">Research Field (Optional)</Label>
                  <Input
                    id="researchField"
                    placeholder="e.g., Biology, Physics, Social Sciences"
                    value={formData.researchField}
                    onChange={(e) =>
                      handleInputChange("researchField", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 max-w-2xl mx-auto">
              <Button
                variant="outline"
                onClick={handleBack}
                size="lg"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                size="lg"
                disabled={!formData.name || isLoading}
              >
                {isLoading ? "Saving..." : "Continue"}
                {!isLoading && <IconArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Complete */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <IconCheck className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                You're all set!
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Welcome to AnalytIQ, {formData.name || "researcher"}. Your
                workspace is ready.
              </p>
            </div>

            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Review Your Information</CardTitle>
                <CardDescription>
                  You can update this information later in your settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{formData.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                {formData.organization && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Organization</span>
                    <span className="font-medium">{formData.organization}</span>
                  </div>
                )}
                {formData.researchField && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Research Field</span>
                    <span className="font-medium">{formData.researchField}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4 max-w-2xl mx-auto">
              <Button variant="outline" onClick={handleBack} size="lg">
                Back
              </Button>
              <Button onClick={handleSubmit} size="lg">
                Go to Dashboard
                <IconArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Going back will log you out and you'll need to sign in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmLogout}>
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  )
}

