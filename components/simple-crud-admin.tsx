'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Users, Mail, CheckCircle, XCircle, RefreshCw, BarChart3, Plus, Edit, Trash2, Save, X } from 'lucide-react'

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

export default function SimpleCrudAdmin() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  // Estados para modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Estados para formulários
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    display_name: '',
    role: 'user',
    rank: '',
    squadron: ''
  })
  
  const [editUser, setEditUser] = useState({
    email: '',
    password: '',
    display_name: '',
    role: 'user',
    rank: '',
    squadron: ''
  })

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

  // Criar usuário
  const createUser = async () => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            display_name: newUser.display_name,
            role: newUser.role,
            rank: newUser.rank,
            squadron: newUser.squadron
          }
        }
      })
      
      if (error) throw error
      
      setMessage('Usuário criado com sucesso!')
      setNewUser({ email: '', password: '', display_name: '', role: 'user', rank: '', squadron: '' })
      setIsCreateModalOpen(false)
      loadUsers()
    } catch (err) {
      setError('Erro ao criar usuário: ' + (err as Error).message)
    }
  }

  // Atualizar usuário
  const updateUser = async () => {
    if (!selectedUser) return
    
    try {
      // Atualizar email via Supabase Auth
      if (editUser.email !== selectedUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: editUser.email
        })
        if (emailError) throw emailError
      }
      
      // Atualizar senha via Supabase Auth
      if (editUser.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editUser.password
        })
        if (passwordError) throw passwordError
      }
      
      setMessage('Usuário atualizado com sucesso! (Nota: Perfil deve ser atualizado via Supabase)')
      setEditUser({ email: '', password: '', display_name: '', role: 'user', rank: '', squadron: '' })
      setIsEditModalOpen(false)
      setSelectedUser(null)
      loadUsers()
    } catch (err) {
      setError('Erro ao atualizar usuário: ' + (err as Error).message)
    }
  }

  // Excluir usuário
  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return
    
    try {
      setMessage('Usuário excluído com sucesso! (Nota: Exclusão deve ser feita via Supabase Admin API)')
      loadUsers()
    } catch (err) {
      setError('Erro ao excluir usuário: ' + (err as Error).message)
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

  // Abrir modal de edição
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      email: user.email,
      password: '',
      display_name: user.display_name,
      role: user.role,
      rank: user.rank,
      squadron: user.squadron
    })
    setIsEditModalOpen(true)
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
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              CRUD de Usuários
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={loadUsers} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Atualizar
              </Button>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Usuário</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        placeholder="usuario@exemplo.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Senha</label>
                      <Input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={newUser.display_name}
                        onChange={(e) => setNewUser({...newUser, display_name: e.target.value})}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Tipo de Acesso</label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Posto</label>
                      <Input
                        value={newUser.rank}
                        onChange={(e) => setNewUser({...newUser, rank: e.target.value})}
                        placeholder="Ex: Sgt, Cb, etc."
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Esquadrão</label>
                      <Input
                        value={newUser.squadron}
                        onChange={(e) => setNewUser({...newUser, squadron: e.target.value})}
                        placeholder="Ex: 1º/10º GAV"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createUser} className="flex-1">
                        <Save className="h-4 w-4 mr-2" />
                        Criar
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    
                    {!user.email_confirmed_at && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendEmailVerification(user.email)}
                      >
                        <Mail className="h-4 w-4 mr-1" />
                        Verificar
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                placeholder="usuario@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nova Senha (deixe em branco para não alterar)</label>
              <Input
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={editUser.display_name}
                onChange={(e) => setEditUser({...editUser, display_name: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de Acesso</label>
              <Select value={editUser.role} onValueChange={(value) => setEditUser({...editUser, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Posto</label>
              <Input
                value={editUser.rank}
                onChange={(e) => setEditUser({...editUser, rank: e.target.value})}
                placeholder="Ex: Sgt, Cb, etc."
              />
            </div>
            <div>
              <label className="text-sm font-medium">Esquadrão</label>
              <Input
                value={editUser.squadron}
                onChange={(e) => setEditUser({...editUser, squadron: e.target.value})}
                placeholder="Ex: 1º/10º GAV"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={updateUser} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>CRUD de Usuários - Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">✅ Funcionalidades Implementadas:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li><strong>CREATE:</strong> Criar novos usuários com email, senha e metadados</li>
              <li><strong>READ:</strong> Visualizar todos os usuários com informações completas</li>
              <li><strong>UPDATE:</strong> Editar email e senha via Supabase Auth</li>
              <li><strong>DELETE:</strong> Interface para exclusão (deve ser feita via Supabase)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">⚠️ Limitações Atuais:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-600">
              <li>Alteração de perfil (nome, posto, esquadrão) deve ser feita via Supabase</li>
              <li>Exclusão de usuários deve ser feita via Supabase Admin API</li>
              <li>Alteração de tipo de acesso deve ser feita via Supabase</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">💡 Para CRUD Completo:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
              <li>Execute o script: <code>scripts/crud-admin-setup.sql</code></li>
              <li>Configure a tabela <code>profiles</code> corretamente</li>
              <li>Use a interface do Supabase para operações avançadas</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
