"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Plus, Search, Filter, Download, Upload, Bell } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { format, addDays, isAfter, isBefore, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { militaryPersonnel } from "@/lib/static-data"


// Tipos para os chamados de TI
interface Ticket {
  id: string
  title: string
  description: string
  requester_name: string
  urgency_level: "baixa" | "média" | "alta" | "crítica"
  status: "aberto" | "em_andamento" | "resolvido" | "fechado"
  assigned_to: string
  category: string
  deadline: string
  created_at: string
  updated_at: string
  images?: string[]
  notes?: string
  resolution?: string
  closed_at?: string
}

// Categorias de TI
const tiCategories = [
  "Hardware",
  "Software",
  "Rede/Internet",
  "Impressora",
  "Email",
  "Sistema",
  "Outros"
]

// Níveis de urgência
const urgencyLevels = [
  { value: "baixa", label: "Baixa", color: "bg-green-100 text-green-800" },
  { value: "média", label: "Média", color: "bg-yellow-100 text-yellow-800" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-800" },
  { value: "crítica", label: "Crítica", color: "bg-red-100 text-red-800" }
]

// Status dos chamados
const ticketStatuses = [
  { value: "aberto", label: "Aberto", color: "bg-blue-100 text-blue-800", icon: <Plus className="h-4 w-4" /> },
  { value: "em_andamento", label: "Em Andamento", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
  { value: "resolvido", label: "Resolvido", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
  { value: "fechado", label: "Fechado", color: "bg-gray-100 text-gray-800", icon: <XCircle className="h-4 w-4" /> }
]

// SAUs disponíveis
const availableSAUs = [
  { id: "3s-hoehr", name: "3S HÖEHR", rank: "3S" },
  { id: "3s-vilela", name: "3S VILELA", rank: "3S" }
]

// Funções auxiliares
const getUrgencyColor = (urgency: string) => {
  const level = urgencyLevels.find(l => l.value === urgency)
  return level?.color || "bg-gray-100 text-gray-800"
}

const getStatusColor = (status: string) => {
  const statusInfo = ticketStatuses.find(s => s.value === status)
  return statusInfo?.color || "bg-gray-100 text-gray-800"
}

const isOverdue = (deadline: string) => {
  if (!deadline) return false
  return isAfter(startOfDay(new Date()), new Date(deadline))
}

const getDaysUntilDeadline = (deadline: string) => {
  if (!deadline) return null
  const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  return days
}

// Componente de Card Simples
function TicketCard({ ticket, onStatusUpdate }: { ticket: Ticket; onStatusUpdate: (ticketId: string, newStatus: Ticket["status"]) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    title: ticket.title,
    description: ticket.description,
    requester_name: ticket.requester_name,
    urgency_level: ticket.urgency_level,
    category: ticket.category,
    notes: ticket.notes || ""
  })

  const handleSave = async () => {
    if (!editData.title || !editData.description || !editData.requester_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from("ti_tickets")
        .update({
          title: editData.title,
          description: editData.description,
          requester_name: editData.requester_name,
          urgency_level: editData.urgency_level,
          category: editData.category,
          notes: editData.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", ticket.id)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o chamado.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sucesso!",
          description: "Chamado atualizado com sucesso.",
        })
        setIsEditing(false)
        // Recarregar a página para atualizar os dados
        window.location.reload()
      }
    } catch (error) {
      console.error("Erro ao atualizar:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditData({
      title: ticket.title,
      description: ticket.description,
      requester_name: ticket.requester_name,
      urgency_level: ticket.urgency_level,
      category: ticket.category,
      notes: ticket.notes || ""
    })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <Card className="hover:shadow-md transition-shadow border-2 border-blue-300">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Input
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="font-medium text-gray-900 dark:text-white"
              />
              <Select value={editData.urgency_level} onValueChange={(value: any) => setEditData(prev => ({ ...prev, urgency_level: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              value={editData.description}
              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
              className="text-sm text-gray-600 dark:text-gray-400"
              rows={3}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Solicitante:</Label>
                <Select value={editData.requester_name} onValueChange={(value) => setEditData(prev => ({ ...prev, requester_name: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um militar" />
                  </SelectTrigger>
                  <SelectContent>
                    {militaryPersonnel.map(person => (
                      <SelectItem key={person.id} value={person.name}>
                        {person.rank} {person.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Categoria:</Label>
                <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tiCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium">Observações:</Label>
              <Textarea
                value={editData.notes}
                onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                className="text-xs"
                rows={2}
                placeholder="Adicione observações..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm sm:text-base">
              {ticket.title}
            </h4>
            <Badge className={getUrgencyColor(ticket.urgency_level) + " text-xs"}>
              {ticket.urgency_level}
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {ticket.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                <AvatarFallback className="text-xs">
                  {ticket.requester_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm text-gray-500">{ticket.requester_name}</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-800 border border-blue-300 dark:border-blue-600 px-2 sm:px-3 py-1 rounded-lg">
              <span className="text-blue-800 dark:text-blue-200 font-bold text-xs">{ticket.category}</span>
            </div>
          </div>

          {ticket.deadline && (
            <div className={`flex items-center gap-1 text-xs ${
              isOverdue(ticket.deadline) ? 'text-red-600' : 'text-gray-500'
            }`}>
              <Calendar className="h-3 w-3" />
              {isOverdue(ticket.deadline) ? (
                <span className="font-medium">ATRASADO</span>
              ) : (
                <span>{getDaysUntilDeadline(ticket.deadline)} dias</span>
              )}
            </div>
          )}

          {ticket.images && ticket.images.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <Upload className="h-3 w-3" />
              {ticket.images.length} imagem(ns)
            </div>
          )}

          {ticket.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Observações:</strong> {ticket.notes}
            </div>
          )}

          <div className="text-xs text-gray-400">
            Criado em {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
          </div>

          {/* Botões de ação dentro do card */}
          <div className="flex flex-wrap gap-1 sm:gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="text-xs h-7 sm:h-8 px-2 sm:px-3"
            >
              ✏️ <span className="hidden sm:inline">Editar</span>
            </Button>
            
            {/* Botões para mudar status */}
            {ticketStatuses
              .filter(s => s.value !== ticket.status)
              .map(targetStatus => (
                <Button
                  key={targetStatus.value}
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(ticket.id, targetStatus.value as Ticket["status"])}
                  className="text-xs h-7 sm:h-8 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Mover para {targetStatus.label}</span>
                  <span className="sm:hidden">{targetStatus.label.split(' ')[0]}</span>
                </Button>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function TIPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterUrgency, setFilterUrgency] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")



  // Estado do formulário de criação
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requester_name: "",
    urgency_level: "média" as const,
    category: "Hardware",
    deadline: "",
    assigned_to: "",
    images: [] as File[],
    notes: ""
  })

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("ti_tickets")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao buscar chamados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os chamados de TI.",
          variant: "destructive",
        })
      } else {
        setTickets(data || [])
      }
    } catch (error) {
      console.error("Erro inesperado:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTicket = async () => {
    if (!formData.title || !formData.description || !formData.requester_name) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      // Upload das imagens se houver
      let imageUrls: string[] = []
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          const fileName = `${Date.now()}-${image.name}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("ti-tickets-images")
            .upload(fileName, image)

          if (uploadError) {
            console.error("Erro no upload:", uploadError)
            continue
          }

          const { data: urlData } = supabase.storage
            .from("ti-tickets-images")
            .getPublicUrl(fileName)

          if (urlData?.publicUrl) {
            imageUrls.push(urlData.publicUrl)
          }
        }
      }

      const newTicket = {
        title: formData.title,
        description: formData.description,
        requester_name: formData.requester_name,
        urgency_level: formData.urgency_level,
        category: formData.category,
        deadline: formData.deadline || null,
        assigned_to: formData.assigned_to || null,
        status: "aberto" as const,
        images: imageUrls,
        notes: formData.notes || null
      }

      const { error } = await supabase
        .from("ti_tickets")
        .insert([newTicket])

      if (error) {
        console.error("Erro ao criar chamado:", error)
        toast({
          title: "Erro",
          description: "Não foi possível criar o chamado.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Sucesso!",
          description: "Chamado de TI criado com sucesso.",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchTickets()
      }
    } catch (error) {
      console.error("Erro inesperado:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requester_name: "",
      urgency_level: "média",
      category: "Hardware",
      deadline: "",
      assigned_to: "",
      images: [],
      notes: ""
    })
  }

  const updateTicketStatus = async (ticketId: string, newStatus: Ticket["status"]) => {
    try {
      console.log("🔄 Atualizando status do chamado:", { ticketId, newStatus })
      
      // Verificar se o chamado existe primeiro
      console.log("🔍 Verificando se o chamado existe...")
      const { data: existingTicket, error: fetchError } = await supabase
        .from("ti_tickets")
        .select("id, status")
        .eq("id", ticketId)
        .single()
      
      if (fetchError) {
        console.error("❌ Erro ao buscar chamado:", fetchError)
        toast({
          title: "Erro",
          description: "Chamado não encontrado.",
          variant: "destructive",
        })
        return
      }
      
      if (!existingTicket) {
        console.error("❌ Chamado não encontrado")
        toast({
          title: "Erro",
          description: "Chamado não encontrado.",
          variant: "destructive",
        })
        return
      }
      
      console.log("✅ Chamado encontrado:", existingTicket)
      
      // Preparar dados para atualização
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      }
      
      // Adicionar closed_at se for resolvido
      if (newStatus === "resolvido") {
        updateData.closed_at = new Date().toISOString()
      }
      
      console.log("📝 Dados para atualização:", updateData)
      
      console.log("🔍 Executando UPDATE no Supabase...")
      
      const { data, error } = await supabase
        .from("ti_tickets")
        .update(updateData)
        .eq("id", ticketId)
        .select()

      console.log("📊 Resposta do Supabase:", { data, error, hasError: !!error })
      
      if (error) {
        console.error("❌ Erro detalhado ao atualizar status:", {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          type: typeof error,
          keys: error ? Object.keys(error) : 'N/A'
        })
        
        toast({
          title: "Erro ao atualizar status",
          description: `Detalhes: ${error.message || "Erro desconhecido"}`,
          variant: "destructive",
        })
      } else {
        console.log("✅ Status atualizado com sucesso:", data)
        toast({
          title: "Status atualizado",
          description: `Chamado movido para ${newStatus}.`,
        })
        fetchTickets()
      }
    } catch (catchError) {
      console.error("💥 Erro inesperado ao atualizar status:", catchError)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao atualizar o status.",
        variant: "destructive",
      })
    }
  }



  const getFilteredTickets = () => {
    let filtered = tickets

    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.requester_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(ticket => ticket.status === filterStatus)
    }

    if (filterUrgency !== "all") {
      filtered = filtered.filter(ticket => ticket.urgency_level === filterUrgency)
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter(ticket => ticket.category === filterCategory)
    }

    return filtered
  }

  const getTicketsByStatus = (status: Ticket["status"]) => {
    return getFilteredTickets().filter(ticket => ticket.status === status)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            🖥️ Sistema de Chamados de TI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gerenciamento completo de solicitações de tecnologia da informação
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Plus className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {tickets.filter(t => t.status === "aberto").length}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Abertos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                    {tickets.filter(t => t.status === "em_andamento").length}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {tickets.filter(t => t.status === "resolvido").length}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                    {tickets.filter(t => t.urgency_level === "crítica").length}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">Críticos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar chamados..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  {ticketStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Urgências</SelectItem>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {tiCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Chamado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>🆕 Criar Novo Chamado de TI</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Título do Chamado *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Descreva brevemente o problema"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Categoria *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            <SelectValue className="text-gray-900 dark:text-white" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            {tiCategories.map(category => (
                              <SelectItem key={category} value={category} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Descrição Detalhada *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Descreva detalhadamente o problema, incluindo passos para reproduzir, mensagens de erro, etc."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="requester_name">Nome do Solicitante *</Label>
                        <Select value={formData.requester_name} onValueChange={(value) => setFormData(prev => ({ ...prev, requester_name: value }))}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            <SelectValue placeholder="Selecione um militar" className="text-gray-900 dark:text-white" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            {militaryPersonnel.map(person => (
                              <SelectItem key={person.id} value={person.name} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                {person.rank} {person.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urgency_level">Nível de Urgência *</Label>
                        <Select value={formData.urgency_level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency_level: value }))}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            <SelectValue className="text-gray-900 dark:text-white" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            {urgencyLevels.map(level => (
                              <SelectItem key={level.value} value={level.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>


                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline">Prazo (Opcional)</Label>
                        <Input
                          id="deadline"
                          type="datetime-local"
                          value={formData.deadline}
                          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="assigned_to">Atribuir para</Label>
                        <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                            <SelectValue placeholder="Selecione um SAU" className="text-gray-900 dark:text-white" />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            {availableSAUs.map(sau => (
                              <SelectItem key={sau.id} value={sau.id} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                                {sau.rank} {sau.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Observações Adicionais</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Informações adicionais, contexto, etc."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Imagens/Prints (Opcional)</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Arraste e solte imagens aqui ou clique para selecionar
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Label htmlFor="image-upload" className="cursor-pointer">
                          <Button variant="outline" type="button">
                            Selecionar Imagens
                          </Button>
                        </Label>
                      </div>
                      
                      {formData.images.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm font-medium">Imagens selecionadas:</p>
                          <div className="flex flex-wrap gap-2">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="h-20 w-20 object-cover rounded border"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                  onClick={() => removeImage(index)}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateTicket}
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? "Criando..." : "Criar Chamado"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

                                {/* Sistema KANBAN Simples com Botões */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
           {ticketStatuses.map(status => (
             <div key={status.value} className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                   {status.icon}
                   {status.label}
                 </h3>
                 <Badge className={status.color}>
                   {getTicketsByStatus(status.value as Ticket["status"]).length}
                 </Badge>
               </div>

               <div className="min-h-[200px] p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                 <div className="space-y-3">
                   {getTicketsByStatus(status.value as Ticket["status"]).map(ticket => (
                     <div key={ticket.id} className="space-y-3">
                       <TicketCard ticket={ticket} onStatusUpdate={updateTicketStatus} />
                       
                     </div>
                   ))}
                 </div>
                 
                 {getTicketsByStatus(status.value as Ticket["status"]).length === 0 && (
                   <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                     <p className="text-sm">Nenhum chamado</p>
                     <p className="text-xs">Use os botões para mover chamados</p>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}
