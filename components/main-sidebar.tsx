"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  FileText, 
  Key, 
  ClipboardList, 
  Calendar, 
  Plane, 
  StickyNote, 
  History, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  LogOut
} from "lucide-react"
import { useMobileMenu } from "./mobile-menu-provider"

export function MainSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isMobileOpen, toggleMobile } = useMobileMenu()
  const pathname = usePathname()

  // Auto-colapsar no desktop após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Fechar menu mobile ao mudar de rota
  useEffect(() => {
    if (isMobileOpen) {
      toggleMobile()
    }
  }, [pathname, isMobileOpen, toggleMobile])

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

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64 lg:w-auto
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
        shadow-lg lg:shadow-none
      `}>
        
        {/* Conteúdo da navegação */}
        <div className="flex flex-col h-full">
          {/* Navegação principal */}
          <div className="flex-1 p-3 pt-6">
            {/* Label da navegação */}
            <div className={`mb-3 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:h-0 lg:overflow-hidden' : 'lg:opacity-100 lg:h-auto'}`}>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Navegação
              </h3>
            </div>

            {/* Itens de navegação */}
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group relative
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-md' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                      }
                    `}
                  >
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                    
                    <span className={`transition-all duration-300 font-medium ${
                      isCollapsed 
                        ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'
                    }`}>
                      {item.title}
                    </span>

                    {/* Indicador de página ativa */}
                    {isActive && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer com usuário e controles */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3">
            {/* Área do usuário logado */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className={`transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'}`}>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Usuário Logado</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">admin@poker360.com</p>
              </div>
            </div>

            {/* Botão de expandir/recolher */}
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
              onClick={toggleCollapse}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              ) : (
                <ChevronLeft className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              )}
              <span className={`transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'}`}>
                {isCollapsed ? 'Expandir' : 'Recolher'}
              </span>
            </Button>

            {/* Botão de logout */}
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:w-0 lg:overflow-hidden' : 'lg:opacity-100 lg:w-auto'}`}>
                Sair
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default MainSidebar
