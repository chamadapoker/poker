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
  const [currentTime, setCurrentTime] = useState(new Date())
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Buscar eventos
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await (supabase as any)
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
        const { error } = await (supabase as any)
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
        const { error } = await (supabase as any)
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
      const { error } = await (supabase as any)
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

  // Função para calcular tempo restante até o evento
  const getTimeUntilEvent = (event: MilitaryEvent) => {
    if (!event.time) return null
    
    const now = new Date()
    const eventDateTime = new Date(event.date)
    const [hours, minutes] = event.time.split(':').map(Number)
    eventDateTime.setHours(hours, minutes, 0, 0)
    
    const diffMs = eventDateTime.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return { diffMs, diffHours, diffMinutes, eventDateTime }
  }

  // Função para verificar se o evento está próximo (1 hora ou menos)
  const isEventNearby = (event: MilitaryEvent) => {
    const timeInfo = getTimeUntilEvent(event)
    if (!timeInfo) return false
    
    return timeInfo.diffMs > 0 && timeInfo.diffMs <= 60 * 60 * 1000 // 1 hora em ms
  }

  // Função para verificar se o evento está muito próximo (15 minutos ou menos)
  const isEventVeryNearby = (event: MilitaryEvent) => {
    const timeInfo = getTimeUntilEvent(event)
    if (!timeInfo) return false
    
    return timeInfo.diffMs > 0 && timeInfo.diffMs <= 15 * 60 * 1000 // 15 minutos em ms
  }

  // Função para tocar som de alerta
  const playAlertSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  // Função para verificar notificações
  const checkNotifications = useCallback(() => {
    const now = new Date()
    setCurrentTime(now)
    
    events.forEach(event => {
      if (event.time && !notifiedEvents.current.has(event.id)) {
        const timeInfo = getTimeUntilEvent(event)
        if (timeInfo && timeInfo.diffMs > 0 && timeInfo.diffMs <= 60 * 60 * 1000) {
          // Evento em 1 hora ou menos
          notifiedEvents.current.add(event.id)
          
          // Mostrar toast de notificação
          toast({
            title: "🔔 Evento Próximo!",
            description: `${event.title} começa em ${timeInfo.diffHours > 0 ? `${timeInfo.diffHours}h` : ''}${timeInfo.diffMinutes > 0 ? `${timeInfo.diffMinutes}min` : ''}`,
            duration: 10000,
          })
          
          // Tocar som se estiver muito próximo
          if (timeInfo.diffMs <= 15 * 60 * 1000) {
            playAlertSound()
          }
        }
      }
    })
  }, [events, toast])

  // Timer para verificar notificações a cada minuto
  useEffect(() => {
    const interval = setInterval(checkNotifications, 60000) // 1 minuto
    return () => clearInterval(interval)
  }, [checkNotifications])

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

  // Eventos para o dia selecionado
  const selectedDateEvents = events.filter(event => 
    date && isSameDay(event.date, date)
  )

  // Função para verificar se um dia tem eventos
  const hasEventsOnDate = (checkDate: Date) => {
    return events.some(event => isSameDay(event.date, checkDate))
  }

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
      {/* Elemento de áudio para notificações */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT" type="audio/wav" />
      </audio>

      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {events.length}
            </p>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Eventos</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {events.filter(e => e.date.getMonth() === new Date().getMonth()).length}
            </p>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Este Mês</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {events.filter(e => {
                const diff = e.date.getTime() - new Date().getTime()
                return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000
              }).length}
            </p>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Próximos 7 dias</p>
          </CardContent>
        </Card>

        {/* Card de eventos próximos */}
        <Card className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {events.filter(e => isEventNearby(e)).length}
            </p>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Eventos Próximos (1h)</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendário e controles */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Calendário */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <div className="w-full max-w-sm">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm"
                locale={ptBR}
                showOutsideDays={true}
                weekStartsOn={1}
                fromYear={2020}
                toYear={2030}
                modifiers={{
                  hasEvent: (date) => hasEventsOnDate(date)
                }}
                modifiersStyles={{
                  hasEvent: { 
                    backgroundColor: "rgb(59 130 246 / 0.1)", 
                    color: "rgb(59 130 246)",
                    fontWeight: "600"
                  }
                }}
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                  day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                  day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_today: "bg-accent text-accent-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                }}
              />
            </div>
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

      {/* Eventos do dia selecionado */}
      {date && selectedDateEvents.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Eventos de {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">{event.title}</h4>
                    {event.time && (
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        <Clock className="inline h-3 w-3 mr-1" />
                        {event.time}
                      </p>
                    )}
                    {event.description && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(event)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de eventos */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b border-blue-200 dark:border-blue-700">
          <CardTitle className="flex items-center gap-3 text-blue-800 dark:text-blue-200 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <BellRing className="h-5 w-5 text-white" />
            </div>
            Próximos Eventos ({sortedEvents.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CalendarIcon className="h-10 w-10 text-slate-600 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Nenhum evento registrado</h3>
              <p className="text-slate-600 dark:text-slate-400">Clique em "Novo Evento" para começar</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedEvents.map((event) => {
                const timeInfo = getTimeUntilEvent(event)
                const isNearby = isEventNearby(event)
                const isVeryNearby = isEventVeryNearby(event)
                
                return (
                  <div 
                    key={event.id} 
                    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
                      isVeryNearby 
                        ? 'border-2 border-red-400 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/30 dark:to-pink-950/30 shadow-xl animate-pulse' 
                        : isNearby 
                        ? 'border-2 border-orange-400 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/30 dark:to-yellow-950/30 shadow-lg' 
                        : 'border-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    {/* Background decorativo */}
                    <div className={`absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500 ${
                      isVeryNearby ? 'bg-red-500' : isNearby ? 'bg-orange-500' : 'bg-blue-500'
                    }`}></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                            
                            {/* Badge de tempo elegante */}
                            {event.time && (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={isVeryNearby ? "destructive" : isNearby ? "secondary" : "outline"} 
                                  className={`px-3 py-1 text-sm font-semibold rounded-full shadow-sm ${
                                    isVeryNearby ? 'animate-pulse bg-red-500 text-white' : 
                                    isNearby ? 'bg-orange-500 text-white' : 
                                    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  }`}
                                >
                                  🕐 {event.time}
                                </Badge>
                                
                                {/* Badge de alerta para eventos próximos */}
                                {isNearby && (
                                  <Badge 
                                    variant="destructive" 
                                    className="px-3 py-1 text-sm font-semibold rounded-full shadow-sm animate-pulse flex items-center gap-2"
                                  >
                                    <BellRing className="h-3 w-3" />
                                    {isVeryNearby ? '🚨 MUITO PRÓXIMO!' : '⚠️ PRÓXIMO!'}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        
                          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400 mb-3">
                            <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              <span className="font-medium">{format(event.date, "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                            {event.createdByMilitaryId && (
                              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="font-medium">{getMilitaryName(event.createdByMilitaryId)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Contador regressivo para eventos próximos */}
                          {isNearby && timeInfo && (
                            <div className="mb-3">
                              <Badge 
                                variant={isVeryNearby ? "destructive" : "secondary"}
                                className="px-4 py-2 text-sm font-mono bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                              >
                                ⏰ Começa em: {timeInfo.diffHours > 0 ? `${timeInfo.diffHours}h ` : ''}{timeInfo.diffMinutes}min
                              </Badge>
                            </div>
                          )}
                          
                          {event.description && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{event.description}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(event)}
                            className="h-10 w-10 p-0 border-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
                          >
                            <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                            className="h-10 w-10 p-0 border-2 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { EventCalendar }
export default EventCalendar
