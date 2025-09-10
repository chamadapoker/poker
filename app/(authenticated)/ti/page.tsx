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
import { Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Plus, Search, Filter, Download, Upload, Bell, Edit3, Save, X, User, Tag, MessageSquare } from "lucide-react"
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

// Tipo para operações de update na tabela ti_tickets
interface TicketUpdate {
  title?: string
  description?: string
  requester_name?: string
  urgency_level?: "baixa" | "média" | "alta" | "crítica"
  category?: string
  notes?: string
  updated_at?: string
  status?: "aberto" | "em_andamento" | "resolvido" | "fechado"
  assigned_to?: string
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

const getUrgencyBgColor = (urgency: string) => {
  switch (urgency) {
    case 'baixa': return 'bg-green-100 dark:bg-green-900'
    case 'média': return 'bg-yellow-100 dark:bg-yellow-900'
    case 'alta': return 'bg-orange-100 dark:bg-orange-900'
    case 'crítica': return 'bg-red-100 dark:bg-red-900'
    default: return 'bg-gray-100 dark:bg-gray-900'
  }
}

const getUrgencyDotColor = (urgency: string) => {
  switch (urgency) {
    case 'baixa': return 'bg-green-500'
    case 'média': return 'bg-yellow-500'
    case 'alta': return 'bg-orange-500'
    case 'crítica': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
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

// Componente de Card Melhorado com Magic UI
function TicketCard({ ticket, onStatusUpdate }: { ticket: Ticket; onStatusUpdate: (ticketId: string, newStatus: Ticket["status"]) => void }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<{
    title: string
    description: string
    requester_name: string
    urgency_level: "baixa" | "média" | "alta" | "crítica"
    category: string
    notes: string
  }>({
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
      const updateData: TicketUpdate = {
        title: editData.title,
        description: editData.description,
        requester_name: editData.requester_name,
        urgency_level: editData.urgency_level,
        category: editData.category,
        notes: editData.notes,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from("ti_tickets")
        .update(updateData)
        .eq("id", ticket.id)

      if (error) {
        console.error("Erro ao atualizar:", error)
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
        // Recarregar os dados sem recarregar a página
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
      <Card className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/20 dark:to-indigo-950/20"></div>
        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <Input
              value={editData.title}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="font-semibold text-gray-900 dark:text-white border-2 border-blue-300 focus:border-blue-500"
            />
            <Select value={editData.urgency_level} onValueChange={(value: any) => setEditData(prev => ({ ...prev, urgency_level: value }))}>
              <SelectTrigger className="w-36 border-2 border-blue-300 focus:border-blue-500">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${getUrgencyDotColor(editData.urgency_level)}`}></span>
                    <span className="font-medium">{urgencyLevels.find(l => l.value === editData.urgency_level)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level.value} value={level.value} className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${getUrgencyDotColor(level.value)}`}></span>
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Textarea
            value={editData.description}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            className="text-sm text-gray-600 dark:text-gray-400 border-2 border-blue-300 focus:border-blue-500"
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Solicitante:</Label>
              <Select value={editData.requester_name} onValueChange={(value) => setEditData(prev => ({ ...prev, requester_name: value }))}>
                <SelectTrigger className="w-full border-2 border-blue-300 focus:border-blue-500">
                  <SelectValue>
                    {editData.requester_name ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">
                          {militaryPersonnel.find(p => p.name === editData.requester_name)?.rank}
                        </span>
                        <span className="font-medium">{editData.requester_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Selecione um militar</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {militaryPersonnel.map(person => (
                    <SelectItem key={person.id} value={person.name} className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-600">{person.rank}</span>
                        <span>{person.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Categoria:</Label>
              <Select value={editData.category} onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="w-full border-2 border-blue-300 focus:border-blue-500">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 dark:text-blue-400">🔧</span>
                      <span className="font-medium">{editData.category}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tiCategories.map(category => (
                    <SelectItem key={category} value={category} className="font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">🔧</span>
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Observações:</Label>
            <Textarea
              value={editData.notes}
              onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
              className="text-xs border-2 border-blue-300 focus:border-blue-500"
              rows={2}
              placeholder="Adicione observações..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 font-medium">
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel} className="font-medium">
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] dark:border-gray-800 dark:bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/20 dark:to-indigo-950/20"></div>
      
      <div className="relative space-y-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-2 text-base leading-tight">
              {ticket.title}
            </h4>
          </div>
          <Badge className={`${getUrgencyColor(ticket.urgency_level)} font-semibold text-xs px-3 py-1 rounded-full shadow-sm`}>
            {ticket.urgency_level.toUpperCase()}
          </Badge>
        </div>

        {/* Descrição */}
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed">
          {ticket.description}
        </p>

                 {/* Informações do Solicitante e Categoria */}
         <div className="flex flex-col gap-3">
           <div className="flex items-center gap-3">
             <Avatar className="h-8 w-8 ring-2 ring-blue-100 dark:ring-blue-900">
               <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-sm dark:bg-blue-900 dark:text-blue-300">
                 {ticket.requester_name.charAt(0).toUpperCase()}
               </AvatarFallback>
             </Avatar>
             <div className="flex flex-col">
               <span className="text-sm font-medium text-gray-900 dark:text-white">{ticket.requester_name}</span>
               <span className="text-xs text-gray-500 dark:text-gray-400">Solicitante</span>
             </div>
           </div>
           
           <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 px-3 py-2 rounded-lg w-fit">
             <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
             <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm truncate">{ticket.category}</span>
           </div>
         </div>

        {/* Prazo */}
        {ticket.deadline && (
          <div className={`flex items-center gap-2 p-3 rounded-lg border ${
            isOverdue(ticket.deadline) 
              ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800' 
              : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
          }`}>
            <Calendar className={`h-4 w-4 ${
              isOverdue(ticket.deadline) ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              isOverdue(ticket.deadline) ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {isOverdue(ticket.deadline) ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  ATRASADO
                </span>
              ) : (
                <span>{getDaysUntilDeadline(ticket.deadline)} dias restantes</span>
              )}
            </span>
          </div>
        )}

        {/* Imagens */}
        {ticket.images && ticket.images.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-3 py-2 rounded-lg">
            <Upload className="h-4 w-4" />
            <span className="font-medium">{ticket.images.length} imagem(ns) anexada(s)</span>
          </div>
        )}

        {/* Observações */}
        {ticket.notes && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-yellow-800 dark:text-yellow-200">Observações:</span>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">{ticket.notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Data de Criação */}
        <div className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-3">
          Criado em {format(new Date(ticket.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="text-xs h-8 px-3 font-medium border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-500"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
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
                className="text-xs h-8 px-3 font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500"
              >
                <span className="hidden sm:inline">Mover para {targetStatus.label}</span>
                <span className="sm:hidden">{targetStatus.label.split(' ')[0]}</span>
              </Button>
            ))}
        </div>
      </div>
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
        .order("created_at", { ascending: false }) as any

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
        .insert([newTicket] as any)

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
        .single() as any
      
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
        .update(updateData as TicketUpdate)
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
        {/* Header padronizado */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Sistema de Chamados de TI
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerenciamento completo e intuitivo de solicitações de tecnologia da informação
          </p>
        </div>

                 {/* Estatísticas Simples */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           <Card className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
             <CardContent className="p-4 text-center">
               <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                 {tickets.filter(t => t.status === "aberto").length}
               </p>
               <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Abertos</p>
             </CardContent>
           </Card>

           <Card className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
             <CardContent className="p-4 text-center">
               <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                 {tickets.filter(t => t.status === "em_andamento").length}
               </p>
               <p className="text-xs font-medium text-yellow-700 dark:text-yellow-300">Em Andamento</p>
             </CardContent>
           </Card>

           <Card className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
             <CardContent className="p-4 text-center">
               <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                 {tickets.filter(t => t.status === "resolvido").length}
               </p>
               <p className="text-xs font-medium text-green-700 dark:text-green-300">Resolvidos</p>
             </CardContent>
           </Card>

           <Card className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
             <CardContent className="p-4 text-center">
               <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                 {tickets.filter(t => t.urgency_level === "crítica").length}
               </p>
               <p className="text-xs font-medium text-red-700 dark:text-red-300">Críticos</p>
             </CardContent>
           </Card>
         </div>

        {/* Filtros e Busca Premium */}
        <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
          {/* Background decorativo com gradiente */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg"></div>
          
          <CardContent className="p-8 relative">
            <div className="flex flex-col sm:flex-row gap-6">
                             <div className="flex-1">
                 <div className="relative">
                   <Input
                     placeholder="Buscar chamados por título, descrição ou solicitante..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                   />
                 </div>
               </div>

                              <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[220px] h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg">
                    <SelectValue>
                      {filterStatus === "all" ? (
                        <span>Todos os Status</span>
                      ) : (
                        <span>{ticketStatuses.find(s => s.value === filterStatus)?.label}</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <span>Todos os Status</span>
                    </SelectItem>
                    {ticketStatuses.map(status => (
                      <SelectItem key={status.value} value={status.value} className="font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <span>{status.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue>
                      {filterUrgency === "all" ? (
                        <span>Todas as Urgências</span>
                      ) : (
                        <span>{urgencyLevels.find(l => l.value === filterUrgency)?.label}</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <span>Todas as Urgências</span>
                    </SelectItem>
                    {urgencyLevels.map(level => (
                      <SelectItem key={level.value} value={level.value} className="font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <span>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                              <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue>
                      {filterCategory === "all" ? (
                        <span>Todas as Categorias</span>
                      ) : (
                        <span>{filterCategory}</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                    <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <span>Todas as Categorias</span>
                    </SelectItem>
                    {tiCategories.map(category => (
                      <SelectItem key={category} value={category} className="font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                        <span>{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                  <DialogTrigger asChild>
                    <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 rounded-lg">
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Chamado
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader className="pb-4 border-b border-gray-200 dark:border-gray-700">
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      Criar Novo Chamado de TI
                    </DialogTitle>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Preencha os campos abaixo para criar um novo chamado de suporte técnico
                    </p>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Título do Chamado *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="🔍 Descreva brevemente o problema"
                          className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Categoria *</Label>
                                                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <SelectValue>
                                <span className="font-semibold text-gray-900 dark:text-white">{formData.category}</span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                              {tiCategories.map(category => (
                                <SelectItem key={category} value={category} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                  <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Descrição Detalhada *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="📝 Descreva detalhadamente o problema, incluindo passos para reproduzir, mensagens de erro, etc."
                        rows={4}
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="requester_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nome do Solicitante *</Label>
                                                  <Select value={formData.requester_name} onValueChange={(value) => setFormData(prev => ({ ...prev, requester_name: value }))}>
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <SelectValue>
                                {formData.requester_name ? (
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {formData.requester_name}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">Selecione um militar</span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                              {militaryPersonnel.map(person => (
                                <SelectItem key={person.id} value={person.name} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{person.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{person.rank}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="urgency_level" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Nível de Urgência *</Label>
                                                  <Select value={formData.urgency_level} onValueChange={(value: any) => setFormData(prev => ({ ...prev, urgency_level: value }))}>
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <SelectValue>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {urgencyLevels.find(l => l.value === formData.urgency_level)?.label}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                              {urgencyLevels.map(level => (
                                <SelectItem key={level.value} value={level.value} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{level.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {level.value === 'baixa' ? 'Pode aguardar' : 
                                       level.value === 'média' ? 'Resolução em breve' : 
                                       level.value === 'alta' ? 'Resolução urgente' : 
                                       'Resolução imediata'}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>


                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="deadline" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Prazo (Opcional)</Label>
                        <Input
                          id="deadline"
                          type="datetime-local"
                          value={formData.deadline}
                          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                          className="h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                          placeholder={formData.deadline ? "" : "Selecione data e hora"}
                        />
                      </div>

                      <div>
                        <Label htmlFor="assigned_to" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Atribuir para</Label>
                                                  <Select value={formData.assigned_to} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to: value }))}>
                            <SelectTrigger className="h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                              <SelectValue>
                                {formData.assigned_to ? (
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {availableSAUs.find(s => s.id === formData.assigned_to)?.name}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-gray-400">Selecione um SAU</span>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                              {availableSAUs.map(sau => (
                                <SelectItem key={sau.id} value={sau.id} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{sau.name}</span>
                                    <span className="text-xs text-green-600 dark:text-green-400">SAU - Suporte Técnico</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Observações Adicionais</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="💬 Informações adicionais, contexto, etc."
                        rows={3}
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-base"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">📸 Imagens/Prints (Opcional)</Label>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center bg-gray-50 dark:bg-gray-800 hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
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
                          <Button variant="outline" type="button" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/30 dark:hover:border-blue-500">
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Imagens
                          </Button>
                        </Label>
                      </div>
                      
                      {formData.images.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">🖼️ Imagens selecionadas ({formData.images.length}):</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {formData.images.map((image, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`Preview ${index + 1}`}
                                  className="h-24 w-full object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors"
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full shadow-lg hover:scale-110 transition-transform"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                                  {image.name.length > 20 ? image.name.substring(0, 20) + '...' : image.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        className="h-12 px-6 font-medium border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:bg-gray-800"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleCreateTicket}
                        disabled={isLoading}
                        className="h-12 px-6 font-medium bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Criando...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Chamado
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

                                {/* Sistema KANBAN Premium */}
         <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {ticketStatuses.map(status => (
             <div key={status.value} className="space-y-6">
                               {/* Header da Coluna Simples */}
                <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      status.value === 'aberto' ? 'bg-blue-500' :
                      status.value === 'em_andamento' ? 'bg-yellow-500' :
                      status.value === 'resolvido' ? 'bg-green-500' :
                      'bg-gray-500'
                    } text-white`}>
                      {status.icon}
                    </div>
                    <span>{status.label}</span>
                  </h3>
                  
                  <Badge className={`${status.color} text-sm font-medium px-3 py-1 rounded-full`}>
                    {getTicketsByStatus(status.value as Ticket["status"]).length}
                  </Badge>
                </div>

                               {/* Área de Drop Simples */}
                <div className="min-h-[400px] p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {getTicketsByStatus(status.value as Ticket["status"]).map(ticket => (
                      <div key={ticket.id}>
                        <TicketCard ticket={ticket} onStatusUpdate={updateTicketStatus} />
                      </div>
                    ))}
                  </div>
                  
                  {getTicketsByStatus(status.value as Ticket["status"]).length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Nenhum chamado</p>
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
