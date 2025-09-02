"use client"

import { useRequireAuth } from "@/context/auth-context"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { MainSidebar } from "@/components/main-sidebar"
import { MobileMenuProvider } from "@/components/mobile-menu-provider"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <MobileMenuProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
        <AppHeader />
        <div className="flex flex-1 relative">
          <MainSidebar />
          <main className="flex-1 flex flex-col p-2 sm:p-4 lg:p-6 transition-all duration-300" id="main-content">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
        <AppFooter />
      </div>
      <SupabaseRealtimeListener />
    </MobileMenuProvider>
  )
}
