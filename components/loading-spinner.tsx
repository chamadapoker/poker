import { Loader2, Shield } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-pulse">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Sistema Militar
        </h2>
        <div className="flex items-center justify-center gap-2 text-blue-100">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando...</span>
        </div>
      </div>
    </div>
  )
}
