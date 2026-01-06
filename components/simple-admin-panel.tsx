'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Users, Mail, CheckCircle, XCircle, RefreshCw, BarChart3 } from 'lucide-react'

interface User {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  last_sign_in_at: string | null
  display_name: string
  role: string
  rank: string
  squadron: string
}

interface UserStats {
  total_users: number
  verified_users: number
  unverified_users: number
  admin_users: number
}

export default function SimpleAdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  // Carregar lista de usuários
  const loadUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError('Erro ao carregar usuários: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats')
      if (error) throw error
      setStats(data?.[0] || null)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }

  // Enviar email de verificação
  const sendEmailVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      if (error) throw error
      setMessage('Email de verificação enviado!')
    } catch (err) {
      setError('Erro ao enviar email: ' + (err as Error).message)
    }
  }

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
              <div className="text-sm text-gray-600">Total de Usuários</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.verified_users}</div>
              <div className="text-sm text-gray-600">Emails Verificados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.unverified_users}</div>
              <div className="text-sm text-gray-600">Emails Não Verificados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.admin_users}</div>
              <div className="text-sm text-gray-600">Administradores</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciamento de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              Visualize e gerencie usuários do sistema
            </p>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Atualizar
            </Button>
          </div>

          {message && (
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">{user.email}</span>
                      {user.email_confirmed_at ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Não Verificado
                        </Badge>
                      )}
                      {user.role === 'admin' && (
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      <div>Nome: {user.display_name}</div>
                      <div>Posto: {user.rank} | Esquadrão: {user.squadron}</div>
                      <div>Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</div>
                      {user.last_sign_in_at && (
                        <div>Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {!user.email_confirmed_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendEmailVerification(user.email)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Enviar Verificação
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Instruções de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Para alterar senhas e emails:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Acesse o painel do Supabase</li>
              <li>Vá em "Authentication" → "Users"</li>
              <li>Clique no email do usuário desejado</li>
              <li>Use as opções disponíveis na página de detalhes</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Para verificar emails:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Use o botão "Enviar Verificação" acima</li>
              <li>Ou acesse o painel do Supabase</li>
              <li>Clique no usuário → "Send Email Verification"</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
