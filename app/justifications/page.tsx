import { JustificationManager } from "@/components/justification-manager"

export default function JustificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Justificativas</h1>
        <p className="text-muted-foreground">
          Gerencie as justificativas de ausência dos militares
        </p>
      </div>
      
      <JustificationManager />
    </div>
  )
}
