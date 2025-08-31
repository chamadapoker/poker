"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@supabase/supabase-js"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Key, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  History, 
  Plus, 
  Save, 
  X, 
  LogOut,
  LogIn,
  Search,
  Filter
} from "lucide-react"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface MilitaryPersonnel {
  id: string
  name: string
  rank: string
}

interface ClavicularioKey {
  id: string
  room_name: string
  room_number: string
  created_at: string
  status?: "available" | "borrowed" | "maintenance"
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
  notes: string
}

export default function KeyManagement() {
  const { toast } = useToast()
  
  // Estados para os modais
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
  const [selectedKeyForAction, setSelectedKeyForAction] = useState<ClavicularioKey | null>(null)
  
  // Estados para o formulário de retirada
  const [withdrawForm, setWithdrawForm] = useState({
    militaryId: "",
    notes: ""
  })
  
  // Estados para o formulário de devolução
  const [returnForm, setReturnForm] = useState({
    notes: ""
  })
  
  // Estados para os dados
  const [keys, setKeys] = useState<ClavicularioKey[]>([])
  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnel[]>([])
  const [history, setHistory] = useState<ClavicularioHistory[]>([])
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "borrowed" | "maintenance">("all")
  
  // Estados para filtros de histórico
  const [historyFilter, setHistoryFilter] = useState({
    period: 'all' as 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year',
    keyId: 'all' as string,
    militaryId: 'all' as string
  })
  
  // Estados de loading
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      console.log("📋 Iniciando carregamento de dados do claviculário...")
      
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
            claviculario_keys(room_name)
          `)
          .order("timestamp", { ascending: false })
          .limit(100)
        
        if (historyError) {
          console.warn("⚠️ Erro ao buscar histórico (pode não existir ainda):", historyError)
          setHistory([])
        } else {
          console.log("✅ Histórico carregado:", historyData?.length || 0)
          
          // Processar dados do histórico (agora usando as colunas diretas)
          const processedHistory = (historyData || []).map(record => ({
            id: record.id,
            key_id: record.key_id,
            key_name: record.claviculario_keys?.room_name || "Chave não encontrada",
            military_id: record.military_id,
            military_name: record.military_name || "Militar não encontrado",
            military_rank: record.military_rank || "",
            action: (record.type === "RETIRADA" ? "Retirada" : "Devolvida") as "Retirada" | "Devolvida",
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

  // Abrir modal de retirada
  const openWithdrawModal = (key: ClavicularioKey) => {
    setSelectedKeyForAction(key)
    setWithdrawForm({ militaryId: "", notes: "" })
    setIsWithdrawModalOpen(true)
  }

  // Abrir modal de devolução
  const openReturnModal = (key: ClavicularioKey) => {
    setSelectedKeyForAction(key)
    setReturnForm({ notes: "" })
    setIsReturnModalOpen(true)
  }

  // Processar retirada de chave
  const handleWithdraw = async () => {
    if (!selectedKeyForAction || !withdrawForm.militaryId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um militar.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Buscar dados do militar selecionado
      const selectedMilitary = militaryPersonnel.find(m => m.id === withdrawForm.militaryId)
      if (!selectedMilitary) {
        throw new Error("Militar não encontrado")
      }

      // Registrar a retirada no histórico COM NOME E POSTO
      const { error: historyError } = await supabase
        .from("claviculario_movements")
        .insert({
          key_id: selectedKeyForAction.id,
          military_id: withdrawForm.militaryId,
          military_name: selectedMilitary.name,        // ✅ SALVANDO O NOME
          military_rank: selectedMilitary.rank,       // ✅ SALVANDO O POSTO
          type: "RETIRADA",
          timestamp: new Date().toISOString(),
          notes: withdrawForm.notes || null
        })

      if (historyError) {
        console.error("❌ Erro ao salvar retirada:", historyError)
        throw new Error(`Erro ao salvar retirada: ${historyError.message}`)
      }

      toast({
        title: "Sucesso",
        description: `Chave ${selectedKeyForAction.room_name} retirada por ${selectedMilitary.rank} ${selectedMilitary.name}!`,
      })
      
      setIsWithdrawModalOpen(false)
      setSelectedKeyForAction(null)
      setWithdrawForm({ militaryId: "", notes: "" })

      // Recarregar dados
      await fetchData()

    } catch (error: any) {
      console.error("❌ Erro ao processar retirada:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a retirada da chave.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Processar devolução de chave
  const handleReturn = async () => {
    if (!selectedKeyForAction) return

    setIsSubmitting(true)
    try {
      // Buscar a última retirada desta chave para obter o military_id
      const lastWithdrawal = history
        .filter(record => record.key_id === selectedKeyForAction.id && record.action === "Retirada")
        .sort((a, b) => new Date(b.action_at).getTime() - new Date(a.action_at).getTime())[0]

      if (!lastWithdrawal) {
        throw new Error("Não foi possível encontrar a retirada desta chave")
      }

      // Registrar a devolução no histórico COM o military_id da retirada
      const { error: historyError } = await supabase
        .from("claviculario_movements")
        .insert({
          key_id: selectedKeyForAction.id,
          military_id: lastWithdrawal.military_id, // ✅ Usar o military_id da retirada
          military_name: lastWithdrawal.military_name, // ✅ Manter o nome para rastreabilidade
          military_rank: lastWithdrawal.military_rank, // ✅ Manter o posto para rastreabilidade
          type: "DEVOLUCAO",
          timestamp: new Date().toISOString(),
          notes: returnForm.notes || null
        })

      if (historyError) {
        console.error("❌ Erro ao salvar devolução:", historyError)
        throw new Error(`Erro ao salvar devolução: ${historyError.message}`)
      }

      toast({
        title: "Sucesso",
        description: `Chave ${selectedKeyForAction.room_name} devolvida com sucesso!`,
      })
      
      setIsReturnModalOpen(false)
      setSelectedKeyForAction(null)
      setReturnForm({ notes: "" })
      
      // Recarregar dados
      await fetchData()
      
    } catch (error: any) {
      console.error("❌ Erro ao processar devolução:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível processar a devolução da chave.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Obter status da chave (agora inteligente - verifica se foi retirada)
  const getKeyStatus = (keyId: string) => {
    // Verificar se a chave foi retirada (última movimentação)
    const keyMovements = history.filter(record => record.key_id === keyId)
    
    if (keyMovements.length === 0) {
      return "available" // Nunca foi movimentada
    }
    
    // Pegar a última movimentação
    const lastMovement = keyMovements[0] // Já está ordenado por timestamp desc
    
    if (lastMovement.action === "Retirada") {
      return "borrowed" // Foi retirada e não foi devolvida
    } else if (lastMovement.action === "Devolvida") {
      return "available" // Foi devolvida
    }
    
    return "available" // Fallback
  }

  // Obter ícone da ação
  const getActionIcon = (action: string) => {
    switch (action) {
      case "Retirada":
        return <LogOut className="w-4 h-4 text-red-500" />
      case "Devolvida":
        return <LogIn className="w-4 h-4 text-green-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  // Filtrar chaves
  const filteredKeys = keys.filter(key => {
    // Filtro por busca (sala ou número)
    const matchesSearch = searchTerm === "" || 
                          key.room_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.room_number.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Filtro por status
    if (statusFilter === "all") return matchesSearch
    
    const keyStatus = getKeyStatus(key.id)
    const matchesStatus = keyStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Filtrar histórico
  const filteredHistory = history.filter(record => {
    const searchLower = searchTerm.toLowerCase()
    return record.key_name.toLowerCase().includes(searchLower) ||
           record.military_name.toLowerCase().includes(searchLower) ||
           record.military_rank.toLowerCase().includes(searchLower)
  })

  // Obter badge de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default" className="bg-green-100 text-green-800">Disponível</Badge>
      case "borrowed":
        return <Badge variant="destructive">Em uso</Badge>
      case "maintenance":
        return <Badge variant="secondary">Manutenção</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  // Verificar se a chave está disponível para retirada
  const isKeyAvailableForWithdrawal = (key: ClavicularioKey) => {
    return getKeyStatus(key.id) === "available"
  }

  // Verificar se a chave está disponível para devolução
  const isKeyAvailableForReturn = (key: ClavicularioKey) => {
    return getKeyStatus(key.id) === "borrowed"
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do claviculário...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Key className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-800">{keys.length}</p>
                <p className="text-sm text-blue-600">Total de Chaves</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-800">{keys.filter(k => getKeyStatus(k.id) === "available").length}</p>
                <p className="text-sm text-green-600">Disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <LogOut className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-800">{keys.filter(k => getKeyStatus(k.id) === "borrowed").length}</p>
                <p className="text-sm text-red-600">Em Uso</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <History className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-800">{history.length}</p>
                <p className="text-sm text-purple-600">Transações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="keys" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="keys">Gestão de Chaves</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* TAB: Gestão de Chaves */}
        <TabsContent value="keys" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder="🔍 Buscar por sala ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>

            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Status" className="text-gray-900 dark:text-gray-100">
                  {statusFilter === 'all' && 'Todos os Status'}
                  {statusFilter === 'available' && 'Disponíveis'}
                  {statusFilter === 'borrowed' && 'Em Uso'}
                  {statusFilter === 'maintenance' && 'Manutenção'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900">Todos os Status</SelectItem>
                <SelectItem value="available" className="text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900">Disponíveis</SelectItem>
                <SelectItem value="borrowed" className="text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900">Em Uso</SelectItem>
                <SelectItem value="maintenance" className="text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900">Manutenção</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Indicador de resultados filtrados */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Mostrando {filteredKeys.length} de {keys.length} chaves
              {searchTerm && ` para "${searchTerm}"`}
              {statusFilter !== 'all' && ` (${statusFilter === 'available' ? 'Disponíveis' : statusFilter === 'borrowed' ? 'Em Uso' : 'Manutenção'})`}
            </div>
            {(searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>

          {/* Cards das Chaves - SEM histórico, apenas status atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKeys.map((key) => (
              <Card key={key.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-600">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{key.room_name}</h3>
                  </div>
                                             <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Sala {key.room_number || 'N/A'}</p>
                      
                      {/* Status da Chave - Baseado no último movimento */}
                      <div className="mb-4">
                        {(() => {
                          const keyStatus = getKeyStatus(key.id);
                          return (
                  <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                keyStatus === 'available' 
                                  ? 'bg-green-500' 
                                  : 'bg-red-500'
                              }`}></div>
                              <span className={`font-semibold text-sm ${
                                keyStatus === 'available' 
                                  ? 'text-green-700 dark:text-green-400' 
                                  : 'text-red-700 dark:text-red-400'
                              }`}>
                                {keyStatus === 'available' ? 'Disponível' : 'Retirada'}
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                  </div>
                  </div>

                  {/* Botões de Ação - Baseados no status */}
                  <div className="flex gap-2">
                    {getKeyStatus(key.id) === 'available' ? (
                      <Dialog open={isWithdrawModalOpen && selectedKeyForAction?.id === key.id} onOpenChange={setIsWithdrawModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            onClick={() => openWithdrawModal(key)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Retirar
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">Retirar Chave - {key.room_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                  <div>
                              <Label htmlFor="military" className="text-gray-900 dark:text-gray-100 font-medium">Militar *</Label>
                              <Select 
                                value={withdrawForm.militaryId} 
                                onValueChange={(value) => setWithdrawForm(prev => ({ ...prev, militaryId: value }))}
                              >
                                <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100">
                                  <SelectValue placeholder="Selecione um militar" className="text-gray-900 dark:text-gray-100">
                                    {withdrawForm.militaryId ? 
                                      (() => {
                                        const selected = militaryPersonnel.find(m => m.id === withdrawForm.militaryId);
                                        return selected ? `${selected.rank} ${selected.name}` : "Selecione um militar";
                                      })() 
                                      : "Selecione um militar"
                                    }
                                  </SelectValue>
                      </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 max-h-[300px]">
                                  {militaryPersonnel
                                    .sort((a, b) => {
                                      const order = ["TC", "MJ", "CP", "1T", "2T", "SO", "1S", "2S", "3S", "S1", "S2"]
                                      const rankA = order.indexOf(a.rank)
                                      const rankB = order.indexOf(b.name)
                                      if (rankA !== rankB) return rankA - rankB
                                      return a.name.localeCompare(b.name)
                                    })
                                    .map((military) => (
                                      <SelectItem key={military.id} value={military.id} className="hover:bg-blue-100 dark:hover:bg-blue-900 focus:bg-blue-100 dark:focus:bg-blue-900 cursor-pointer text-gray-900 dark:text-gray-100 data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-800 data-[state=checked]:text-gray-900 dark:data-[state=checked]:text-gray-100">
                                        <div className="flex items-center gap-2 py-1">
                                          <span className="font-bold text-gray-900 dark:text-gray-100">{military.rank}</span>
                                          <span className="font-semibold text-gray-800 dark:text-gray-200">{military.name}</span>
                                  </div>
                                </SelectItem>
                              ))
                            }
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                              <Label htmlFor="notes" className="text-gray-900 dark:text-gray-100 font-medium">Observações (opcional)</Label>
                              <Textarea
                                id="notes"
                                value={withdrawForm.notes}
                                onChange={(e) => setWithdrawForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Digite observações sobre a retirada..."
                                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                              />
                            </div>
                             
                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              >
                                Cancelar
                              </Button>
                              <Button 
                                onClick={handleWithdraw}
                                disabled={isSubmitting || !withdrawForm.militaryId}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105 font-medium"
                              >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? "Processando..." : "Confirmar Retirada"}
                              </Button>
                  </div>
                </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Dialog open={isReturnModalOpen && selectedKeyForAction?.id === key.id} onOpenChange={setIsReturnModalOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openReturnModal(key)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 hover:shadow-md transition-all duration-200 font-semibold"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            Devolver
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">Devolver Chave - {key.room_name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                <div>
                              <Label htmlFor="return-notes" className="text-gray-900 dark:text-gray-100 font-medium">Observações (opcional)</Label>
                  <Textarea
                                id="return-notes"
                                value={returnForm.notes}
                                onChange={(e) => setReturnForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Digite observações sobre a devolução..."
                                className="min-h-[100px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                  />
                </div>

                            <div className="flex gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                onClick={() => setIsReturnModalOpen(false)}
                                className="hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-200 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              >
                                Cancelar
                  </Button>
                  <Button 
                                onClick={handleReturn}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                              >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? "Processando..." : "Confirmar Devolução"}
                  </Button>
                </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
            </CardContent>
          </Card>
            ))}
          </div>
               
          {filteredKeys.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma chave encontrada</p>
            </div>
          )}
        </TabsContent>

        {/* TAB: Histórico */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
                placeholder="🔍 Buscar por chave ou militar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
            </div>
          </div>

          <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <History className="w-5 h-5" />
                Histórico de Movimentações
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="text-gray-800 font-bold text-sm">Chave</TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm">Militar</TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm">Ação</TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm">Data/Hora</TableHead>
                      <TableHead className="text-gray-800 font-bold text-sm">Observações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-gray-800 font-semibold">{record.key_name}</div>
                            {/* ID da chave removido para melhorar visualização */}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-700">{record.military_rank}</span>
                              <span className="font-semibold text-gray-900">{record.military_name}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(record.action)}
                            <Badge variant={record.action === "Retirada" ? "destructive" : "default"}>
                              {record.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {format(new Date(record.action_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.notes ? (
                            <div className="max-w-[200px] truncate font-medium text-gray-700" title={record.notes}>
                              {record.notes}
                            </div>
                          ) : (
                            <span className="text-gray-400 font-medium">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum histórico encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
