"use client"

import { useState, useEffect } from "react"

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      setSidebarCollapsed(event.detail.isCollapsed)
    }

    window.addEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
    
    return () => {
      window.removeEventListener('sidebarStateChange', handleSidebarStateChange as EventListener)
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
      {children}
    </div>
  )
}
