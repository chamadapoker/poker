"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Se usuário está logado, redirecionar para dashboard
        router.push("/dashboard")
      } else {
        // Se não está logado, redirecionar para login
        router.push("/login")
      }
    }
  }, [user, isLoading, router])

  // Mostrar loading enquanto verifica autenticação
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent">
          POKER 360
        </h1>
        <p className="text-gray-300">
          {isLoading ? "Verificando autenticação..." : "Redirecionando..."}
        </p>
      </div>
    </div>
  )
}
