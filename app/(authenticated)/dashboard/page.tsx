import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast"
import ComprehensiveDashboard from "@/components/comprehensive-dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header padronizado */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visão geral do sistema e estatísticas do Esquadrão
          </p>
        </div>
        
        {/* Frase do dia */}
        <div className="w-full">
          <DailyQuotes />
        </div>
        
        {/* Previsão do tempo */}
        <div className="w-full">
          <WeatherForecast />
        </div>
        

        

        
        {/* Dashboard abrangente com todas as informações */}
        <div className="w-full">
          <ComprehensiveDashboard />
        </div>
      </div>
    </div>
  )
}
