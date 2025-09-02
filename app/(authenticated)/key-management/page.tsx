import KeyManagement from "@/components/key-management"

import { unstable_noStore as noStore } from "next/cache"

export default function KeyManagementPage() {
  // Forçar renderização dinâmica
  noStore()
  
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
