"use client"

import * as React from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { createSupabaseClient } from "@/lib/supabase/client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconChartLine,
  IconChartBar,
  IconFileText,
  IconSparkles,
  IconBook,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"

export default function Page() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [firstName, setFirstName] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Get user's name from Supabase
    const getUserName = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Get first name from user metadata
          const fullName = user.user_metadata?.full_name as string | undefined
          if (fullName) {
            // Extract first name (everything before the first space)
            const first = fullName.split(' ')[0]
            setFirstName(first)
          }
        }
      } catch (err) {
        console.error('Error getting user name:', err)
      }
    }

    getUserName()
  }, [])

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
            {/* Hero Section */}
            <div className="px-4 pt-6 pb-4 md:px-6 lg:pt-8 lg:pb-6">
              <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-3">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            My Workspace
                          </p>
                          {firstName ? (
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                              Hello, <span className="text-foreground">{firstName}</span>
                            </h1>
                          ) : (
                            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                              Hello
                            </h1>
                          )}
                        </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9"
                >
                  {mounted && theme === "dark" ? (
                    <IconSun className="h-5 w-5" />
                  ) : (
                    <IconMoon className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </div>
            </div>

            {/* Features Section */}
            <div className="px-4 pb-8 md:px-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                <Link href="/study-analysis" className="flex flex-col items-center gap-2">
                  <Card className="bg-muted transition-all hover:shadow-md hover:border-primary/20 cursor-pointer w-full aspect-square">
                    <CardHeader className="p-4 h-full flex items-center justify-center">
                      <IconChartLine className="h-8 w-8 text-primary" />
                    </CardHeader>
                  </Card>
                  <CardTitle className="text-sm text-center">Study Analysis</CardTitle>
                </Link>
                <Link href="/visualization" className="flex flex-col items-center gap-2">
                  <Card className="bg-muted transition-all hover:shadow-md hover:border-primary/20 cursor-pointer w-full aspect-square">
                    <CardHeader className="p-4 h-full flex items-center justify-center">
                      <IconChartBar className="h-8 w-8 text-primary" />
                    </CardHeader>
                  </Card>
                  <CardTitle className="text-sm text-center">Visualization</CardTitle>
                </Link>
                <Link href="/documentation" className="flex flex-col items-center gap-2">
                  <Card className="bg-muted transition-all hover:shadow-md hover:border-primary/20 cursor-pointer w-full aspect-square">
                    <CardHeader className="p-4 h-full flex items-center justify-center">
                      <IconFileText className="h-8 w-8 text-primary" />
                    </CardHeader>
                  </Card>
                  <CardTitle className="text-sm text-center">Documentation</CardTitle>
                </Link>
                <Link href="/literature-search" className="flex flex-col items-center gap-2">
                  <Card className="bg-muted transition-all hover:shadow-md hover:border-primary/20 cursor-pointer w-full aspect-square">
                    <CardHeader className="p-4 h-full flex items-center justify-center">
                      <IconBook className="h-8 w-8 text-primary" />
                    </CardHeader>
                  </Card>
                  <CardTitle className="text-sm text-center">Literature Search</CardTitle>
                </Link>
                <Link href="/ai-insights" className="flex flex-col items-center gap-2">
                  <Card className="bg-muted transition-all hover:shadow-md hover:border-primary/20 cursor-pointer w-full aspect-square">
                    <CardHeader className="p-4 h-full flex items-center justify-center">
                      <IconSparkles className="h-8 w-8 text-primary" />
                    </CardHeader>
                  </Card>
                  <CardTitle className="text-sm text-center">AI Insights</CardTitle>
                </Link>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="px-4 pb-8 md:px-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardHeader className="gap-3">
                      <CardTitle className="text-base">Recent Projects</CardTitle>
                      <CardDescription className="text-sm">
                        View and access your latest research projects.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardHeader className="gap-3">
                      <CardTitle className="text-base">Saved Documents</CardTitle>
                      <CardDescription className="text-sm">
                        Quick access to your saved research documents.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <Card className="transition-all hover:shadow-md hover:border-primary/20">
                    <CardHeader className="gap-3">
                      <CardTitle className="text-base">Analytics</CardTitle>
                      <CardDescription className="text-sm">
                        View insights and metrics for your research projects.
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}