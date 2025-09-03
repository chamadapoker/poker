import { FlightScheduler } from "@/components/flight-scheduler"

export default function FlightSchedulerPage() {
  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Agendamento de Voos
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie o cronograma de voos do Esquadrão
        </p>
      </div>
      
      <FlightScheduler />
    </div>
  )
}
