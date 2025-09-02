"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Monitor
} from "lucide-react"

export function MainSidebar() {
  const pathname = usePathname()

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { title: "Presença", href: "/attendance", icon: Users },
    { title: "Justificativas", href: "/justifications", icon: FileText },
    { title: "Chaves", href: "/key-management", icon: Key },
    { title: "Checklist", href: "/permanence-checklist", icon: ClipboardList },
    { title: "Eventos", href: "/event-calendar", icon: Calendar },
    { title: "Voos", href: "/flight-scheduler", icon: Plane },
    { title: "TI", href: "/ti", icon: Monitor },
    { title: "Histórico", href: "/history", icon: History },
  ]

  return (
    <div className="h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg">
      {/* Navegação */}
      <div className="flex-1 p-4 pt-6">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Navegação
        </h3>
        
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 p-3 rounded-md transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                  }
                `}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Sistema Ativo</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Versão 2.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MainSidebar
