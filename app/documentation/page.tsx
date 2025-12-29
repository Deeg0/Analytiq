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
  IconFileText,
  IconPlus,
  IconFile,
} from "@tabler/icons-react"

export default function DocumentationPage() {
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
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Documentation
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Research Papers and Reports
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Create, organize, and share your research papers and documentation.
                  </p>
                </div>
                <Button disabled>
                  <IconPlus className="h-4 w-4 mr-2" />
                  New Document
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconFileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Research Papers</CardTitle>
                    <CardDescription className="text-sm">
                      Write and format academic research papers.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      Create Paper
                    </Button>
                  </CardContent>
                </Card>

                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconFile className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Reports</CardTitle>
                    <CardDescription className="text-sm">
                      Generate comprehensive research reports.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" disabled>
                      Create Report
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Documents */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Recent Documents</h2>
                  <Button variant="outline" size="sm" disabled>
                    View All
                  </Button>
                </div>
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No documents yet. Create your first document to get started.</p>
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

