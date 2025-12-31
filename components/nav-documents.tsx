"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  type Icon,
} from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavDocuments({
  items,
}: {
  items: {
    name: string
    url: string
    icon: Icon
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          // Check if current pathname matches the item URL
          // Handle both exact matches and sub-paths (e.g., /saved-studies/view matches /saved-studies)
          const isActive = pathname === item.url || (item.url !== "#" && pathname.startsWith(item.url + "/"))
          
          return (
          <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                <item.icon />
                <span>{item.name}</span>
                </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
