"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Menu, BarChart3, Users, FileText, Key, ClipboardList, Calendar, Plane, StickyNote, History } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"

export function MainSidebar() {
  const { toggleSidebar } = useSidebar()

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { title: "Presença", href: "/attendance", icon: Users },
    { title: "Justificativas", href: "/justifications", icon: FileText },
    { title: "Chaves", href: "/key-management", icon: Key },
    { title: "Checklist", href: "/permanence-checklist", icon: ClipboardList },
    { title: "Eventos", href: "/event-calendar", icon: Calendar },
    { title: "Voos", href: "/flight-scheduler", icon: Plane },
    { title: "Notas", href: "/personal-notes", icon: StickyNote },
    { title: "Histórico", href: "/history", icon: History },
  ]

  return (
    <Sidebar>
      {/* Top area with logo + collapse btn */}
      <SidebarHeader className="flex h-14 items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <Image src="/placeholder-logo.png" alt="POKER 360" width={28} height={28} className="rounded-full" />
          <span className="sr-only md:not-sr-only">POKER 360</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Main navigation group */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}

// 👇 add this at the very end of the file
export default MainSidebar
