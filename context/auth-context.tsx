"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: string
  user_id: string
  role: 'admin' | 'user'
  display_name?: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Funções para persistência local do perfil
  const saveProfileToLocalStorage = (profile: UserProfile) => {
    try {
      localStorage.setItem('poker_profile', JSON.stringify(profile))
      console.log('💾 Perfil salvo no localStorage:', profile)
    } catch (error) {
      console.error('❌ Erro ao salvar perfil no localStorage:', error)
    }
  }

  const loadProfileFromLocalStorage = (): UserProfile | null => {
    try {
      const savedProfile = localStorage.getItem('poker_profile')
      if (savedProfile) {
        const profile = JSON.parse(savedProfile)
        console.log('📱 Perfil carregado do localStorage:', profile)
        return profile
      }
    } catch (error) {
      console.error('❌ Erro ao carregar perfil do localStorage:', error)
    }
    return null
  }

  const clearProfileFromLocalStorage = () => {
    try {
      localStorage.removeItem('poker_profile')
      console.log('🗑️ Perfil removido do localStorage')
    } catch (error) {
      console.error('❌ Erro ao remover perfil do localStorage:', error)
    }
  }

  useEffect(() => {
    // Carregar perfil do localStorage imediatamente para melhor UX
    const savedProfile = loadProfileFromLocalStorage()
    if (savedProfile) {
      setProfile(savedProfile)
      console.log('⚡ Perfil carregado instantaneamente do localStorage')
      // Se temos perfil no localStorage, finalizar loading imediatamente
      setIsLoading(false)
    }

    // Timeout de segurança para evitar travamento (reduzido para melhor UX)
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Timeout de segurança ativado - forçando fim do loading')
      setIsLoading(false)
    }, 1500) // 1.5 segundos para melhor UX

    // Verificar sessão atual
    const getSession = async () => {
      try {
        console.log('🔐 Verificando sessão atual...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Erro ao buscar sessão:', error)
          setIsLoading(false)
          clearTimeout(safetyTimeout)
          return
        }

        console.log('✅ Sessão encontrada:', session ? 'Sim' : 'Não')
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('👤 Usuário autenticado:', session.user.email)
          // Verificar se o perfil do localStorage é do mesmo usuário
          if (savedProfile && savedProfile.user_id === session.user.id) {
            console.log('✅ Perfil do localStorage é válido para este usuário')
            // Sincronizar com o banco em background
            fetchUserProfile(session.user.id)
          } else {
            console.log('🔄 Perfil do localStorage não é válido, buscando do banco...')
            await fetchUserProfile(session.user.id)
          }
        } else {
          console.log('👤 Nenhum usuário autenticado')
          // Limpar perfil se não há usuário
          setProfile(null)
          clearProfileFromLocalStorage()
        }
        
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      } catch (error) {
        console.error('❌ Erro inesperado ao verificar sessão:', error)
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      }
    }

    getSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de autenticação:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setProfile(null)
          clearProfileFromLocalStorage()
        }
        
        setIsLoading(false)
        clearTimeout(safetyTimeout)
      }
    )

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimeout)
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Buscando perfil para usuário:', userId)
      
      // Verificar se já temos perfil em cache
      if (profile && profile.user_id === userId) {
        console.log('⚡ Perfil já em cache, pulando busca')
        return
      }
      
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        console.error('📋 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        
        // Se não existir perfil, criar um padrão
        console.log('🔄 Tentando criar perfil padrão...')
        await createDefaultProfile(userId)
      } else {
        console.log('✅ Perfil encontrado:', data)
        setProfile(data)
        saveProfileToLocalStorage(data)
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar perfil:', error)
    }
  }

  const createDefaultProfile = async (userId: string) => {
    try {
      console.log('🆕 Criando perfil padrão para usuário:', userId)
      
      // Usar dados do usuário já disponíveis em vez de fazer nova chamada
      const currentUser = user || session?.user
      if (!currentUser) {
        console.error('❌ Usuário não disponível para criar perfil')
        return
      }

      const isAdmin = currentUser.email === 'pokeradmin@teste.com'
      console.log('👑 Role determinado:', isAdmin ? 'admin' : 'user')
      
      // Criar perfil temporário imediatamente para melhor UX
      const tempProfile = {
        id: `temp-${userId}`,
        user_id: userId,
        role: (isAdmin ? 'admin' : 'user') as 'admin' | 'user',
        display_name: currentUser.email?.split('@')[0] || 'Usuário',
        created_at: new Date().toISOString()
      }
      
      // Definir perfil temporário imediatamente
      setProfile(tempProfile)
      saveProfileToLocalStorage(tempProfile)
      
      // Criar perfil no banco em background (não bloqueia)
      const { data, error } = await (supabase as any)
        .from('user_profiles')
        .insert({
          user_id: userId,
          role: isAdmin ? 'admin' : 'user',
          display_name: currentUser.email?.split('@')[0] || 'Usuário'
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Erro ao criar perfil no banco:', error)
        // Manter perfil temporário se falhar
        if (error.code === '42P01') { // undefined_table
          console.error('🚨 TABELA user_profiles NÃO EXISTE!')
          console.error('📋 Execute o script SQL: scripts/create_user_profiles_table.sql')
        }
      } else {
        console.log('✅ Perfil criado no banco com sucesso:', data)
        setProfile(data)
        saveProfileToLocalStorage(data)
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao criar perfil:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Iniciando logout...')
      
      // Limpar estado local primeiro
      setUser(null)
      setSession(null)
      setProfile(null)
      clearProfileFromLocalStorage()
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('❌ Erro no Supabase logout:', error)
        throw error
      }
      
      console.log('✅ Logout realizado com sucesso')
      
      // Forçar redirecionamento para login
      window.location.href = '/login'
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      // Mesmo com erro, tentar redirecionar
      window.location.href = '/login'
    }
  }

  const value = {
    user,
    session,
    profile,
    isLoading,
    signOut,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Hook para verificar se o usuário tem acesso a uma página
export function useRequireAuth(requiredRole?: 'admin' | 'user') {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Aguardar o carregamento terminar
    if (isLoading) {
      return
    }

    // Se não há usuário, redirecionar para login
    if (!user) {
      console.log('🚪 Usuário não autenticado, redirecionando para login')
      router.push('/login')
      return
    }

    // Se há usuário mas não há perfil ainda, aguardar um pouco mais
    if (user && !profile) {
      console.log('⏳ Usuário autenticado mas perfil ainda carregando...')
      // Aguardar mais tempo para o perfil carregar (reduzido para melhor UX)
      const timeout = setTimeout(() => {
        if (!profile) {
          console.log('⚠️ Timeout aguardando perfil, redirecionando para dashboard')
          router.push('/dashboard')
        }
      }, 1000) // 1 segundo para melhor UX
      
      return () => clearTimeout(timeout)
    }

    // Verificar role se necessário
    if (user && profile && requiredRole && profile.role !== requiredRole) {
      console.log(`🚫 Usuário não tem role ${requiredRole}, redirecionando para dashboard`)
      router.push('/dashboard')
      return
    }

    console.log('✅ Usuário autenticado e autorizado')
  }, [user, profile, isLoading, requiredRole, router])

  return { user, profile, isLoading }
}
