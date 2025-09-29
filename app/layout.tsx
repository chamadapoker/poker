import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/context/auth-context"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema POKER 360",
  description: "Aplicativo para gerenciamento de faltas de militares do Esquadrão Poker.",
  generator: 'v0.dev',
  manifest: '/manifest.json',
  themeColor: '#1e40af',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POKER 360'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'Sistema POKER 360',
    title: 'Sistema POKER 360 - 1º/10º GAV',
    description: 'Aplicativo para gerenciamento de presença e justificativas do Esquadrão Poker'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            <PWAInstallPrompt />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
