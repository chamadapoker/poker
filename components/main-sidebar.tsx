"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useMobileMenu } from "./mobile-menu-provider"
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
  Monitor,
  Sparkles,
  LogOut,
  User,
  Crown,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function MainSidebar() {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { isMobileOpen, toggleMobile } = useMobileMenu()

  const navigationItems = [
    { title: "Dashboard", href: "/dashboard", icon: BarChart3, access: "all" },
    { title: "Presença", href: "/attendance", icon: Users, access: "all" },
    { title: "Justificativas", href: "/justifications", icon: FileText, access: "all" },
    { title: "Chaves", href: "/key-management", icon: Key, access: "all" },
    { title: "Checklist", href: "/permanence-checklist", icon: ClipboardList, access: "all" },
    { title: "Eventos", href: "/event-calendar", icon: Calendar, access: "all" },
    { title: "Voos", href: "/flight-scheduler", icon: Plane, access: "all" },
    { title: "Faxina", href: "/faxina", icon: Sparkles, access: "all" },
    { title: "TI", href: "/ti", icon: Monitor, access: "admin" },
    { title: "Histórico", href: "/history", icon: History, access: "admin" },
  ]

  // Filtrar itens baseado no role do usuário
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.access === "all") return true
    if (item.access === "admin" && profile?.role === "admin") return true
    return false
  })

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado do sistema com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro ao tentar sair do sistema.",
        variant: "destructive",
      })
    }
  }

  const handleNavigationClick = () => {
    // Fecha o menu mobile quando um item é clicado
    if (isMobileOpen) {
      toggleMobile()
    }
  }

  const getUserInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    }
    if (user?.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = () => {
    if (profile?.display_name) {
      return profile.display_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'Usuário'
  }

  // Conteúdo do sidebar
  const sidebarContent = (
    <div className="h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-lg flex flex-col">
      {/* Header do mobile com botão de fechar */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Menu</h2>
        <Button variant="ghost" size="icon" onClick={toggleMobile}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navegação */}
      <div className="flex-1 p-4 pt-6">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Navegação
        </h3>
        
        <nav className="space-y-2">
          {filteredNavigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  console.log('🔗 Link clicado:', item.href)
                  handleNavigationClick()
                }}
                className={`
                  flex items-center gap-3 p-3 rounded-md transition-all duration-200 group relative cursor-pointer
                  ${isActive 
                    ? 'bg-red-600 text-white shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                  }
                `}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'}`} />
                <span className="font-medium">{item.title}</span>
                {item.access === "admin" && (
                  <span className="ml-auto text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full font-medium">
                    ADMIN
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer com Informações de Autenticação */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
        {user && profile ? (
          <div className="space-y-3">
            {/* Informações do Usuário */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-700 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    profile.role === 'admin' 
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                  }`}>
                    {profile.role === 'admin' ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Usuário
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Logout */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair do Sistema
            </Button>

            {/* Sistema POKER 360 */}
            <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-600">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                POKER 360
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                1º/10º GAV
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center p-3">
            <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 mx-auto mb-2 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Carregando...</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Sidebar desktop - sempre visível */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar mobile - slide in/out */}
      <div className={`
        fixed top-0 left-0 h-full w-64 z-[9999] lg:hidden transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {sidebarContent}
      </div>
    </>
  )
}

export default MainSidebar
