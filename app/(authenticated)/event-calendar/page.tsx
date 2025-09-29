import { EventCalendar } from "@/components/event-calendar"

export default function EventCalendarPage() {
  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Calendário de Eventos
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie o calendário de eventos do Esquadrão
        </p>
      </div>
      
      <EventCalendar />
    </div>
  )
}
