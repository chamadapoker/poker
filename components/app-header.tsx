"use client"
import Image from "next/image"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger variant="ghost" size="icon" className="md:hidden" />
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Image
            src="/placeholder-logo.png"
            alt="Sistema POKER 360 Logo"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span>POKER 360</span>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </header>
  )
}
