import { JustificationManager } from "@/components/justification-manager"

export default function JustificationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header padronizado */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Gestão de Justificativas
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Sistema completo para gerenciar justificativas de ausência dos militares
          </p>
        </div>
        
        <JustificationManager />
      </div>
    </div>
  )
}
