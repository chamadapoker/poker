"use client"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobileMenu } from "./mobile-menu-provider"

export function AppHeader() {
  const { toggleMobile } = useMobileMenu()

  const handleMenuClick = () => {
    toggleMobile()
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b bg-background px-4 md:px-6 w-full">
      {/* POKER no desktop, menu sanduíche no mobile */}
      <div className="flex-shrink-0">
        {/* Menu sanduíche no mobile */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={handleMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* POKER no desktop */}
        <Link href="/" className="hidden lg:block text-xl font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors">
          POKER
        </Link>
      </div>

      {/* Frases centralizadas com fontes maiores no desktop */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="text-sm md:text-base lg:text-lg font-semibold leading-tight animate-pulse">
          <span className="bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
            1º ESQUADRÃO DO 10º GRUPO DE AVIAÇÃO
          </span>
        </div>
        <div className="text-xs md:text-sm lg:text-base leading-tight italic mt-1">
          <span className="bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x-reverse">
            "DA PÁTRIA OS OLHOS ... NA GUERRA E NA PAZ..."
          </span>
        </div>
      </div>

      {/* Toggle de tema no canto direito */}
      <div className="flex-shrink-0">
        <ModeToggle />
      </div>
    </header>
  )
}
