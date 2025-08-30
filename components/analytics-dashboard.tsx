"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart } from "@/components/ui/chart"
import { Users, Calendar, Clock } from "lucide-react"

function AnalyticsDashboard() {
  // Sample Data for Charts (replace with actual data fetched from your backend)
  const attendanceData = [
    { month: "Jan", present: 20, absent: 5 },
    { month: "Feb", present: 22, absent: 3 },
    { month: "Mar", present: 18, absent: 7 },
    { month: "Apr", present: 25, absent: 0 },
  ]

  const justificationTypesData = [
    { name: "Férias", value: 10 },
    { name: "Missão", value: 5 },
    { name: "Dispensa Médica", value: 3 },
    { name: "Curso", value: 2 },
  ]

  const keyUsageData = [
    { key: "Sala de Comando", usage: 15 },
    { key: "Almoxarifado", usage: 10 },
    { key: "Viatura 01", usage: 8 },
  ]

  return (
    <div className="grid gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold">Dashboard de Análise</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Militares</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div> {/* Replace with dynamic data */}
            <p className="text-xs text-muted-foreground">+20.1% do mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Média</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div> {/* Replace with dynamic data */}
            <p className="text-xs text-muted-foreground">+5% desde a semana passada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de Voo Registradas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1200h</div> {/* Replace with dynamic data */}
            <p className="text-xs text-muted-foreground">+100h este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Presença Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={attendanceData}
              x="month"
              y="present"
              title="Militares Presentes por Mês"
              description="Comparativo de presença ao longo dos meses."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Justificativa</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="pie"
              data={justificationTypesData}
              x="name"
              y="value"
              title="Distribuição de Justificativas"
              description="Percentual de cada tipo de justificativa."
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Uso de Chaves do Claviculário</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart
              type="bar"
              data={keyUsageData}
              x="key"
              y="usage"
              title="Chaves Mais Utilizadas"
              description="Número de vezes que cada chave foi retirada."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export { AnalyticsDashboard }
export default AnalyticsDashboard
