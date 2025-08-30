import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Users, FileText, Key, ClipboardList, Calendar, Plane, StickyNote, History } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const sections = [
    {
      title: "Dashboard",
      description: "Visão geral do sistema e estatísticas",
      href: "/dashboard",
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Presença",
      description: "Controle de presença dos militares",
      href: "/attendance",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20"
    },
    {
      title: "Justificativas",
      description: "Gestão de justificativas de ausência",
      href: "/justifications",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20"
    },
    {
      title: "Chaves",
      description: "Sistema de gestão de chaves",
      href: "/key-management",
      icon: Key,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Checklist",
      description: "Listas de verificação de permanência",
      href: "/permanence-checklist",
      icon: ClipboardList,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20"
    },
    {
      title: "Eventos",
      description: "Calendário de eventos do Esquadrão",
      href: "/event-calendar",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Voos",
      description: "Agendamento de voos",
      href: "/flight-scheduler",
      icon: Plane,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950/20"
    },
    {
      title: "Notas",
      description: "Notas e anotações pessoais",
      href: "/personal-notes",
      icon: StickyNote,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/20"
    },
    {
      title: "Histórico",
      description: "Histórico de atividades",
      href: "/history",
      icon: History,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950/20"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sistema POKER 360
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Bem-vindo ao sistema de gerenciamento do Esquadrão Poker
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sections.map((section) => {
            const IconComponent = section.icon
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className={`hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-gray-300 dark:hover:border-gray-600 ${section.bgColor}`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </CardTitle>
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-6 w-6 ${section.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
