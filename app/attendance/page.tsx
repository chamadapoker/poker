import { AttendanceTracker } from "@/components/attendance-tracker"

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      {/* Header com cores sólidas da logo */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-600 p-1 shadow-lg">
          <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
            <span className="text-2xl font-bold text-red-600">
              P
            </span>
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-red-600 dark:text-red-400">
            Controle de Presença
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            Gerencie a presença dos militares do Esquadrão Poker com precisão e eficiência
          </p>
        </div>
      </div>
      
      {/* Componente principal */}
      <AttendanceTracker />
    </div>
  )
}
