"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  IconChartBar,
  IconDatabase,
  IconFileText,
  IconFileWord,
  IconChartLine,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
  IconSparkles,
  IconBook,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const defaultData = {
  navMain: [
    {
      title: "Study Analysis",
      url: "/study-analysis",
      icon: IconChartLine,
    },
    {
      title: "Visualization",
      url: "/visualization",
      icon: IconChartBar,
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: IconFileText,
    },
    {
      title: "Literature Search",
      url: "/literature-search",
      icon: IconBook,
    },
    {
      title: "AI Insights",
      url: "/ai-insights",
      icon: IconSparkles,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Saved Studies",
      url: "/saved-studies",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<{
    name: string
    email: string
    avatar?: string
  } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createSupabaseClient()
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const fullName = (authUser.user_metadata?.full_name as string) || authUser.email || "User"
          setUser({
            name: fullName,
            email: authUser.email || "",
          })
        }
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }

    fetchUser()
  }, [])

  const data = {
    ...defaultData,
    user: user || {
      name: "User",
      email: "",
    },
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Image
                  src="/logoanaly.png"
                  alt="AnalytIQ Logo"
                  width={48}
                  height={48}
                  className="!size-12"
                />
                <span className="text-base font-semibold">AnalytIQ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
    </Sidebar>
  )
}
