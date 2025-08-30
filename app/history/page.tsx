import { HistoryTabs } from "@/components/history-tabs"

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Visualize o histórico de atividades do Esquadrão
        </p>
      </div>
      
      <HistoryTabs />
    </div>
  )
}
