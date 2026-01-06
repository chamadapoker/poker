import { Loader2, Shield, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"

export function LoadingSpinner() {
  const [loadingStep, setLoadingStep] = useState(0)
  const [showRetry, setShowRetry] = useState(false)
  const loadingSteps = [
    "Verificando conexão...",
    "Autenticando usuário...",
    "Carregando perfil...",
    "Preparando sistema..."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % loadingSteps.length)
    }, 2000) // Muda a cada 2 segundos

    // Mostrar botão de retry após 12 segundos
    const retryTimeout = setTimeout(() => {
      setShowRetry(true)
    }, 12000)

    return () => {
      clearInterval(interval)
      clearTimeout(retryTimeout)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-pulse">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Sistema Militar
        </h2>
        <div className="flex items-center justify-center gap-2 text-blue-100 mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingSteps[loadingStep]}</span>
        </div>
        <div className="text-sm text-blue-200 mb-4">
          Se demorar mais de 10 segundos, tente recarregar a página
        </div>
        
        {showRetry && (
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  )
}
