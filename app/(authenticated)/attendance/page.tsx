import { AttendanceTracker } from "@/components/attendance-tracker"

export default function AttendancePage() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Controle de Presença
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gerencie a presença dos militares do Esquadrão Poker com precisão e eficiência
        </p>
      </div>
      
      {/* Componente principal */}
      <AttendanceTracker />
    </div>
  )
}
