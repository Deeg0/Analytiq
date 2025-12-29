"use client"

import * as React from "react"
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
import {
  IconSparkles,
  IconBrain,
  IconBulb,
  IconChartLine,
} from "@tabler/icons-react"

export default function AIInsightsPage() {
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
            {/* Header Section */}
            <div className="px-4 pt-6 pb-4 md:px-6 lg:pt-8 lg:pb-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  AI Insights
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  AI-Powered Research Tools
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Leverage AI to discover patterns, generate hypotheses, and accelerate your research.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconBrain className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Pattern Detection</CardTitle>
                    <CardDescription className="text-sm">
                      Identify patterns and correlations in your research data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      Analyze Patterns
                    </Button>
                  </CardContent>
                </Card>

                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconBulb className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Hypothesis Generator</CardTitle>
                    <CardDescription className="text-sm">
                      Generate research hypotheses based on your data and findings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      Generate Hypotheses
                    </Button>
                  </CardContent>
                </Card>

                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconChartLine className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Predictive Analysis</CardTitle>
                    <CardDescription className="text-sm">
                      Use AI to predict trends and outcomes from your data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      Run Prediction
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Insights */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Recent AI Insights</h2>
                  <Button variant="outline" size="sm" disabled>
                    View All
                  </Button>
                </div>
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <IconSparkles className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-muted-foreground">No insights yet. Run an analysis to get AI-powered insights.</p>
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

