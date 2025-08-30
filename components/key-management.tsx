"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Key, User, Clock, CheckCircle, XCircle, AlertCircle, History, Plus, Save, X } from "lucide-react"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Log das variáveis de ambiente para debug
console.log("🔧 Configuração Supabase:")
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Configurada" : "❌ Não configurada")
console.log("ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Configurada" : "❌ Não configurada")

interface MilitaryPersonnel {
  id: string
  name: string
  rank: string
}

interface ClavicularioKey {
  id: string
  room_number: string
  room_name: string
  created_at: string
}

interface ClavicularioHistory {
  id: string
  key_id: string
  key_name: string
  military_id: string
  military_name: string
  military_rank: string
  action: "Retirada" | "Devolvida"
  action_at: string
  notes?: string
}

export function KeyManagement() {
  const { toast } = useToast()
  
  // Estados para o formulário
  const [selectedKey, setSelectedKey] = useState("")
  const [selectedMilitary, setSelectedMilitary] = useState("")
  const [action, setAction] = useState<"Retirada" | "Devolvida">("Retirada")
  const [notes, setNotes] = useState("")
  
  // Estados para os dados
  const [keys, setKeys] = useState<ClavicularioKey[]>([])
  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnel[]>([])
  const [history, setHistory] = useState<ClavicularioHistory[]>([])
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    // Teste de conexão com Supabase
    console.log("🔧 Testando conexão com Supabase...")
    
    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from("claviculario_keys").select("count").limit(1)
        if (error) {
          console.error("❌ Erro de conexão:", error)
        } else {
          console.log("✅ Conexão com Supabase funcionando!")
        }
      } catch (err) {
        console.error("❌ Erro ao testar conexão:", err)
      }
    }
    
    testConnection()
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      console.log("🔍 Iniciando carregamento de dados do claviculário...")
      
      // Buscar chaves
      console.log("📋 Buscando chaves...")
      const { data: keysData, error: keysError } = await supabase
        .from("claviculario_keys")
        .select("*")
        .order("room_name")
        .limit(100) // Limitar para debug
      
      if (keysError) {
        console.error("❌ Erro ao buscar chaves:", keysError)
        throw new Error(`Erro ao buscar chaves: ${keysError.message}`)
      }
      
      console.log("✅ Chaves carregadas:", keysData?.length || 0)
      console.log("📋 Dados das chaves:", keysData)
      
      // Verificar se há dados
      if (keysData && keysData.length > 0) {
        console.log("🎯 Primeira chave:", keysData[0])
        console.log("🎯 Última chave:", keysData[keysData.length - 1])
      } else {
        console.log("⚠️ Nenhuma chave encontrada na tabela")
        console.log("🔍 Verificando se é problema de permissão...")
      }
      
      setKeys(keysData || [])

      // Buscar militares
      console.log("👥 Buscando militares...")
      const { data: militaryData, error: militaryError } = await supabase
        .from("military_personnel")
        .select("id, name, rank")
        .order("name")
        .limit(100) // Limitar para debug
      
      if (militaryError) {
        console.error("❌ Erro ao buscar militares:", militaryError)
        throw new Error(`Erro ao buscar militares: ${militaryError.message}`)
      }
      
      console.log("✅ Militares carregados:", militaryData?.length || 0)
      console.log("👥 Dados dos militares:", militaryData)
      
      // Verificar se há dados
      if (militaryData && militaryData.length > 0) {
        console.log("🎯 Primeiro militar:", militaryData[0])
        console.log("🎯 Último militar:", militaryData[militaryData.length - 1])
      } else {
        console.log("⚠️ Nenhum militar encontrado na tabela")
      }
      
      setMilitaryPersonnel(militaryData || [])

      // Buscar histórico (opcional - pode não existir ainda)
      console.log("📚 Buscando histórico...")
      try {
        const { data: historyData, error: historyError } = await supabase
          .from("claviculario_movements")
          .select(`
            *,
            claviculario_keys(room_name),
            military_personnel(name, rank)
          `)
          .order("timestamp", { ascending: false })
        
        if (historyError) {
          console.warn("⚠️ Erro ao buscar histórico (pode não existir ainda):", historyError)
          setHistory([])
        } else {
          console.log("✅ Histórico carregado:", historyData?.length || 0)
          
          // Processar dados do histórico
          const processedHistory = (historyData || []).map(record => ({
            id: record.id,
            key_id: record.key_id,
            key_name: record.claviculario_keys?.room_name || "Chave não encontrada",
            military_id: record.military_id,
            military_name: record.military_personnel?.name || "Militar não encontrado",
            military_rank: record.military_personnel?.rank || "",
            action: record.type === "withdrawal" ? "Retirada" : "Devolvida",
            action_at: record.timestamp,
            notes: record.notes || ""
          }))
          
          setHistory(processedHistory)
        }
      } catch (historyError) {
        console.warn("⚠️ Erro ao buscar histórico (tabela pode não existir):", historyError)
        setHistory([])
      }
      
      console.log("🎉 Carregamento de dados concluído com sucesso!")
      
    } catch (error) {
      console.error("❌ Erro ao carregar dados:", error)
      
      // Mostrar erro mais específico
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
      
      toast({
        title: "Erro ao Carregar Dados",
        description: `Falha ao carregar dados do claviculário: ${errorMessage}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedKey || !selectedMilitary) {
      toast({
        title: "Erro",
        description: "Selecione uma chave e um militar",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const selectedKeyData = keys.find(k => k.id === selectedKey)
      const selectedMilitaryData = militaryPersonnel.find(m => m.id === selectedMilitary)
      
      if (!selectedKeyData || !selectedMilitaryData) {
        throw new Error("Dados não encontrados")
      }

      // Por enquanto, permitir retirada e devolução de qualquer chave
      // (o sistema de status pode ser implementado posteriormente)

      // Registrar no histórico
      const { error: historyError } = await supabase
        .from("claviculario_movements")
        .insert({
          key_id: selectedKey,
          military_id: selectedMilitary,
          type: action === "Retirada" ? "withdrawal" : "return",
          timestamp: new Date().toISOString()
        })

      if (historyError) throw historyError

      // Por enquanto, não atualizamos o status da chave
      // (o sistema de status pode ser implementado posteriormente)

      // Recarregar dados
      await fetchData()

      // Limpar formulário
      setSelectedKey("")
      setSelectedMilitary("")
      setAction("Retirada")
      setNotes("")

      toast({
        title: "Sucesso",
        description: `Chave ${action.toLowerCase()} com sucesso`,
      })

    } catch (error) {
      console.error("Erro ao processar ação:", error)
      toast({
        title: "Erro",
        description: "Falha ao processar a ação da chave",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }



  const getActionIcon = (action: string) => {
    return action === "Retirada" ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const filteredKeys = keys.filter(key => {
    const matchesSearch = key.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const filteredHistory = history.filter(record => {
    return record.key_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.military_name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando sistema de chaves...</p>
        </div>
      </div>
    )
  }

  // Logs para debug dos dropdowns
  console.log("🔍 Estado atual dos dados:")
  console.log("📋 Chaves:", keys.length, keys)
  console.log("👥 Militares:", militaryPersonnel.length, militaryPersonnel)
  console.log("📚 Histórico:", history.length, history)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="keys" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="keys">Chaves Disponíveis</TabsTrigger>
          <TabsTrigger value="actions">Retirada/Entrega</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* TAB: Chaves Disponíveis */}
        <TabsContent value="keys" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar por nome da sala ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKeys.map((key) => (
              <Card key={key.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <Key className="w-6 h-6 text-blue-600" />
                      <span className="truncate">{key.room_name}</span>
                    </CardTitle>
                    <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1 font-semibold">
                      {key.room_number}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 font-medium">Número:</span>
                    <span className="text-sm text-blue-600 font-semibold">{key.room_number}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Cadastrada em: {format(new Date(key.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: Retirada/Entrega */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nova Transação de Chave
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Seleção da Chave */}
                  <div>
                    <Label htmlFor="key">Chave *</Label>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma chave" />
                      </SelectTrigger>
                      <SelectContent>
                        {keys.length > 0 ? (
                          <>
                            <div className="p-2">
                              <Input
                                placeholder="🔍 Pesquisar chave..."
                                className="h-8"
                                onChange={(e) => {
                                  const searchTerm = e.target.value.toLowerCase()
                                  const filteredKeys = keys.filter(key => 
                                    key.room_name.toLowerCase().includes(searchTerm) ||
                                    key.room_number.toLowerCase().includes(searchTerm)
                                  )
                                  // Atualizar a lista filtrada
                                  const selectContent = e.target.closest('.select-content')
                                  if (selectContent) {
                                    const items = selectContent.querySelectorAll('[data-value]')
                                    items.forEach((item: any) => {
                                      const keyId = item.getAttribute('data-value')
                                      const key = keys.find(k => k.id === keyId)
                                      if (key) {
                                        const matches = key.room_name.toLowerCase().includes(searchTerm) ||
                                                     key.room_number.toLowerCase().includes(searchTerm)
                                        item.style.display = matches ? 'block' : 'none'
                                      }
                                    })
                                  }
                                }}
                              />
                            </div>
                            {keys
                              .sort((a, b) => {
                                // Extrair números para ordenação numérica
                                const numA = parseInt(a.room_number.replace(/\D/g, '')) || 0
                                const numB = parseInt(b.room_number.replace(/\D/g, '')) || 0
                                return numA - numB
                              })
                              .map((key) => (
                                <SelectItem key={key.id} value={key.id}>
                                  <div className="flex items-center gap-2">
                                    <span>{key.room_name}</span>
                                    <span className="text-blue-600 font-semibold">({key.room_number})</span>
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </>
                        ) : (
                          <SelectItem value="" disabled>
                            Nenhuma chave disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Seleção do Militar */}
                  <div>
                    <Label htmlFor="military">Militar *</Label>
                    <Select value={selectedMilitary} onValueChange={setSelectedMilitary}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um militar" />
                      </SelectTrigger>
                      <SelectContent>
                        {militaryPersonnel.length > 0 ? (
                          <>
                            <div className="p-2">
                              <Input
                                placeholder="🔍 Pesquisar militar..."
                                className="h-8"
                                onChange={(e) => {
                                  const searchTerm = e.target.value.toLowerCase()
                                  // Atualizar a lista filtrada
                                  const selectContent = e.target.closest('.select-content')
                                  if (selectContent) {
                                    const items = selectContent.querySelectorAll('[data-value]')
                                    items.forEach((item: any) => {
                                      const militaryId = item.getAttribute('data-value')
                                      const military = militaryPersonnel.find(m => m.id === militaryId)
                                      if (military) {
                                        const matches = military.rank.toLowerCase().includes(searchTerm) ||
                                                     military.name.toLowerCase().includes(searchTerm)
                                        item.style.display = matches ? 'block' : 'none'
                                      }
                                    })
                                  }
                                }}
                              />
                            </div>
                            {militaryPersonnel
                              .sort((a, b) => {
                                // Ordenação exata como na página de presença
                                const order = [
                                  "TC", "MJ", "CP", "1T", "2T", "SO", "1S", "2S", "3S", "S1", "S2"
                                ]
                                
                                const rankA = order.indexOf(a.rank)
                                const rankB = order.indexOf(b.rank)
                                
                                if (rankA !== rankB) {
                                  return rankA - rankB
                                }
                                
                                // Se mesmo posto, ordenar por nome
                                return a.name.localeCompare(b.name)
                              })
                              .map((military) => (
                                <SelectItem key={military.id} value={military.id}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{military.rank}</span>
                                    <span>{military.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                            }
                          </>
                        ) : (
                          <SelectItem value="" disabled>
                            Nenhum militar disponível
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tipo de Ação */}
                <div>
                  <Label htmlFor="action">Tipo de Ação *</Label>
                  <Select value={action} onValueChange={(value: "Retirada" | "Devolvida") => setAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retirada">Retirada de Chave</SelectItem>
                      <SelectItem value="Devolvida">Devolução de Chave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Observações */}
                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite observações sobre a retirada ou devolução..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Botões */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isSubmitting ? "Processando..." : "Confirmar Ação"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setSelectedKey("")
                      setSelectedMilitary("")
                      setAction("Retirada")
                      setNotes("")
                    }}
                  >
                    <X className="w-4 h-4" />
                    Limpar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: Histórico */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Buscar por chave ou militar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Histórico de Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Chave</TableHead>
                      <TableHead>Militar</TableHead>
                      <TableHead>Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {format(new Date(record.action_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(record.action)}
                            <Badge variant={record.action === "Retirada" ? "destructive" : "default"}>
                              {record.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{record.key_name}</TableCell>
                        <TableCell>{record.military_rank} {record.military_name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {record.notes || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {filteredHistory.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
