"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { 
  fetchTotalMilitaryPersonnel, 
  fetchCurrentDayAttendance, 
  fetchUpcomingEvents 
} from "@/lib/data"

interface AnalyticsData {
  totalPersonnel: number
  currentAttendance: {
    present: number
    absent: number
    justified: number
    percentage: number
  }
  keyUsage: {
    keyName: string
    location: string
    usageCount: number
    lastUsed: string
  }[]
  recentEvents: {
    title: string
    date: string
    type: string
  }[]
  flightStats: {
    totalFlights: number
    completedFlights: number
    totalHours: number
  }
  loading: boolean
  error: string | null
}

function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPersonnel: 0,
    currentAttendance: { present: 0, absent: 0, justified: 0, percentage: 0 },
    keyUsage: [],
    recentEvents: [],
    flightStats: { totalFlights: 0, completedFlights: 0, totalHours: 0 },
    loading: true,
    error: null
  })

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setAnalyticsData(prev => ({ ...prev, loading: true, error: null }))

        // Buscar dados reais do banco
        const [
          totalPersonnel,
          currentAttendance,
          recentEvents
        ] = await Promise.all([
          fetchTotalMilitaryPersonnel(),
          fetchCurrentDayAttendance(),
          fetchUpcomingEvents()
        ])

        setAnalyticsData({
          totalPersonnel,
          currentAttendance,
          keyUsage: [],
          recentEvents,
          flightStats: {
            totalFlights: 0,
            completedFlights: 0,
            totalHours: 0
          },
          loading: false,
          error: null
        })
      } catch (error: any) {
        console.error("Erro ao carregar dados analíticos:", error)
        setAnalyticsData(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message || "Erro ao carregar dados" 
        }))
      }
    }

    loadAnalyticsData()
  }, [])

  if (analyticsData.loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Carregando estatísticas...</p>
        </div>
      </div>
    )
  }

  if (analyticsData.error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl text-red-600 dark:text-red-400">⚠️</span>
          </div>
          <p className="text-red-600 dark:text-red-400 font-medium">Erro ao carregar dados</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{analyticsData.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
          Dashboard Analítico
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Visão completa e detalhada das estatísticas do Esquadrão
        </p>
      </div>

      {/* Cards principais - Design moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Militares */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-blue-100 text-center">
              Total de Militares
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">{analyticsData.totalPersonnel}</span>
              </div>
              <p className="text-sm font-medium text-blue-100">Esquadrão completo</p>
            </div>
          </CardContent>
        </Card>

        {/* Presença Hoje */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-emerald-100 text-center">
              Presença Hoje
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">{analyticsData.currentAttendance.percentage}%</span>
              </div>
              <p className="text-sm font-medium text-emerald-100">{analyticsData.currentAttendance.present} presentes, {analyticsData.currentAttendance.absent} ausentes</p>
            </div>
          </CardContent>
        </Card>

        {/* Justificativas */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-amber-500 to-amber-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-amber-100 text-center">
              Justificativas
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">{analyticsData.currentAttendance.justified}</span>
              </div>
              <p className="text-sm font-medium text-amber-100">Com justificativa hoje</p>
            </div>
          </CardContent>
        </Card>

        {/* Total de Voos */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-500 to-purple-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-purple-100 text-center">
              Total de Voos
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <span className="text-2xl font-bold text-white">{analyticsData.flightStats.totalFlights}</span>
              </div>
              <p className="text-sm font-medium text-purple-100">{analyticsData.flightStats.totalHours}h acumuladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Eventos - Design moderno */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <CardTitle className="text-lg font-bold text-center">
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {analyticsData.recentEvents.length > 0 ? (
                analyticsData.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{event.title}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">{event.date}</div>
                    </div>
                    <div className="text-xs bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-full font-medium">
                      {event.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <span className="text-2xl font-bold text-slate-600 dark:text-slate-300">E</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">Nenhum evento próximo</p>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-500">Os eventos aparecerão conforme forem cadastrados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
