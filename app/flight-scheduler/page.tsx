import { FlightScheduler } from "@/components/flight-scheduler"

export default function FlightSchedulerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agendamento de Voos</h1>
        <p className="text-muted-foreground">
          Gerencie o cronograma de voos do Esquadrão
        </p>
      </div>
      
      <FlightScheduler />
    </div>
  )
}
