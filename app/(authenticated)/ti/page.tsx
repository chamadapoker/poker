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
            className="text-xs h-8 px-3 font-medium border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/20"
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
                className="text-xs h-8 px-3 font-medium"
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
        {/* Header Premium */}
        <div className="text-center space-y-6 p-10 bg-gradient-to-br from-white via-blue-50 to-indigo-100 dark:from-gray-800 dark:via-blue-950/30 dark:to-indigo-900/40 rounded-3xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
          {/* Background decorativo com gradiente */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 shadow-lg"></div>
          
          {/* Efeito de brilho sutil no fundo */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <span className="text-5xl">🖥️</span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Sistema de Chamados de TI
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Gerenciamento completo e intuitivo de solicitações de tecnologia da informação
            </p>
            <div className="flex items-center justify-center gap-3 text-sm text-blue-600 dark:text-blue-400 mt-6">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse shadow-lg"></div>
              <span className="font-medium">Sistema ativo e funcionando</span>
            </div>
          </div>
          
          {/* Efeito de brilho no hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-800 dark:via-blue-950/20 dark:to-blue-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative">
              <div className="relative z-10 text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
                  {tickets.filter(t => t.status === "aberto").length}
                </p>
                <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">Chamados Abertos</p>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-yellow-50 to-yellow-100 dark:from-gray-800 dark:via-yellow-950/20 dark:to-yellow-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative">
              <div className="relative z-10 text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-3">
                  {tickets.filter(t => t.status === "em_andamento").length}
                </p>
                <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">Em Andamento</p>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50 to-green-100 dark:from-gray-800 dark:via-green-950/20 dark:to-green-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-green-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative">
              <div className="relative z-10 text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-3">
                  {tickets.filter(t => t.status === "resolvido").length}
                </p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">Resolvidos</p>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-800 dark:via-red-950/20 dark:to-red-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-8 relative">
              <div className="relative z-10 text-center">
                <p className="text-5xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-3">
                  {tickets.filter(t => t.urgency_level === "crítica").length}
                </p>
                <p className="text-lg font-semibold text-red-700 dark:text-red-300">Críticos</p>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-white" />
                  </div>
                  <Input
                    placeholder="🔍 Buscar chamados por título, descrição ou solicitante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-16 h-14 text-base border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:ring-2 focus:ring-blue-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  />
                </div>
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[220px] h-14 border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:ring-2 focus:ring-blue-200/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <SelectValue>
                    {filterStatus === "all" ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg">📊</span>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">Todos os Status</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                          {ticketStatuses.find(s => s.value === filterStatus)?.icon}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{ticketStatuses.find(s => s.value === filterStatus)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-0 shadow-2xl rounded-xl overflow-hidden">
                  <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-lg">📊</span>
                      </div>
                      <span>Todos os Status</span>
                    </div>
                  </SelectItem>
                  {ticketStatuses.map(status => (
                    <SelectItem key={status.value} value={status.value} className="font-medium text-gray-900 dark:text-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                          {status.icon}
                        </div>
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <SelectValue>
                    {filterUrgency === "all" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <span>Todas as Urgências</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${filterUrgency === 'baixa' ? 'bg-green-500' : filterUrgency === 'média' ? 'bg-yellow-500' : filterUrgency === 'alta' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                        <span>{urgencyLevels.find(l => l.value === filterUrgency)?.label}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <span>Todas as Urgências</span>
                    </div>
                  </SelectItem>
                  {urgencyLevels.map(level => (
                    <SelectItem key={level.value} value={level.value} className="font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${level.value === 'baixa' ? 'bg-green-500' : level.value === 'média' ? 'bg-yellow-500' : level.value === 'alta' ? 'bg-orange-500' : 'bg-red-500'}`}></span>
                        <span>{level.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <SelectValue>
                    {filterCategory === "all" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🏷️</span>
                        <span>Todas as Categorias</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">🔧</span>
                        <span>{filterCategory}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                  <SelectItem value="all" className="font-semibold text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏷️</span>
                      <span>Todas as Categorias</span>
                    </div>
                  </SelectItem>
                  {tiCategories.map(category => (
                    <SelectItem key={category} value={category} className="font-medium text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 dark:text-blue-400">🔧</span>
                        <span>{category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-14 px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 rounded-2xl border-0">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    🆕 Novo Chamado
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
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 dark:text-blue-300 text-lg">🔧</span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">{formData.category}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                            {tiCategories.map(category => (
                              <SelectItem key={category} value={category} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 dark:text-blue-300 text-lg">🔧</span>
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">{category}</span>
                                </div>
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
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                                      {militaryPersonnel.find(p => p.name === formData.requester_name)?.rank}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {formData.requester_name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">👤 Selecione um militar</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                            {militaryPersonnel.map(person => (
                              <SelectItem key={person.id} value={person.name} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                    <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">{person.rank}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{person.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{person.rank}</span>
                                  </div>
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
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getUrgencyBgColor(formData.urgency_level)}`}>
                                  <span className={`w-3 h-3 rounded-full ${getUrgencyDotColor(formData.urgency_level)}`}></span>
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {urgencyLevels.find(l => l.value === formData.urgency_level)?.label}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                            {urgencyLevels.map(level => (
                              <SelectItem key={level.value} value={level.value} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    level.value === 'baixa' ? 'bg-green-100 dark:bg-green-900' : 
                                    level.value === 'média' ? 'bg-yellow-100 dark:bg-yellow-900' : 
                                    level.value === 'alta' ? 'bg-orange-100 dark:bg-orange-900' : 
                                    'bg-red-100 dark:bg-red-900'
                                  }`}>
                                    <span className={`w-3 h-3 rounded-full ${
                                      level.value === 'baixa' ? 'bg-green-500' : 
                                      level.value === 'média' ? 'bg-yellow-500' : 
                                      level.value === 'alta' ? 'bg-orange-500' : 
                                      'bg-red-500'
                                    }`}></span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{level.label}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {level.value === 'baixa' ? 'Pode aguardar' : 
                                       level.value === 'média' ? 'Resolução em breve' : 
                                       level.value === 'alta' ? 'Resolução urgente' : 
                                       'Resolução imediata'}
                                    </span>
                                  </div>
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
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <span className="text-green-700 dark:text-green-300 font-bold text-sm">
                                      {availableSAUs.find(s => s.id === formData.assigned_to)?.rank}
                                    </span>
                                  </div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {availableSAUs.find(s => s.id === formData.assigned_to)?.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-500 dark:text-gray-400">👨‍💻 Selecione um SAU</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600">
                            {availableSAUs.map(sau => (
                              <SelectItem key={sau.id} value={sau.id} className="text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-950/20 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                    <span className="text-green-700 dark:text-green-300 font-bold text-sm">{sau.rank}</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 dark:text-white">{sau.name}</span>
                                    <span className="text-xs text-green-600 dark:text-green-400">SAU - Suporte Técnico</span>
                                  </div>
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
                          <Button variant="outline" type="button" className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-950/20">
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
                        className="h-12 px-6 font-medium border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-800"
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
               {/* Header da Coluna com Gradiente */}
               <div className="flex items-center justify-between p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                 {/* Borda decorativa colorida baseada no status */}
                 <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                   status.value === 'aberto' ? 'from-blue-500 to-blue-600' :
                   status.value === 'em_andamento' ? 'from-yellow-500 to-yellow-600' :
                   status.value === 'resolvido' ? 'from-green-500 to-green-600' :
                   'from-gray-500 to-gray-600'
                 }`}></div>
                 
                 {/* Efeito de brilho sutil */}
                 <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                 
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-4 relative z-10">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                     status.value === 'aberto' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                     status.value === 'em_andamento' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                     status.value === 'resolvido' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                     'bg-gradient-to-br from-gray-400 to-gray-600'
                   } text-white`}>
                     {status.icon}
                   </div>
                   <span className="bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                     {status.label}
                   </span>
                 </h3>
                 
                 <Badge className={`${status.color} text-sm font-bold px-4 py-2 rounded-full shadow-lg border-0 relative z-10`}>
                   📊 {getTicketsByStatus(status.value as Ticket["status"]).length}
                 </Badge>
                 
                 {/* Efeito de brilho no hover */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
               </div>

               {/* Área de Drop com Design Premium */}
               <div className="min-h-[400px] p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                 {/* Background decorativo */}
                 <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-50/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
                 
                 {/* Borda interna sutil */}
                 <div className="absolute inset-2 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl opacity-50"></div>
                 
                 <div className="space-y-4 relative z-10">
                   {getTicketsByStatus(status.value as Ticket["status"]).map(ticket => (
                     <div key={ticket.id} className="space-y-4">
                       <TicketCard ticket={ticket} onStatusUpdate={updateTicketStatus} />
                     </div>
                   ))}
                 </div>
                 
                 {getTicketsByStatus(status.value as Ticket["status"]).length === 0 && (
                   <div className="text-center text-gray-500 dark:text-gray-400 py-16 relative z-10">
                     <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                       <span className="text-3xl">📋</span>
                     </div>
                     <p className="text-base font-medium text-gray-600 dark:text-gray-300">Nenhum chamado</p>
                     <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Use os botões para mover chamados</p>
                   </div>
                 )}
                 
                 {/* Efeito de brilho no hover */}
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000"></div>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  )
}
