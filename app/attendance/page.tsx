import { AttendanceTracker } from "@/components/attendance-tracker"

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controle de Presença</h1>
        <p className="text-muted-foreground">
          Gerencie a presença dos militares do Esquadrão Poker
        </p>
      </div>
      
      <AttendanceTracker />
    </div>
  )
}
