import { EventCalendar } from "@/components/event-calendar"

export default function EventCalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendário de Eventos</h1>
        <p className="text-muted-foreground">
          Gerencie o calendário de eventos do Esquadrão
        </p>
      </div>
      
      <EventCalendar />
    </div>
  )
}
