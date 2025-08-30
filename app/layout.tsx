import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppHeader } from "@/components/app-header"
import { AppFooter } from "@/components/app-footer"
import { Toaster } from "@/components/ui/toaster"
import SupabaseRealtimeListener from "@/components/supabase-realtime-listener"
import { MainSidebar } from "@/components/main-sidebar"
import { MobileMenuProvider } from "@/components/mobile-menu-provider"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema POKER 360",
  description: "Aplicativo para gerenciamento de faltas de militares do Esquadrão Poker.",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <MobileMenuProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900">
              <AppHeader />
              <div className="flex flex-1 relative">
                <MainSidebar />
                <main className="flex-1 flex flex-col p-4 lg:p-6 transition-all duration-300" id="main-content">
                  <div className="max-w-7xl mx-auto w-full">
                    {children}
                  </div>
                </main>
              </div>
              <AppFooter />
            </div>
          </MobileMenuProvider>
          <Toaster />
          <SupabaseRealtimeListener />
        </ThemeProvider>
      </body>
    </html>
  )
}
