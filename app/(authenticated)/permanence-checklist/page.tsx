import { PermanenceChecklist } from "@/components/permanence-checklist"

export default function PermanenceChecklistPage() {
  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Checklist de Permanência
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie as listas de verificação de permanência
        </p>
      </div>
      
      <PermanenceChecklist />
    </div>
  )
}
