"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { 
  Users, 
  Calendar, 
  FileText, 
  Plane, 
  Clock, 
  Key, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Clock3,
  Building2,
  ClipboardList
} from "lucide-react"

interface DashboardData {
  // Presença
  attendance: {
    total: number
    present: number
    absent: number
    justified: number
    percentage: number
  }
  // Justificativas
  justifications: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  // Eventos
  events: {
    total: number
    today: number
    upcoming: number
  }
  // Voos
  flights: {
    total: number
    today: number
    scheduled: number
  }
  // Permanência
  permanence: {
    total: number
    active: number
    completed: number
  }
  // Notas
  notes: {
    total: number
    recent: number
  }
  // Chaves
  keys: {
    total: number
    available: number
    borrowed: number
  }
  // TI
  ti: {
    total: number
    open: number
    inProgress: number
    resolved: number
  }
  // Faxina
  cleaning: {
    total: number
    pending: number
    completed: number
    overdue: number
  }
}

export default function ComprehensiveDashboard() {
  const [data, setData] = useState<DashboardData>({
    attendance: { total: 25, present: 22, absent: 2, justified: 1, percentage: 88 },
    justifications: { total: 15, pending: 3, approved: 10, rejected: 2 },
    events: { total: 8, today: 2, upcoming: 3 },
    flights: { total: 12, today: 1, scheduled: 4 },
    permanence: { total: 20, active: 5, completed: 15 },
    notes: { total: 45, recent: 8 },
    keys: { total: 30, available: 25, borrowed: 5 },
    ti: { total: 18, open: 5, inProgress: 8, resolved: 5 },
    cleaning: { total: 50, pending: 10, completed: 35, overdue: 5 }
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log("🔄 Carregando dados reais do dashboard...")
        
        // 1. Dados de Presença
        const attendanceResponse = await fetch('/api/dashboard/attendance')
        const attendanceData = await attendanceResponse.json()
        
        // 2. Dados de Justificativas
        const justificationsResponse = await fetch('/api/dashboard/justifications')
        const justificationsData = await justificationsResponse.json()
        
        // 3. Dados de Eventos
        const eventsResponse = await fetch('/api/dashboard/events')
        const eventsData = await eventsResponse.json()
        
        // 4. Dados de Voos
        const flightsResponse = await fetch('/api/dashboard/flights')
        const flightsData = await flightsResponse.json()
        
        // 5. Dados de Permanência
        const permanenceResponse = await fetch('/api/dashboard/permanence')
        const permanenceData = await permanenceResponse.json()
        
        // 6. Dados de Notas
        const notesResponse = await fetch('/api/dashboard/notes')
        const notesData = await notesResponse.json()
        
        // 7. Dados de Chaves
        const keysResponse = await fetch('/api/dashboard/keys')
        const keysData = await keysResponse.json()
        
        // 8. Dados de TI
        const tiResponse = await fetch('/api/dashboard/ti')
        const tiData = await tiResponse.json()
        
        // 9. Dados de Faxina
        const cleaningResponse = await fetch('/api/dashboard/cleaning')
        const cleaningData = await cleaningResponse.json()
        
        // Atualizar estado com dados reais
        setData({
          attendance: attendanceData,
          justifications: justificationsData,
          events: eventsData,
          flights: flightsData,
          permanence: permanenceData,
          notes: notesData,
          keys: keysData,
          ti: tiData,
          cleaning: cleaningData
        })
        
        console.log("✅ Dados reais carregados com sucesso!")
        
      } catch (error) {
        console.error("❌ Erro ao carregar dados reais:", error)
        console.log("⚠️ Mantendo dados mockados como fallback")
      }
    }
    
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-12">
      {/* Seção de Presença */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Presença e Controle
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Monitoramento em tempo real da equipe
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Total de Militares
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.attendance.total}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Equipe completa
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Presentes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.attendance.present}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                {data.attendance.percentage}% de presença
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Ausentes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.attendance.absent}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Requer atenção
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Justificados
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.attendance.justified}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Documentados
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Justificativas */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Justificativas
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Gestão de ausências e documentação
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {data.justifications.total}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Todas as solicitações
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {data.justifications.pending}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Aguardando análise
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                Aprovadas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {data.justifications.approved}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Validadas
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Eventos */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              Eventos e Atividades
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Programação e calendário da unidade
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                Total de Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {data.events.total}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                Agenda completa
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                Eventos de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {data.events.today}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                Atividades do dia
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
                {data.events.upcoming}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                Próximos 7 dias
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Voos */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg">
            <Plane className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-sky-800 bg-clip-text text-transparent">
              Programação de Voos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Controle operacional da esquadrilha
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-sky-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                Total de Voos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-300">
                {data.flights.total}
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                Programação total
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-sky-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                Voos de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-300">
                {data.flights.today}
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                Operações do dia
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-900/20 dark:to-sky-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-sky-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-sky-800 dark:text-sky-200">
                Agendados
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-sky-700 dark:text-sky-300">
                {data.flights.scheduled}
              </div>
              <div className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                Futuras missões
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Permanência */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
              Controle de Permanência
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Gestão de turnos e escalas
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Total de Registros
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {data.permanence.total}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Todos os turnos
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                Ativos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                {data.permanence.active}
              </div>
              <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Em serviço
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                {data.permanence.completed}
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                Finalizados
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Notas e Observações */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
              Notas e Observações
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Registros e anotações da equipe
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-teal-800 dark:text-teal-200">
                Total de Notas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-teal-700 dark:text-teal-300">
                {data.notes.total}
              </div>
              <div className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                Todas as anotações
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-cyan-800 dark:text-cyan-200">
                Notas Recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">
                {data.notes.recent}
              </div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                Últimos 7 dias
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Chaves */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg">
            <Key className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-rose-800 bg-clip-text text-transparent">
              Controle de Chaves
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Gestão do sistema de chaves
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Total de Chaves
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                {data.keys.total}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                Inventário completo
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                {data.keys.available}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                Para empréstimo
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-400/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-rose-800 dark:text-rose-200">
                Emprestadas
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-rose-700 dark:text-rose-300">
                {data.keys.borrowed}
              </div>
              <div className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                Em uso
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de TI */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl shadow-lg">
            <Settings className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-violet-800 bg-clip-text text-transparent">
              Chamados de TI
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Suporte técnico e manutenção
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-violet-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-violet-800 dark:text-violet-200">
                Total
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                {data.ti.total}
              </div>
              <div className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                Todos os chamados
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                Abertos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {data.ti.open}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Aguardando atendimento
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Em Andamento
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                {data.ti.inProgress}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Sendo atendidos
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 to-slate-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Resolvidos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                {data.ti.resolved}
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Concluídos
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seção de Faxina */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-lime-500 to-lime-600 rounded-xl shadow-lg">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-lime-600 to-lime-800 bg-clip-text text-transparent">
              Controle de Faxina
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Gestão da limpeza e manutenção
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-lime-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-lime-800 dark:text-lime-200">
                Total de Setores
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-lime-700 dark:text-lime-300">
                {data.cleaning.total}
              </div>
              <div className="text-xs text-lime-600 dark:text-lime-400 mt-1">
                Áreas sob controle
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-lime-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-lime-800 dark:text-lime-200">
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-lime-700 dark:text-lime-300">
                {data.cleaning.pending}
              </div>
              <div className="text-xs text-lime-600 dark:text-lime-400 mt-1">
                Aguardando limpeza
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-lime-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-lime-800 dark:text-lime-200">
                Concluídos
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-lime-700 dark:text-lime-300">
                {data.cleaning.completed}
              </div>
              <div className="text-xs text-lime-600 dark:text-lime-400 mt-1">
                Limpeza finalizada
              </div>
            </CardContent>
          </Card>
          
          <Card className="group relative overflow-hidden bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-900/20 dark:to-lime-800/20 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-400/10 to-lime-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-lime-800 dark:text-lime-200">
                Atrasados
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-lime-700 dark:text-lime-300">
                {data.cleaning.overdue}
              </div>
              <div className="text-xs text-lime-600 dark:text-lime-400 mt-1">
                Requer atenção
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
