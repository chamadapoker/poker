import { AttendanceTracker } from "@/components/attendance-tracker"

export default function AttendancePage() {
  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header com título em regrade */}
      <div className="text-center space-y-2 sm:space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-red-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient-x">
            Controle de Presença
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto px-4">
            Gerencie a presença dos militares do Esquadrão Poker com precisão e eficiência
          </p>
        </div>
      </div>
      
      {/* Componente principal */}
      <AttendanceTracker />
    </div>
  )
}
