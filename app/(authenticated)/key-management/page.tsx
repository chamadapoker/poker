import KeyManagement from "@/components/key-management"

import { unstable_noStore as noStore } from "next/cache"

export default function KeyManagementPage() {
  // Forçar renderização dinâmica
  noStore()
  
  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Gestão de Chaves
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Controle o sistema de chaves do Esquadrão
        </p>
      </div>
      
      <KeyManagement />
    </div>
  )
}
