import AnalyticsDashboard from "@/components/analytics-dashboard"
import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast"
import { AttendanceStats } from "@/components/attendance-stats"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header centralizado */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          POKER 360
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          1º/10º GAV - Visão geral do sistema e estatísticas do Esquadrão
        </p>
      </div>
      
      {/* Frase do dia em linha única abaixo do header */}
      <div className="w-full">
        <DailyQuotes />
      </div>
      
      {/* Previsão do tempo como primeira seção */}
      <div className="w-full">
        <WeatherForecast />
      </div>
      
      {/* Estatísticas de presença do dia */}
      <div className="w-full">
        <AttendanceStats />
      </div>
      
      {/* Dashboard de análise */}
      <div className="w-full">
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
