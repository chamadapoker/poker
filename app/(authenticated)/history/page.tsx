"use client"

import { HistoryTabs } from "@/components/history-tabs"
import { useRequireAuth } from "@/context/auth-context"
import { Crown, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function HistoryPage() {
  const { profile } = useRequireAuth("admin")

  // Se não for admin, mostrar mensagem de acesso negado
  if (profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
                <p className="text-sm">
                  Esta página é restrita apenas para administradores do sistema.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2 text-yellow-600">
                  <Crown className="h-4 w-4" />
                  <span className="text-xs">Requer permissão de Administrador</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Histórico do Sistema
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Visualize e gerencie todo o histórico de atividades
        </p>
      </div>
      
      <HistoryTabs />
    </div>
  )
}
