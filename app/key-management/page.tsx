import { KeyManagement } from "@/components/key-management"

export default function KeyManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Chaves</h1>
        <p className="text-muted-foreground">
          Controle o sistema de chaves do Esquadrão
        </p>
      </div>
      
      <KeyManagement />
    </div>
  )
}
