"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { usePathname } from "next/navigation"

export function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isVisible, setIsVisible] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        // Handler para capturar o evento de instalação
        const handler = (e: any) => {
            // Previne o comportamento padrão (mini-infobar ou banner nativo)
            e.preventDefault()
            // Guarda o evento para acionar depois
            setDeferredPrompt(e)

            // Verifica se não estamos na página de login
            if (!pathname?.includes("/login")) {
                // Mostra nossa UI personalizada (ou apenas guarda para um botão no menu)
                // Aqui optamos por mostrar um toast discreto ou banner apenas se não for login

                // Lógica opcional: só mostrar se o usuário já navegou um pouco ou está na dashboard
                setIsVisible(true)
            }
        }

        window.addEventListener("beforeinstallprompt", handler)

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
        }
    }, [pathname])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Mostra o prompt nativo
        deferredPrompt.prompt()

        // Espera a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)

        // Limpa o prompt
        setDeferredPrompt(null)
        setIsVisible(false)
    }

    // Se não houver prompt capturado ou se estivermos no login (redundância), não renderiza nada
    if (!deferredPrompt) return null

    // Se estivermos no login, garante que não mostra (embora o useEffect já trate, o render é mais seguro)
    if (pathname?.includes("/login")) return null

    // Retorna null por padrão para não mostrar nada intrusivo na tela, 
    // exceto se quisermos um banner fixo. 
    // O usuário pediu "notificação" ou "dentro do sistema".
    // Vamos implementar como um Toast ou Banner discreto que o usuário pode fechar.

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-4 bg-slate-900 border border-slate-700 text-white p-4 rounded-lg shadow-xl animate-in slide-in-from-bottom-5">
            <div className="flex flex-col">
                <span className="font-semibold text-sm">Instalar Aplicativo</span>
                <span className="text-xs text-slate-400">Acesse o POKER 360 direto do seu dispositivo</span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    size="sm"
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white h-8"
                    onClick={handleInstallClick}
                >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-slate-400 hover:text-white"
                    onClick={() => setIsVisible(false)}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}
