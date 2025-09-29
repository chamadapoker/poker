"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Smartphone, Monitor } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return
      }
      
      // Para iOS Safari
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true)
        return
      }
    }

    checkIfInstalled()

    // Escutar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Mostrar prompt após 3 segundos
      setTimeout(() => {
        setShowInstallPrompt(true)
      }, 3000)
    }

    // Escutar evento de instalação concluída
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('✅ PWA instalado com sucesso')
      } else {
        console.log('❌ Instalação do PWA cancelada')
      }
      
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } catch (error) {
      console.error('❌ Erro ao instalar PWA:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Não mostrar novamente por 24 horas
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Verificar se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const now = Date.now()
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60)
      
      if (hoursSinceDismissed < 24) {
        setShowInstallPrompt(false)
      }
    }
  }, [])

  if (isInstalled || !showInstallPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <CardTitle className="text-lg">Instalar App</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <CardDescription className="text-blue-100 mb-4">
            Instale o Sistema POKER 360 no seu dispositivo para acesso rápido e funcionamento offline.
          </CardDescription>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Acesso offline
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Notificações push
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Carregamento mais rápido
            </div>
          </div>
          
          <Button
            onClick={handleInstallClick}
            className="w-full mt-4 bg-white text-blue-600 hover:bg-blue-50 font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Instalar Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
