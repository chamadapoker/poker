import { HistoryTabs } from "@/components/history-tabs"

export default function HistoryPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Visualize o histórico de atividades do Esquadrão
        </p>
      </div>
      
      <HistoryTabs />
    </div>
  )
}
