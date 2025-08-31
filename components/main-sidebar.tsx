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

  // Emitir estado de colapso para o layout principal
  useEffect(() => {
    const event = new CustomEvent('sidebarStateChange', { 
      detail: { isCollapsed } 
    })
    window.dispatchEvent(event)
  }, [isCollapsed])

  // Auto-colapsar no desktop após um tempo
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(true)
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Persistir estado do menu no localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed')
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState))
    }
  }, [])

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
  }, [isCollapsed])

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

    { title: "Histórico", href: "/history", icon: History },
  ]

  const toggleCollapse = () => {
    console.log('Toggle collapse clicked, current state:', isCollapsed)
    setIsCollapsed(prev => {
      const newState = !prev
      console.log('New state:', newState)
      return newState
    })
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static left-0 z-30
        transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64 lg:w-auto
        bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700
        shadow-lg lg:shadow-none
        top-8 lg:top-0
        bottom-0 lg:bottom-0
        h-screen lg:h-auto
        flex-shrink-0
      `}>
        
        {/* Conteúdo da navegação */}
        <div className="flex flex-col h-full">
          {/* Navegação principal */}
          <div className="flex-1 p-1.5 pt-2">
            {/* Botão de expandir/recolher - NO TOPO */}
            <div className="mb-3 flex justify-center lg:justify-start">
              <Button 
                variant="ghost" 
                size="sm"
                className={`${isCollapsed ? 'w-10 lg:w-full' : 'w-full'} justify-center lg:justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group h-8`}
                onClick={toggleCollapse}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                ) : (
                  <ChevronLeft className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                )}
                <span className={`transition-all duration-300 overflow-hidden text-center lg:text-left ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'lg:opacity-100 lg:max-w-full'}`}>
                  {isCollapsed ? 'Expandir' : 'Recolher'}
                </span>
              </Button>
            </div>

            {/* Label da navegação */}
            <div className={`mb-2 transition-all duration-300 ${isCollapsed ? 'lg:opacity-0 lg:max-h-0 lg:overflow-hidden' : 'lg:opacity-100 lg:max-h-10'}`}>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Navegação
              </h3>
            </div>

            {/* Itens de navegação */}
            <nav className="space-y-0.5 flex flex-col items-center lg:items-stretch">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center justify-center lg:justify-start gap-1.5 p-1 rounded-md transition-all duration-200 group relative
                      ${isCollapsed ? 'w-10 lg:w-full' : 'w-full'}
                      ${isActive 
                        ? 'bg-red-600 text-white shadow-sm' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                      }
                    `}
                  >
                    <IconComponent className={`h-6 w-6 flex-shrink-0 mx-auto lg:mx-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                    
                    <span className={`transition-all duration-300 font-medium overflow-hidden text-center lg:text-left ${
                      isCollapsed 
                        ? 'lg:opacity-0 lg:max-w-0' : 'lg:opacity-100 lg:max-w-full'
                    }`}>
                      {item.title}
                    </span>


                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Footer com usuário e controles */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-1 space-y-1 flex flex-col items-center lg:items-stretch">
            {/* Área do usuário logado */}
            <div className={`flex items-center justify-center lg:justify-start gap-2 p-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors duration-200 ${isCollapsed ? 'w-10 lg:w-full' : 'w-full'}`}>
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className={`transition-all duration-300 overflow-hidden text-center lg:text-left ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'lg:opacity-100 lg:max-w-full'}`}>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Usuário Logado</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">admin@poker360.com</p>
              </div>
            </div>



            {/* Botão de logout */}
            <Button 
              variant="ghost" 
              size="sm"
              className={`${isCollapsed ? 'w-10 lg:w-full' : 'w-full'} justify-center lg:justify-start hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group h-7`}
            >
              <LogOut className="h-4 w-4 lg:mr-2 group-hover:scale-110 transition-transform duration-200" />
              <span className={`transition-all duration-300 overflow-hidden text-center lg:text-left ${isCollapsed ? 'lg:opacity-0 lg:max-w-0' : 'lg:opacity-100 lg:max-w-full'}`}>
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
