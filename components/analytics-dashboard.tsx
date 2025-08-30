"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, UserCheck, UserX, FileText, Key, TrendingUp, TrendingDown, Activity, Target } from "lucide-react"
import { useEffect, useState } from "react"

interface AnalyticsData {
  totalPersonnel: number
  currentAttendance: {
    present: number
    absent: number
    justified: number
    percentage: number
  }
  monthlyStats: {
    month: string
    present: number
    absent: number
    percentage: number
  }[]
  justificationTypes: {
    type: string
    count: number
    percentage: number
  }[]
  keyUsage: {
    keyName: string
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
    monthlyStats: [],
    justificationTypes: [],
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

        // Dados simulados funcionais
        const mockData = {
          totalPersonnel: 40,
          currentAttendance: {
            present: 32,
            absent: 6,
            justified: 2,
            percentage: 80
          },
          monthlyStats: [
            { month: 'Jan', present: 28, absent: 4, percentage: 88 },
            { month: 'Fev', present: 30, absent: 3, percentage: 91 },
            { month: 'Mar', present: 29, absent: 5, percentage: 85 },
            { month: 'Abr', present: 31, absent: 2, percentage: 94 },
            { month: 'Mai', present: 27, absent: 6, percentage: 82 },
            { month: 'Jun', present: 32, absent: 3, percentage: 91 }
          ],
          justificationTypes: [
            { type: 'Atestado médico', count: 8, percentage: 40 },
            { type: 'Serviço externo', count: 6, percentage: 30 },
            { type: 'Dispensa', count: 3, percentage: 15 },
            { type: 'Voo', count: 2, percentage: 10 },
            { type: 'Instrução', count: 1, percentage: 5 }
          ],
          keyUsage: [
            { keyName: 'Chave 001', usageCount: 45, lastUsed: '15/01/2025' },
            { keyName: 'Chave 002', usageCount: 38, lastUsed: '14/01/2025' },
            { keyName: 'Chave 003', usageCount: 32, lastUsed: '13/01/2025' },
            { keyName: 'Chave 004', usageCount: 28, lastUsed: '12/01/2025' },
            { keyName: 'Chave 005', usageCount: 25, lastUsed: '11/01/2025' }
          ],
          recentEvents: [
            { title: 'Formatura Mensal', date: '20/01/2025', type: 'Evento' },
            { title: 'Reunião de Comando', date: '22/01/2025', type: 'Reunião' },
            { title: 'Instrução de Voo', date: '25/01/2025', type: 'Instrução' }
          ],
          flightStats: {
            totalFlights: 156,
            completedFlights: 148,
            totalHours: 2847
          }
        }

        setAnalyticsData({
          ...mockData,
          loading: false,
          error: null
        })

      } catch (error) {
        console.error('Erro ao carregar dados analíticos:', error)
        setAnalyticsData(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao carregar dados analíticos'
        }))
      }
    }

    loadAnalyticsData()

    // Atualiza dados a cada 5 minutos
    const interval = setInterval(loadAnalyticsData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (analyticsData.loading) {
    return (
      <div className="grid gap-6 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Dashboard de Análise</h1>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400">Carregando dados analíticos...</p>
        </div>
      </div>
    )
  }

  if (analyticsData.error) {
    return (
      <div className="grid gap-6 p-4 md:p-6">
        <h1 className="text-2xl font-bold">Dashboard de Análise</h1>
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{analyticsData.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard de Análise</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Última atualização: {new Date().toLocaleTimeString('pt-BR')}
        </div>
      </div>

      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-950/40 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Total de Militares</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.totalPersonnel}</div>
            <p className="text-xs text-blue-700 dark:text-blue-400">Esquadrão completo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-950/40 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Presença Hoje</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.currentAttendance.percentage}%</div>
            <p className="text-xs text-green-700 dark:text-green-400">
              {analyticsData.currentAttendance.present} presentes, {analyticsData.currentAttendance.absent} ausentes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-950/40 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-300">Justificativas</CardTitle>
            <FileText className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">{analyticsData.currentAttendance.justified}</div>
            <p className="text-xs text-amber-700 dark:text-amber-400">Com justificativa hoje</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-950/40 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-300">Total de Voos</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analyticsData.flightStats.totalFlights}</div>
            <p className="text-xs text-purple-700 dark:text-purple-400">{analyticsData.flightStats.totalHours}h acumuladas</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Presença Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Presença Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.monthlyStats.map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{month.month}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${month.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                      {month.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tipos de Justificativa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              Tipos de Justificativa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.justificationTypes.map((justification, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{justification.type}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${justification.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 w-8 text-right">
                      {justification.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uso de Chaves e Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Uso de Chaves */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-green-600" />
              Chaves Mais Utilizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.keyUsage.map((key, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <div className="font-medium">{key.keyName}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Último uso: {key.lastUsed}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{key.usageCount}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">vezes</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Eventos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recentEvents.length > 0 ? (
                analyticsData.recentEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{event.date}</div>
                    </div>
                    <div className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full">
                      {event.type}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum evento próximo</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas de Voo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Estatísticas de Voo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analyticsData.flightStats.totalFlights}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total de Voos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{analyticsData.flightStats.completedFlights}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Voos Concluídos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{analyticsData.flightStats.totalHours}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Horas de Voo</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
