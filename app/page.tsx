"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Sempre redirecionar para a página de login
    router.push("/login")
  }, [router])

  // Mostrar loading enquanto redireciona
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent">
          POKER 360
        </h1>
        <p className="text-gray-300">Redirecionando para login...</p>
      </div>
    </div>
  )
}
