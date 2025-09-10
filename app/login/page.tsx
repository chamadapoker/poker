"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Shield, User, Lock, Eye, EyeOff, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Não verificar usuário logado - sempre mostrar página de login
    console.log('🔐 Página de login carregada - sempre requer novo login')
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        toast({
          title: "Erro no Login",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (data.user) {
        toast({
          title: "Login Realizado!",
          description: "Bem-vindo ao Sistema POKER 360!",
        })
        
        // Redirecionar baseado no role do usuário
        const { data: profile } = await (supabase as any)
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single()

        if (profile?.role === 'admin') {
          router.push("/dashboard")
        } else {
          router.push("/dashboard") // Usuário comum também vai para dashboard
        }
      }
    } catch (error) {
      setError("Erro inesperado. Tente novamente.")
      toast({
        title: "Erro no Login",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-white to-red-400 bg-clip-text text-transparent">
            POKER 360
          </h1>
          <p className="text-gray-300 text-lg">
            1º/10º GAV
          </p>
        </div>

        {/* Login Card */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-gray-300">
              Faça login para acessar o sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/30 focus:border-white/50 transition-all duration-300 backdrop-blur-sm"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <User className="w-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-gray-400 focus:bg-white/30 focus:border-white/50 transition-all duration-300 pr-12 backdrop-blur-sm"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert className="bg-red-500/20 border-red-400/30 text-red-100">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 text-lg transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm border border-white/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Entrar no Sistema
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
        </div>
      </div>
    </div>
  )
}
