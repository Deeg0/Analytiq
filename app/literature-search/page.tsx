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
import { Input } from "@/components/ui/input"
import {
  IconSearch,
  IconBook,
  IconFileText,
} from "@tabler/icons-react"

export default function LiteratureSearchPage() {
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
                  Literature Search
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                  Find Academic Papers and Publications
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Search and discover relevant academic papers and research publications.
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {/* Search Section */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Search Literature</CardTitle>
                  <CardDescription>
                    Enter keywords, author names, or topics to find relevant papers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search papers, authors, topics..."
                        className="pl-10"
                        disabled
                      />
                    </div>
                    <Button disabled>Search</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Search Options */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconBook className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Search by Topic</CardTitle>
                    <CardDescription className="text-sm">
                      Find papers related to specific research topics.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconFileText className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Search by Author</CardTitle>
                    <CardDescription className="text-sm">
                      Discover papers from specific researchers.
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="transition-all hover:shadow-md hover:border-primary/20">
                  <CardHeader className="gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <IconSearch className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">Advanced Search</CardTitle>
                    <CardDescription className="text-sm">
                      Use filters and advanced search options.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>

              {/* Search Results */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Search Results</h2>
                  <Button variant="outline" size="sm" disabled>
                    Filter Results
                  </Button>
                </div>
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Enter a search query to find academic papers and publications.</p>
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

