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
  IconDatabase,
  IconUpload,
  IconFolder,
  IconPlus,
} from "@tabler/icons-react"

export default function DataManagementPage() {
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
                    Data Management
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Organize Your Research Data
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Securely store, organize, and manage your research data files.
                  </p>
                </div>
                <Button disabled>
                  <IconPlus className="h-4 w-4 mr-2" />
                  Upload Data
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Data Storage</CardTitle>
                    <CardDescription>
                      Upload and organize your research data files in one secure location.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <IconUpload className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium">Upload your data files</h3>
                          <p className="text-sm text-muted-foreground">
                            Drag and drop files here or click to browse
                          </p>
                        </div>
                        <Button variant="outline" disabled>
                          Select Files
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Storage Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used</span>
                        <span className="font-medium">0 MB</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div className="h-full bg-primary rounded-full" style={{ width: "0%" }}></div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-medium">10 GB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Collections */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold tracking-tight">Data Collections</h2>
                  <Button variant="outline" size="sm" disabled>
                    <IconPlus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <IconFolder className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <CardTitle className="text-base">No collections yet</CardTitle>
                      <CardDescription className="text-sm">
                        Create a collection to organize your data files.
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

