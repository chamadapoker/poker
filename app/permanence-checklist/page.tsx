import { PermanenceChecklist } from "@/components/permanence-checklist"

export default function PermanenceChecklistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Checklist de Permanência</h1>
        <p className="text-muted-foreground">
          Gerencie as listas de verificação de permanência
        </p>
      </div>
      
      <PermanenceChecklist />
    </div>
  )
}
