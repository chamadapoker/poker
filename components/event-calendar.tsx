"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { format, isBefore, isSameDay, setHours, setMinutes, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PlusCircle, Trash2, BellRing, Info, Pencil } from "lucide-react"
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

import { DatePicker } from "./date-picker"
import { militaryPersonnel } from "@/lib/data"
import type { Event } from "@/lib/types"
import { supabase } from "@/lib/supabase"

function EventCalendar() {
  const { toast } = useToast()
  const [events, setEvents] = useState<Event[]>([])
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState<string>("")
  const [createdByMilitaryId, setCreatedByMilitaryId] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const notifiedEvents = useRef<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState<Date | undefined>(new Date())

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("military_events")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true })

    if (error) {
      console.error("Erro ao buscar eventos:", error)
      toast({ title: "Erro", description: "Não foi possível carregar os eventos.", variant: "destructive" })
    } else {
      setEvents(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || undefined,
          date: parseISO(e.date),
          time: e.time || undefined,
          createdByMilitaryId: e.created_by_military_id || undefined,
        })) as Event[],
      )
    }
    setLoading(false)
  }, [toast])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    const checkEvents = () => {
      const now = new Date()
      events.forEach((event) => {
        if (event.time && !notifiedEvents.current.has(event.id)) {
          const [hours, minutes] = event.time.split(":").map(Number)
          let eventDateTime = setHours(event.date, hours)
          eventDateTime = setMinutes(eventDateTime, minutes)

          const fifteenMinutesBefore = new Date(eventDateTime.getTime() - 15 * 60 * 1000)

          if (isSameDay(now, eventDateTime) && now >= fifteenMinutesBefore && now < eventDateTime) {
            toast({
              title: "Lembrete de Evento Próximo!",
              description: `${event.title} em ${format(eventDateTime, "HH:mm", { locale: ptBR })}. ${event.description ? `Detalhes: ${event.description}` : ""}`,
              action: <BellRing className="h-5 w-5" />,
              duration: 10000,
            })
            notifiedEvents.current.add(event.id)
          } else if (
            isSameDay(now, eventDateTime) &&
            now >= eventDateTime &&
            now < new Date(eventDateTime.getTime() + 5 * 60 * 1000)
          ) {
            toast({
              title: "Evento Agora!",
              description: `${event.title} está acontecendo agora. ${event.description ? `Detalhes: ${event.description}` : ""}`,
              action: <BellRing className="h-5 w-5" />,
              duration: 10000,
            })
            notifiedEvents.current.add(event.id)
          }
        }
      })
    }

    const interval = setInterval(checkEvents, 60 * 1000)
    checkEvents()
    return () => clearInterval(interval)
  }, [events, toast])

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedDate(new Date())
    setTime("")
    setCreatedByMilitaryId("")
    setEditingEvent(null)
    setIsDialogOpen(false)
  }

  const handleSaveEvent = async () => {
    if (!title || !selectedDate) {
      toast({
        title: "Erro",
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
      created_by_military_id: createdByMilitaryId || null,
    }

    if (editingEvent) {
      const { error } = await supabase.from("military_events").update(eventData).eq("id", editingEvent.id)

      if (error) {
        console.error("Erro ao atualizar evento:", error)
        toast({ title: "Erro", description: "Não foi possível atualizar o evento.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Evento atualizado.",
        })
        fetchEvents()
      }
    } else {
      const { error } = await supabase.from("military_events").insert([eventData])

      if (error) {
        console.error("Erro ao adicionar evento:", error)
        toast({ title: "Erro", description: "Não foi possível adicionar o evento.", variant: "destructive" })
      } else {
        toast({
          title: "Sucesso",
          description: "Evento adicionado.",
        })
        fetchEvents()
      }
    }
    resetForm()
  }

  const handleEditClick = (event: Event) => {
    setEditingEvent(event)
    setTitle(event.title)
    setDescription(event.description || "")
    setSelectedDate(event.date)
    setTime(event.time || "")
    setCreatedByMilitaryId(event.createdByMilitaryId || "")
    setIsDialogOpen(true)
  }

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("military_events").delete().eq("id", id)

    if (error) {
      console.error("Erro ao remover evento:", error)
      toast({ title: "Erro", description: "Não foi possível remover o evento.", variant: "destructive" })
    } else {
      toast({
        title: "Sucesso",
        description: "Evento removido.",
      })
      fetchEvents()
    }
  }

  const getMilitaryName = (id: string | undefined) => {
    if (!id) return "N/A"
    const military = militaryPersonnel.find((m) => m.id === id)
    return military ? `${military.rank} ${military.name}`.trim() : "Desconhecido"
  }

  const sortedEvents = [...events].sort((a, b) => {
    if (isBefore(a.date, b.date)) return -1
    if (isBefore(b.date, a.date)) return 1

    if (a.time && b.time) {
      return a.time.localeCompare(b.time)
    }
    if (a.time) return -1
    if (b.time) return 1
    return 0
  })

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Calendário de Eventos</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Eventos</h3>
          <p className="text-muted-foreground">Adicione, edite ou remova eventos importantes.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={resetForm}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingEvent ? "Editar Evento" : "Adicionar Evento"}</DialogTitle>
              <DialogDescription>Preencha os detalhes do evento ou aviso.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="event-title">Título</Label>
                <Input
                  id="event-title"
                  placeholder="Ex: Reunião no Auditório"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-description">Descrição (Opcional)</Label>
                <Textarea
                  id="event-description"
                  placeholder="Detalhes sobre o evento..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-date">Data</Label>
                <DatePicker date={selectedDate} setDate={setSelectedDate} placeholder="Selecione a data do evento" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-time">Hora (Opcional)</Label>
                <Input id="event-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="created-by">Criado por (Opcional)</Label>
                <Select value={createdByMilitaryId} onValueChange={setCreatedByMilitaryId}>
                  <SelectTrigger id="created-by">
                    <SelectValue placeholder="Selecione o militar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {militaryPersonnel.map((military) => (
                      <SelectItem key={military.id} value={military.id}>
                        {`${military.rank} ${military.name}`.trim()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveEvent}>
                {editingEvent ? "Salvar Alterações" : "Salvar Evento"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <h3 className="text-lg font-semibold mt-8">Próximos Eventos</h3>
      {sortedEvents.length === 0 ? (
        <p className="text-muted-foreground">Nenhum evento ou aviso registrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="font-medium">Evento</th>
                <th className="font-medium">Data</th>
                <th className="font-medium">Hora</th>
                <th className="font-medium">Criado por</th>
                <th className="font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => (
                <tr key={event.id}>
                  <td className="font-medium flex items-center gap-2">
                    {event.title}
                    {event.description && (
                      <div className="tooltip">
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        <span className="tooltiptext">{event.description}</span>
                      </div>
                    )}
                  </td>
                  <td>{format(event.date, "dd/MM/yyyy", { locale: ptBR })}</td>
                  <td>{event.time || "-"}</td>
                  <td>{getMilitaryName(event.createdByMilitaryId)}</td>
                  <td className="text-right flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(event)}
                      aria-label={`Editar evento ${event.title}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteEvent(event.id)}
                      aria-label={`Remover evento ${event.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export { EventCalendar }
export default EventCalendar
