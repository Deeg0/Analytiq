"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

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
  IconFlask,
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconSparkles,
  IconSearch,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"

export default function Page() {
  // TODO: Get name from signup/authentication
  const name: string | null = null; // This will be populated from signup/auth
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
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
                  {name ? (
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                      Hello, <span className="text-foreground">{name}</span>
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconFlask className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Data Analysis</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Statistical analysis and data processing tools.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconChartBar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Visualization</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Create charts and visualizations for your findings.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconDatabase className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Data Management</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Organize and manage research data securely.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconFileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Documentation</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Create, organize, and share research papers and reports.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconSearch className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">Literature Search</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        Find and review academic papers and publications.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <IconSparkles className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-lg">AI Insights</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">
                        AI-powered tools to discover patterns and generate hypotheses.
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
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