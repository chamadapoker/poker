import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { DailyQuotes } from "@/components/daily-quotes"
import { WeatherForecast } from "@/components/weather-forecast"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema POKER 360
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <DailyQuotes />
        <WeatherForecast />
        <AnalyticsDashboard />
      </div>
    </div>
  )
}
