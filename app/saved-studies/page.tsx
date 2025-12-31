"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  IconFileText,
  IconTrash,
  IconEye,
  IconCalendar,
  IconDatabase,
  IconSearch,
  IconFilter,
  IconChartLine,
  IconTableExport,
  IconX,
  IconFolder,
  IconFolderPlus,
  IconCheck,
} from "@tabler/icons-react"
import { createSupabaseClient } from "@/lib/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface SavedStudy {
  id: string
  file_name: string
  file_size: number | null
  analysis_result: string
  study_type: 'analysis' | 'extraction'
  group_name: string | null
  created_at: string
  updated_at: string
}

export default function SavedStudiesPage() {
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([])
  const [filteredStudies, setFilteredStudies] = useState<SavedStudy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "analysis" | "extraction">("all")
  const [groupFilter, setGroupFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"recent" | "alphabetical">("recent")
  const [selectedStudies, setSelectedStudies] = useState<Set<string>>(new Set())
  const [showGroupDialog, setShowGroupDialog] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [groupFilterOpen, setGroupFilterOpen] = useState(false)
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const fetchSavedStudies = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        router.push('/onboarding')
        return
      }

      // Fetch saved studies
      const { data, error: fetchError } = await supabase
        .from('saved_studies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setSavedStudies(data || [])
      setFilteredStudies(data || [])
    } catch (err) {
      console.error("Error fetching saved studies:", err)
      setError(err instanceof Error ? err.message : "Failed to load saved studies.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedStudies()
    }
  }, [isAuthenticated])

  // Filter and sort studies based on search, type, and sort order
  useEffect(() => {
    let filtered = [...savedStudies]

    // Filter by search query (file name)
    if (searchQuery.trim()) {
      filtered = filtered.filter(study =>
        study.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(study => study.study_type === typeFilter)
    }

    // Filter by group
    if (groupFilter !== "all") {
      if (groupFilter === "ungrouped") {
        filtered = filtered.filter(study => !study.group_name)
      } else {
        filtered = filtered.filter(study => study.group_name === groupFilter)
      }
    }

    // Sort studies
    filtered.sort((a, b) => {
      if (sortOrder === "alphabetical") {
        return a.file_name.localeCompare(b.file_name)
      } else {
        // Sort by recency (most recent first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    setFilteredStudies(filtered)
  }, [savedStudies, searchQuery, typeFilter, groupFilter, sortOrder])

  // Show loading spinner while checking authentication
  if (isAuthLoading) {
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

  const handleDeleteStudy = async (studyId: string) => {
    if (!confirm("Are you sure you want to delete this saved study?")) {
      return
    }

    try {
      const supabase = createSupabaseClient()
      
      const { error: deleteError } = await supabase
        .from('saved_studies')
        .delete()
        .eq('id', studyId)

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      const updated = savedStudies.filter(study => study.id !== studyId)
      setSavedStudies(updated)
      // Remove from selection if selected
      setSelectedStudies(prev => {
        const next = new Set(prev)
        next.delete(studyId)
        return next
      })
    } catch (err) {
      console.error("Error deleting study:", err)
      setError(err instanceof Error ? err.message : "Failed to delete study.")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedStudies.size === 0) return
    
    const count = selectedStudies.size
    if (!confirm(`Are you sure you want to delete ${count} ${count === 1 ? 'study' : 'studies'}?`)) {
      return
    }

    try {
      const supabase = createSupabaseClient()
      
      const { error: deleteError } = await supabase
        .from('saved_studies')
        .delete()
        .in('id', Array.from(selectedStudies))

      if (deleteError) {
        throw deleteError
      }

      // Remove from local state
      const updated = savedStudies.filter(study => !selectedStudies.has(study.id))
      setSavedStudies(updated)
      setSelectedStudies(new Set())
      setIsSelectMode(false)
    } catch (err) {
      console.error("Error deleting studies:", err)
      setError(err instanceof Error ? err.message : "Failed to delete studies.")
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedStudies.size === 0) return

    try {
      const supabase = createSupabaseClient()
      
      const { error: updateError } = await supabase
        .from('saved_studies')
        .update({ group_name: newGroupName.trim() })
        .in('id', Array.from(selectedStudies))

      if (updateError) {
        throw updateError
      }

      // Update local state
      const updated = savedStudies.map(study => 
        selectedStudies.has(study.id) 
          ? { ...study, group_name: newGroupName.trim() }
          : study
      )
      setSavedStudies(updated)
      setSelectedStudies(new Set())
      setIsSelectMode(false)
      setShowGroupDialog(false)
      setNewGroupName("")
    } catch (err) {
      console.error("Error creating group:", err)
      setError(err instanceof Error ? err.message : "Failed to create group.")
    }
  }

  const handleRemoveFromGroup = async (studyId: string) => {
    try {
      const supabase = createSupabaseClient()
      
      const { error: updateError } = await supabase
        .from('saved_studies')
        .update({ group_name: null })
        .eq('id', studyId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      const updated = savedStudies.map(study => 
        study.id === studyId 
          ? { ...study, group_name: null }
          : study
      )
      setSavedStudies(updated)
    } catch (err) {
      console.error("Error removing from group:", err)
      setError(err instanceof Error ? err.message : "Failed to remove from group.")
    }
  }

  const handleBulkRemoveFromGroup = async () => {
    if (selectedStudies.size === 0) return

    try {
      const supabase = createSupabaseClient()
      
      const { error: updateError } = await supabase
        .from('saved_studies')
        .update({ group_name: null })
        .in('id', Array.from(selectedStudies))

      if (updateError) {
        throw updateError
      }

      // Update local state
      const updated = savedStudies.map(study => 
        selectedStudies.has(study.id) 
          ? { ...study, group_name: null }
          : study
      )
      setSavedStudies(updated)
      setSelectedStudies(new Set())
      setIsSelectMode(false)
    } catch (err) {
      console.error("Error removing from group:", err)
      setError(err instanceof Error ? err.message : "Failed to remove from group.")
    }
  }

  // Get unique group names for filter
  const getGroupNames = () => {
    const groups = new Set<string>()
    savedStudies.forEach(study => {
      if (study.group_name) {
        groups.add(study.group_name)
      }
    })
    return Array.from(groups).sort()
  }

  const handleToggleSelect = (studyId: string) => {
    setSelectedStudies(prev => {
      const next = new Set(prev)
      if (next.has(studyId)) {
        next.delete(studyId)
      } else {
        next.add(studyId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedStudies.size === filteredStudies.length) {
      setSelectedStudies(new Set())
    } else {
      setSelectedStudies(new Set(filteredStudies.map(s => s.id)))
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size"
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateAnalysis = (analysis: string, maxLength: number = 200) => {
    if (analysis.length <= maxLength) return analysis
    return analysis.substring(0, maxLength) + "..."
  }

  const getStudyPreview = (study: SavedStudy) => {
    if (study.study_type === 'extraction') {
      try {
        const data = JSON.parse(study.analysis_result)
        const title = data.studyIdentification?.title || "Extracted Study Data"
        return `Extracted data: ${title}`
      } catch {
        return "Extracted study data"
      }
    }
    
    // Clean markdown formatting from analysis preview
    let preview = study.analysis_result
    
    // Remove markdown headers (##, ###)
    preview = preview.replace(/^#{1,6}\s+/gm, '')
    
    // Remove markdown bold (**text**)
    preview = preview.replace(/\*\*([^*]+)\*\*/g, '$1')
    
    // Remove markdown lists (-, *)
    preview = preview.replace(/^[-*]\s+/gm, '')
    
    // Remove numbered lists
    preview = preview.replace(/^\d+\.\s+/gm, '')
    
    // Remove extra whitespace and newlines
    preview = preview.replace(/\n{3,}/g, '\n\n')
    preview = preview.trim()
    
    // Find first meaningful sentence (skip intro text)
    const sentences = preview.split(/[.!?]\s+/)
    const firstMeaningful = sentences.find(s => 
      s.length > 20 && 
      !s.toLowerCase().includes('analysis of the study') &&
      !s.toLowerCase().includes('structured summary')
    ) || sentences[0] || preview
    
    // Clean up the preview
    let cleaned = firstMeaningful.trim()
    
    // Remove any remaining markdown artifacts
    cleaned = cleaned.replace(/^##?\s*/, '')
    cleaned = cleaned.replace(/\*\*/g, '')
    cleaned = cleaned.replace(/^[-*•]\s*/, '')
    
    // Get first 150 characters of clean text
    if (cleaned.length > 150) {
      cleaned = cleaned.substring(0, 150).trim() + '...'
    }
    
    return cleaned || "Study analysis available"
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
            {/* Header Section */}
            <div className="px-4 pt-6 pb-4 md:px-6 lg:pt-8 lg:pb-6">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Saved Studies
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                    Your Saved Studies
                  </h1>
                  <p className="text-muted-foreground max-w-2xl">
                    Access and manage your previously analyzed studies.
                  </p>
                </div>
              </div>
            </div>

            {/* Selection Toolbar */}
            {isSelectMode && (
              <div className="px-4 md:px-6 pb-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium">
                        {selectedStudies.size} {selectedStudies.size === 1 ? 'study' : 'studies'} selected
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSelectAll}
                        className="h-8"
                      >
                        {selectedStudies.size === filteredStudies.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStudies(new Set())
                          setIsSelectMode(false)
                        }}
                        className="gap-2"
                      >
                        <IconX className="h-4 w-4" />
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowGroupDialog(true)}
                        disabled={selectedStudies.size === 0}
                        className="gap-2"
                      >
                        <IconFolderPlus className="h-4 w-4" />
                        Create Group
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkRemoveFromGroup}
                        disabled={selectedStudies.size === 0}
                        className="gap-2"
                      >
                        <IconFolder className="h-4 w-4" />
                        Remove from Group
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={selectedStudies.size === 0}
                        className="gap-2"
                      >
                        <IconTrash className="h-4 w-4" />
                        Delete ({selectedStudies.size})
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <div className="px-4 pb-8 md:px-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Filters and Select Mode */}
              {!isLoading && savedStudies.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <IconFilter className="h-5 w-5" />
                        Filters
                      </CardTitle>
                      {!isSelectMode && (
                        <Button
                          variant="default"
                          onClick={() => setIsSelectMode(true)}
                          className="gap-2"
                        >
                          <IconCheck className="h-4 w-4" />
                          Select Studies
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search */}
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <IconX className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Type Filter */}
                      <Select value={typeFilter} onValueChange={(value: "all" | "analysis" | "extraction") => setTypeFilter(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="analysis">Analysis</SelectItem>
                          <SelectItem value="extraction">Data Extraction</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Group Filter - Searchable */}
                      <Popover open={groupFilterOpen} onOpenChange={setGroupFilterOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={groupFilterOpen}
                            className="w-full justify-between"
                          >
                            {groupFilter === "all" 
                              ? "All Groups" 
                              : groupFilter === "ungrouped"
                              ? "Ungrouped"
                              : groupFilter}
                            <IconSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search groups..." />
                            <CommandList>
                              <CommandEmpty>No groups found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="all"
                                  onSelect={() => {
                                    setGroupFilter("all")
                                    setGroupFilterOpen(false)
                                  }}
                                >
                                  <IconCheck
                                    className={`mr-2 h-4 w-4 ${
                                      groupFilter === "all" ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  All Groups
                                </CommandItem>
                                <CommandItem
                                  value="ungrouped"
                                  onSelect={() => {
                                    setGroupFilter("ungrouped")
                                    setGroupFilterOpen(false)
                                  }}
                                >
                                  <IconCheck
                                    className={`mr-2 h-4 w-4 ${
                                      groupFilter === "ungrouped" ? "opacity-100" : "opacity-0"
                                    }`}
                                  />
                                  Ungrouped
                                </CommandItem>
                                {getGroupNames().map((groupName) => (
                                  <CommandItem
                                    key={groupName}
                                    value={groupName}
                                    onSelect={() => {
                                      setGroupFilter(groupName)
                                      setGroupFilterOpen(false)
                                    }}
                                  >
                                    <IconCheck
                                      className={`mr-2 h-4 w-4 ${
                                        groupFilter === groupName ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {groupName}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Sort Order */}
                      <Select value={sortOrder} onValueChange={(value: "recent" | "alphabetical") => setSortOrder(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Most Recent</SelectItem>
                          <SelectItem value="alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Spinner className="h-8 w-8" />
                </div>
              ) : filteredStudies.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <IconDatabase className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {savedStudies.length === 0 
                        ? "No saved studies yet" 
                        : "No studies match your filters"}
                    </h3>
                    <p className="text-muted-foreground text-center mb-6 max-w-md">
                      {savedStudies.length === 0
                        ? "Start analyzing or extracting studies to save them here for quick access later."
                        : "Try adjusting your filters to see more results."}
                    </p>
                    {savedStudies.length === 0 && (
                      <div className="flex gap-2">
                        <Button asChild>
                          <Link href="/study-analysis">
                            Analyze a Study
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/data-extraction">
                            Extract Data
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {(() => {
                    // Group studies by group_name
                    const grouped = filteredStudies.reduce((acc, study) => {
                      const groupKey = study.group_name || 'Ungrouped'
                      if (!acc[groupKey]) {
                        acc[groupKey] = []
                      }
                      acc[groupKey].push(study)
                      return acc
                    }, {} as Record<string, SavedStudy[]>)

                    const groupKeys = Object.keys(grouped).sort((a, b) => {
                      if (a === 'Ungrouped') return 1
                      if (b === 'Ungrouped') return -1
                      return a.localeCompare(b)
                    })

                    return groupKeys.map((groupName) => (
                      <div key={groupName} className="space-y-3">
                        {groupName !== 'Ungrouped' && (
                          <div className="flex items-center gap-2 px-2">
                            <IconFolder className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">{groupName}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {grouped[groupName].length}
                            </Badge>
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {grouped[groupName].map((study) => (
                            <Card 
                              key={study.id} 
                              className={`flex flex-col transition-all ${
                                isSelectMode && selectedStudies.has(study.id) 
                                  ? 'ring-2 ring-primary border-primary' 
                                  : ''
                              }`}
                            >
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {isSelectMode && (
                                      <Checkbox
                                        checked={selectedStudies.has(study.id)}
                                        onCheckedChange={() => handleToggleSelect(study.id)}
                                        className="shrink-0"
                                      />
                                    )}
                                    {study.study_type === 'analysis' ? (
                                      <IconChartLine className="h-5 w-5 text-primary shrink-0" />
                                    ) : (
                                      <IconTableExport className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                    <CardTitle className="text-base truncate">{study.file_name}</CardTitle>
                                  </div>
                                </div>
                        <div className="flex items-center justify-between mt-2">
                          <CardDescription className="flex items-center gap-2">
                            <IconCalendar className="h-3 w-3" />
                            <span className="text-xs">{formatDate(study.created_at)}</span>
                          </CardDescription>
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            {study.group_name && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <IconFolder className="h-3 w-3" />
                                {study.group_name}
                              </Badge>
                            )}
                            <Badge variant={study.study_type === 'analysis' ? 'default' : 'secondary'} className="text-xs">
                              {study.study_type === 'analysis' ? 'Analysis' : 'Extraction'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {formatFileSize(study.file_size)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {getStudyPreview(study)}
                        </p>
                        <Separator />
                        {!isSelectMode && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                // Store study in sessionStorage to view it
                                sessionStorage.setItem('viewingStudy', JSON.stringify({
                                  fileName: study.file_name,
                                  content: study.analysis_result,
                                  studyType: study.study_type,
                                }))
                                router.push('/saved-studies/view')
                              }}
                            >
                              <IconEye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            {study.group_name && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveFromGroup(study.id)}
                                className="gap-1"
                                title="Remove from group"
                              >
                                <IconFolder className="h-4 w-4" />
                                <IconX className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteStudy(study.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                        </div>
                      </div>
                    ))
                  })()}
                </div>
              )}

              {/* Group Creation Dialog */}
              <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group</DialogTitle>
                    <DialogDescription>
                      Name the group for {selectedStudies.size} {selectedStudies.size === 1 ? 'study' : 'studies'}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        placeholder="e.g., Literature Review 2024"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newGroupName.trim()) {
                            handleCreateGroup()
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowGroupDialog(false)
                        setNewGroupName("")
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateGroup}
                      disabled={!newGroupName.trim()}
                    >
                      Create Group
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

