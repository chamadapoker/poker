"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-6">
      {/* Data atual - Design melhorado */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg">
          <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-pulse shadow-lg"></div>
          <span className="text-base font-semibold text-slate-700 dark:text-slate-300 capitalize">
            {stats.date}
          </span>
        </div>
      </div>

      {/* Cards de estatísticas - Design moderno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total de militares */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-blue-100 text-center">
              Total de Militares
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">{stats.total}</span>
              </div>
              <p className="text-sm font-medium text-blue-100">
                Esquadrão completo
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Presentes */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-500 to-emerald-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-emerald-100 text-center">
              Presentes
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">{stats.present}</span>
              </div>
              <p className="text-sm font-medium text-emerald-100">
                {stats.percentage}% de presença
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ausentes (incluindo justificativas) */}
        <Card className="group relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-500 to-red-600">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-base font-semibold text-red-100 text-center">
              Ausentes
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <span className="text-3xl font-bold text-white">{stats.absent}</span>
              </div>
              <p className="text-sm font-medium text-red-100">
                {stats.absent} sem justificativa, {stats.justified} com justificativa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  )
}

export default AttendanceStats
