"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { format, isBefore, isSameDay, setHours, setMinutes, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  PlusCircle, 
  Trash2, 
  BellRing, 
  Info, 
  Pencil, 
  Calendar as CalendarIcon,
  Clock,
  User,
  Save,
  Eye
} from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { DatePicker } from "./date-picker"
import { militaryPersonnel } from "@/lib/static-data"
import type { Event } from "@/lib/types"
import { supabase } from "@/lib/supabase"

// Tipo específico para eventos militares
type MilitaryEvent = {
  id: string
  title: string
  description?: string
  date: Date
  time?: string
  createdByMilitaryId?: string
  created_at?: string
  updated_at?: string
}

function EventCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<MilitaryEvent[]>([])
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("")
  const [createdByMilitaryId, setCreatedByMilitaryId] = useState<string>("none")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<MilitaryEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const notifiedEvents = useRef<Set<string>>(new Set())

  // Buscar eventos
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("military_events")
        .select("*")
        .order("date", { ascending: true })
        .order("time", { ascending: true })

      if (error) {
        console.error("Erro ao buscar eventos:", error)
        toast({ 
          title: "Erro", 
          description: "Não foi possível carregar os eventos.", 
          variant: "destructive" 
        })
      } else {
        const eventsData = data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || undefined,
          date: parseISO(e.date),
          time: e.time || undefined,
          createdByMilitaryId: e.created_by_military_id || undefined,
        })) as MilitaryEvent[]
        
        setEvents(eventsData)
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao carregar eventos.", 
        variant: "destructive" 
      })
    }
    setLoading(false)
  }, [toast])

  // Resetar formulário
  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedDate(new Date())
    setTime("")
    setCreatedByMilitaryId("none")
    setEditingEvent(null)
  }

  // Salvar evento
  const handleSaveEvent = async () => {
    if (!title || !selectedDate) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha o título e a data do evento.",
        variant: "destructive",
      })
      return
    }

    const eventData = {
      title,
      description: description || null,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: time || null,
      created_by_military_id: createdByMilitaryId === "none" ? null : createdByMilitaryId,
    }

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("military_events")
          .update(eventData)
          .eq("id", editingEvent.id)

        if (error) {
          console.error("Erro ao atualizar evento:", error)
          toast({ 
            title: "Erro", 
            description: "Não foi possível atualizar o evento.", 
            variant: "destructive" 
          })
        } else {
          toast({
            title: "✅ Sucesso!",
            description: "Evento atualizado com sucesso.",
          })
          fetchEvents()
          setIsDialogOpen(false)
          resetForm()
        }
      } else {
        const { error } = await supabase
          .from("military_events")
          .insert([eventData])

        if (error) {
          console.error("Erro ao adicionar evento:", error)
          toast({ 
            title: "Erro", 
            description: "Não foi possível adicionar o evento.", 
            variant: "destructive" 
          })
        } else {
          toast({
            title: "✅ Sucesso!",
            description: "Evento criado com sucesso.",
          })
          fetchEvents()
          setIsDialogOpen(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao salvar evento.", 
        variant: "destructive" 
      })
    }
  }

  // Editar evento
  const handleEditClick = (event: MilitaryEvent) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || "")
    setSelectedDate(event.date)
    setTime(event.time || "")
    setCreatedByMilitaryId(event.createdByMilitaryId || "none")
    setIsDialogOpen(true)
  }

  // Deletar evento
  const handleDeleteEvent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("military_events")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Erro ao remover evento:", error)
        toast({ 
          title: "Erro", 
          description: "Não foi possível remover o evento.", 
          variant: "destructive" 
        })
      } else {
        toast({
          title: "✅ Removido!",
          description: "Evento removido com sucesso.",
        })
        fetchEvents()
      }
    } catch (error) {
      console.error("Erro ao remover evento:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao remover evento.", 
        variant: "destructive" 
      })
    }
  }

  // Obter nome do militar
  const getMilitaryName = (id: string | undefined) => {
    if (!id) return "Não definido"
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  // Eventos ordenados
  const sortedEvents = [...events].sort((a, b) => {
    if (isBefore(a.date, b.date)) return -1
    if (isBefore(b.date, a.date)) return 1
    if (a.time && b.time) return a.time.localeCompare(b.time)
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })

  // Carregar eventos ao inicializar
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold">Total de Eventos</p>
                <p className="text-3xl font-bold text-blue-800">{events.length}</p>
              </div>
              <CalendarIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-semibold">Este Mês</p>
                <p className="text-3xl font-bold text-green-800">
                  {events.filter(e => e.date.getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-semibold">Próximos 7 dias</p>
                <p className="text-3xl font-bold text-purple-800">
                  {events.filter(e => {
                    const diff = e.date.getTime() - new Date().getTime()
                    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
                  }).length}
                </p>
              </div>
              <BellRing className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendário e controles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendário */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
              locale={ptBR}
              showOutsideDays={true}
              weekStartsOn={1}
              fromYear={2020}
              toYear={2030}
            />
          </CardContent>
        </Card>

        {/* Controles */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Gerenciar Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Adicione, edite ou remova eventos importantes do calendário militar.
            </p>
            
            {/* Botão principal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  onClick={resetForm}
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              
              {/* Modal melhorado */}
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <CalendarIcon className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {editingEvent ? "✏️ Editar Evento" : "✨ Novo Evento"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-lg">
                    {editingEvent ? "Modifique os detalhes do evento" : "Crie um novo evento para o calendário"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-6">
                  {/* Título */}
                  <div className="space-y-3">
                    <Label htmlFor="event-title" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Título do Evento *
                    </Label>
                    <Input
                      id="event-title"
                      placeholder="Ex: Reunião de Esquadrão, Treinamento de Voo..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="h-12 text-lg border-2 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Descrição */}
                  <div className="space-y-3">
                    <Label htmlFor="event-description" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Descrição (Opcional)
                    </Label>
                    <Textarea
                      id="event-description"
                      placeholder="Detalhes, local, participantes ou informações relevantes..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px] border-2 focus:border-purple-500 transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Data e Hora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Data *
                      </Label>
                      <div className="border-2 rounded-md p-1 hover:border-green-500 transition-all duration-200">
                        <DatePicker date={selectedDate} setDate={setSelectedDate} />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="event-time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Horário (Opcional)
                      </Label>
                      <Input 
                        id="event-time" 
                        type="time" 
                        value={time} 
                        onChange={(e) => setTime(e.target.value)}
                        className="h-12 text-lg border-2 focus:border-orange-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Responsável */}
                  <div className="space-y-3">
                    <Label htmlFor="created-by" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                      Responsável (Opcional)
                    </Label>
                    <Select value={createdByMilitaryId} onValueChange={setCreatedByMilitaryId}>
                      <SelectTrigger className="h-12 text-lg border-2 focus:border-indigo-500 transition-all duration-200">
                        <SelectValue placeholder="Selecione o militar responsável" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="none">Nenhum responsável</SelectItem>
                        {militaryPersonnel.map((military) => (
                          <SelectItem key={military.id} value={military.id} className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {military.rank.charAt(0)}
                              </div>
                              <span>{military.rank} {military.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preview */}
                  {title && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Prévia do Evento
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Data:</span>
                          <span className="text-blue-700">
                            {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Não selecionada"}
                          </span>
                        </div>
                        {time && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-purple-600" />
                            <span className="font-medium">Horário:</span>
                            <span className="text-purple-700">{time}</span>
                          </div>
                        )}
                                                 {createdByMilitaryId && createdByMilitaryId !== "none" && (
                           <div className="flex items-center gap-2">
                             <User className="h-4 w-4 text-green-600" />
                             <span className="font-medium">Responsável:</span>
                             <span className="text-green-700">{getMilitaryName(createdByMilitaryId)}</span>
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 h-12 border-2 hover:border-gray-400 transition-all duration-200"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSaveEvent}
                    disabled={!title || !selectedDate}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {editingEvent ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Criar Evento
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Lista de eventos */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Próximos Eventos ({sortedEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
                      {sortedEvents.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-foreground text-lg">Nenhum evento registrado</p>
                <p className="text-sm text-muted-foreground">Clique em "Novo Evento" para começar</p>
              </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
                        {event.time && (
                          <Badge variant="outline" className="text-xs">
                            {event.time}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-4 w-4" />
                          {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        {event.createdByMilitaryId && (
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {getMilitaryName(event.createdByMilitaryId)}
                          </div>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2">{event.description}</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(event)}
                        className="hover:bg-accent hover:text-accent-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="hover:bg-destructive/10 hover:text-destructive text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { EventCalendar }
export default EventCalendar
