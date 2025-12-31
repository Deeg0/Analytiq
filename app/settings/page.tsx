"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import {
  IconSettings,
  IconUser,
  IconLock,
  IconMoon,
  IconSun,
  IconLogout,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"

export default function SettingsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    organization: "",
    researchField: "",
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    setMounted(true)
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserData({
          name: (user.user_metadata?.full_name as string) || "",
          email: user.email || "",
          organization: (user.user_metadata?.organization as string) || "",
          researchField: (user.user_metadata?.research_field as string) || "",
        })
      }
    } catch (err) {
      console.error('Error fetching user data:', err)
      setError("Failed to load user data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createSupabaseClient()
      
      // Verify session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        throw new Error("Session expired. Please sign in again.")
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          organization: userData.organization || null,
          research_field: userData.researchField || null,
        },
      })

      if (updateError) {
        if (updateError.message.includes('JWT') || updateError.message.includes('sub claim')) {
          // Refresh session and retry
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            throw new Error("Session expired. Please sign in again.")
          }
          
          const { error: retryError } = await supabase.auth.updateUser({
            data: {
              full_name: userData.name,
              organization: userData.organization || null,
              research_field: userData.researchField || null,
            },
          })
          
          if (retryError) {
            throw new Error(retryError.message)
          }
        } else {
          throw new Error(updateError.message)
        }
      }

      setSuccess("Profile updated successfully!")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      setIsSaving(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsSaving(false)
      return
    }

    try {
      const supabase = createSupabaseClient()
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) {
        throw new Error(updateError.message)
      }

      setSuccess("Password updated successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
      router.push('/onboarding')
    } catch (err) {
      console.error('Error signing out:', err)
    }
  }

  // Show loading spinner while checking authentication
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            {/* Header */}
            <div className="px-4 pt-6 pb-4 md:px-6 lg:pt-8 lg:pb-6">
              <div className="flex items-center gap-3">
                <IconSettings className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {success && (
                <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                  <IconCheck className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6 max-w-3xl">
                {/* Profile Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconUser className="h-5 w-5 text-primary" />
                      <CardTitle>Profile Information</CardTitle>
                    </div>
                    <CardDescription>
                      Update your personal information and preferences.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          disabled={isSaving}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          disabled
                          className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                          Email cannot be changed. Contact support if you need to update your email.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <Input
                          id="organization"
                          value={userData.organization}
                          onChange={(e) => setUserData({ ...userData, organization: e.target.value })}
                          placeholder="University, Company, etc."
                          disabled={isSaving}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="researchField">Research Field</Label>
                        <Input
                          id="researchField"
                          value={userData.researchField}
                          onChange={(e) => setUserData({ ...userData, researchField: e.target.value })}
                          placeholder="e.g., Biology, Physics, Social Sciences"
                          disabled={isSaving}
                        />
                      </div>
                      
                      <Button type="submit" disabled={isSaving || !userData.name}>
                        {isSaving ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <IconLock className="h-5 w-5 text-primary" />
                      <CardTitle>Change Password</CardTitle>
                    </div>
                    <CardDescription>
                      Update your password to keep your account secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password *</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder="Enter new password (min. 6 characters)"
                          disabled={isSaving}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder="Confirm new password"
                          disabled={isSaving}
                          required
                        />
                      </div>
                      
                      <Button type="submit" disabled={isSaving || !passwordData.newPassword || !passwordData.confirmPassword}>
                        {isSaving ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {mounted && theme === "dark" ? (
                        <IconMoon className="h-5 w-5 text-primary" />
                      ) : (
                        <IconSun className="h-5 w-5 text-primary" />
                      )}
                      <CardTitle>Appearance</CardTitle>
                    </div>
                    <CardDescription>
                      Customize the appearance of the application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Theme</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose between light and dark mode
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        disabled={!mounted}
                      >
                        {mounted && theme === "dark" ? (
                          <>
                            <IconSun className="h-4 w-4 mr-2" />
                            Light Mode
                          </>
                        ) : (
                          <>
                            <IconMoon className="h-4 w-4 mr-2" />
                            Dark Mode
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                    <CardDescription>
                      Manage your account and session.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sign Out</Label>
                          <p className="text-sm text-muted-foreground">
                            Sign out of your account
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLogout}
                        >
                          <IconLogout className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

