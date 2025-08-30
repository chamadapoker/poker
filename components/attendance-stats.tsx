"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, FileText, Calendar, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

function AttendanceStats() {
  const [stats, setStats] = useState({
    date: new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    total: 25,
    present: 22,
    absent: 2,
    justified: 1,
    percentage: 88
  })

  useEffect(() => {
    // Simula dados de presença do dia
    // Em produção, isso viria da API
    const mockStats = {
      date: new Date().toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      total: 25,
      present: Math.floor(Math.random() * 5) + 20, // 20-24
      absent: Math.floor(Math.random() * 3) + 1,   // 1-3
      justified: Math.floor(Math.random() * 2) + 1, // 1-2
      percentage: 0
    }
    
    mockStats.justified = Math.min(mockStats.justified, mockStats.absent)
    mockStats.absent = mockStats.absent - mockStats.justified
    mockStats.percentage = Math.round((mockStats.present / mockStats.total) * 100)
    
    setStats(mockStats)
  }, [])

  return (
    <div className="space-y-4">
      {/* Data atual */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
          <Calendar className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
            {stats.date}
          </span>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total de militares */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-950/40 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Total de Militares
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.total}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Esquadrão completo
            </p>
          </CardContent>
        </Card>

        {/* Presentes */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-950/40 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
              Presentes
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {stats.present}
            </div>
            <p className="text-xs text-green-700 dark:text-green-400">
              {stats.percentage}% de presença
            </p>
          </CardContent>
        </Card>

        {/* Ausentes (incluindo justificativas) */}
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-950/40 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
              Ausentes
            </CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900 dark:text-red-100">
              {stats.absent + stats.justified}
            </div>
            <p className="text-xs text-red-700 dark:text-red-400">
              {stats.absent} sem justificativa, {stats.justified} com justificativa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo e tendência */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 dark:text-slate-200">
              Resumo do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Taxa de Presença:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.percentage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total de Ausências:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.absent + stats.justified}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Sem Justificativa:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.absent}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 dark:text-slate-400">Com Justificativa:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{stats.justified}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-950/40">
          <CardHeader>
            <CardTitle className="text-lg text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Status da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700 dark:text-amber-400">Média Semanal:</span>
                <span className="font-semibold text-amber-800 dark:text-amber-300">91%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700 dark:text-amber-400">Meta Mensal:</span>
                <span className="font-semibold text-amber-800 dark:text-amber-300">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-amber-700 dark:text-amber-400">Tendência:</span>
                <span className="font-semibold text-green-600">↗️ Melhorando</span>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AttendanceStats }
export default AttendanceStats
