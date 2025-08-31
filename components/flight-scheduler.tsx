"use client"

import { useState, useEffect, useCallback } from "react"
import { format, parseISO, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Plane, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Square
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { Flight } from "@/lib/types"
import { militaryPersonnel } from "@/lib/static-data"

function FlightScheduler() {
  const { toast } = useToast()
  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null)
  
  // Form states
  const [flightDate, setFlightDate] = useState("")
  const [flightTime, setFlightTime] = useState("")
  const [militaryIds, setMilitaryIds] = useState<string[]>([])

  // Buscar voos
  const fetchFlights = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("flight_schedules")
        .select("*")
        .order("flight_date", { ascending: true })

      if (error) {
        console.error("Erro ao buscar voos:", error)
        console.error("Detalhes do erro:", JSON.stringify(error, null, 2))
        toast({ 
          title: "Erro", 
          description: `Não foi possível carregar os voos: ${error.message || "Erro desconhecido"}`, 
          variant: "destructive" 
        })
      } else {
        console.log("Voos carregados com sucesso:", data)
        setFlights(data || [])
      }
    } catch (error) {
      console.error("Erro ao buscar voos:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao carregar voos.", 
        variant: "destructive" 
      })
    }
    setLoading(false)
  }, [toast])

  // Resetar formulário
  const resetForm = () => {
    setFlightDate("")
    setFlightTime("")
    setMilitaryIds([])
    setEditingFlight(null)
  }

  // Salvar voo
  const handleSaveFlight = async () => {
    if (!flightDate || !flightTime || militaryIds.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios e selecione pelo menos um militar.",
        variant: "destructive",
      })
      return
    }

    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(flightDate)) {
      toast({
        title: "Erro de Validação",
        description: "Formato de data inválido. Use YYYY-MM-DD",
        variant: "destructive",
      })
      return
    }

    // Validar formato do horário
    if (!/^\d{2}:\d{2}$/.test(flightTime)) {
      toast({
        title: "Erro de Validação",
        description: "Formato de horário inválido. Use HH:MM",
        variant: "destructive",
      })
      return
    }

    const flightData = {
      flight_date: flightDate,
      flight_time: flightTime,
      military_ids: JSON.stringify(militaryIds),
    }

    console.log("Dados do voo a serem salvos:", flightData)
    console.log("Tipo de dados:", {
      flight_date: typeof flightDate,
      flight_time: typeof flightTime,
      military_ids: typeof JSON.stringify(militaryIds)
    })

    try {
      if (editingFlight) {
        const { error } = await supabase
          .from("flight_schedules")
          .update(flightData)
          .eq("id", editingFlight.id)

        if (error) {
          console.error("Erro ao atualizar voo:", error)
          console.error("Detalhes do erro:", JSON.stringify(error, null, 2))
          toast({ 
            title: "Erro ao Atualizar Voo", 
            description: error.message || "Erro desconhecido ao atualizar voo", 
            variant: "destructive" 
          })
        } else {
          toast({
            title: "✅ Sucesso!",
            description: "Voo atualizado com sucesso.",
          })
          fetchFlights()
          setIsDialogOpen(false)
          resetForm()
        }
      } else {
        const { error } = await supabase
          .from("flight_schedules")
          .insert([flightData])

        if (error) {
          console.error("Erro ao adicionar voo:", error)
          console.error("Detalhes do erro:", JSON.stringify(error, null, 2))
          toast({ 
            title: "Erro ao Adicionar Voo", 
            description: error.message || "Erro desconhecido ao adicionar voo", 
            variant: "destructive" 
          })
        } else {
          toast({
            title: "✅ Sucesso!",
            description: "Voo agendado com sucesso.",
          })
          fetchFlights()
          setIsDialogOpen(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error("Erro ao salvar voo:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao salvar voo.", 
        variant: "destructive" 
      })
    }
  }

  // Editar voo
  const handleEditClick = (flight: any) => {
    setEditingFlight(flight)
    setFlightDate(flight.flight_date || "")
    setFlightTime(flight.flight_time || "")
    setMilitaryIds(flight.military_ids ? JSON.parse(flight.military_ids) : [])
    setIsDialogOpen(true)
  }

  // Deletar voo
  const handleDeleteFlight = async (id: string) => {
    try {
      const { error } = await supabase
        .from("flight_schedules")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Erro ao remover voo:", error)
        toast({ 
          title: "Erro", 
          description: "Não foi possível remover o voo.", 
          variant: "destructive" 
        })
      } else {
        toast({
          title: "✅ Removido!",
          description: "Voo removido com sucesso.",
        })
        fetchFlights()
      }
    } catch (error) {
      console.error("Erro ao remover voo:", error)
      toast({ 
        title: "Erro", 
        description: "Erro inesperado ao remover voo.", 
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



  // Carregar voos ao inicializar
  useEffect(() => {
    fetchFlights()
  }, [fetchFlights])

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header com estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-blue-200 shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold">Total de Voos</p>
                <p className="text-3xl font-bold text-blue-800">{flights.length}</p>
              </div>
              <Plane className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 font-semibold">Este Mês</p>
                <p className="text-3xl font-bold text-green-800">
                  {flights.filter(f => {
                    const flightDate = new Date(f.flight_date)
                    const now = new Date()
                    return flightDate.getMonth() === now.getMonth() && flightDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 font-semibold">Hoje</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {flights.filter(f => {
                    const flightDate = new Date(f.flight_date)
                    const today = new Date()
                    return flightDate.toDateString() === today.toDateString()
                  }).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-md">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-semibold">Total Militares</p>
                <p className="text-3xl font-bold text-purple-800">
                  {flights.reduce((total, flight) => {
                    if (flight.military_ids) {
                      return total + JSON.parse(flight.military_ids).length
                    }
                    return total + 1
                  }, 0)}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles e lista */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Controles */}
        <Card className="shadow-lg">
      <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Gerenciar Voos
            </CardTitle>
      </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Agende e gerencie voos para missões ou transporte.
            </p>
            
            {/* Botão principal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  onClick={resetForm}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Novo Voo
                </Button>
              </DialogTrigger>
              
              {/* Modal */}
              <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Plane className="h-6 w-6 text-white" />
                  </div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {editingFlight ? "✏️ Editar Voo" : "✈️ Novo Voo"}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 text-lg">
                    {editingFlight ? "Modifique os detalhes do voo" : "Agende um novo voo para o Esquadrão"}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-6">
                  {/* Data e Horário do Voo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="flight-date" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Data do Voo *
                      </Label>
            <Input
                        id="flight-date"
                        type="date"
                        value={flightDate}
                        onChange={(e) => setFlightDate(e.target.value)}
                        className="h-12 text-lg border-2 focus:border-green-500 transition-all duration-200"
            />
          </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="flight-time" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        Horário Zulu *
                      </Label>
            <Input
                        id="flight-time"
                        type="time"
                        value={flightTime}
                        onChange={(e) => setFlightTime(e.target.value)}
                        className="h-12 text-lg border-2 focus:border-orange-500 transition-all duration-200"
                      />
                      <p className="text-xs text-gray-500">Horário em UTC (Zulu)</p>
                    </div>
                  </div>

                  {/* Militares Responsáveis */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                      Militares Responsáveis *
                    </Label>
                    <div className="border-2 rounded-md p-3 min-h-[120px] bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                      {militaryIds.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum militar selecionado</p>
                      ) : (
                        <div className="space-y-2">
                          {militaryIds.map((id) => {
                            const military = militaryPersonnel.find(m => m.id === id)
                            return (
                              <div key={id} className="flex items-center justify-between bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {military?.rank.charAt(0)}
                                  </div>
                                  <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">{military?.rank} {military?.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setMilitaryIds(militaryIds.filter(mid => mid !== id))}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    <Select onValueChange={(value) => {
                      if (value && !militaryIds.includes(value)) {
                        setMilitaryIds([...militaryIds, value])
                      }
                    }}>
                      <SelectTrigger className="h-12 border-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100">
                        <SelectValue placeholder="Adicionar militar" className="text-gray-900 dark:text-gray-100" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
                        {militaryPersonnel
                          .filter(military => !militaryIds.includes(military.id))
                          .map((military) => (
                            <SelectItem key={military.id} value={military.id} className="py-3 text-gray-900 dark:text-gray-100 hover:bg-blue-100 dark:hover:bg-blue-900 focus:bg-blue-100 dark:focus:bg-blue-900 cursor-pointer data-[state=checked]:bg-blue-200 dark:data-[state=checked]:bg-blue-800 data-[state=checked]:text-gray-900 dark:data-[state=checked]:text-gray-100">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {military.rank.charAt(0)}
                                </div>
                                <span className="font-medium">{military.rank} {military.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                    onClick={handleSaveFlight}
                    disabled={!flightDate || !flightTime || militaryIds.length === 0}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {editingFlight ? (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Salvar Alterações
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Agendar Voo
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Lista de voos */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Voos Agendados ({flights.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {flights.length === 0 ? (
                <div className="text-center py-12">
                  <Plane className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-foreground text-lg">Nenhum voo agendado</p>
                  <p className="text-sm text-muted-foreground">Clique em "Novo Voo" para começar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {flights.map((flight) => (
                    <div key={flight.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-foreground">Voo {flight.id?.slice(0, 8)}</h3>
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Agendado
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Data:</span>
                                <span>{format(parseISO(flight.flight_date), "dd/MM/yyyy", { locale: ptBR })}</span>
                              </div>
                              {flight.flight_time && (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  <span className="font-medium">Horário:</span>
                                  <span>
                                    {flight.flight_time} Zulu / {(() => {
                                      const [hours, minutes] = flight.flight_time.split(':')
                                      const zuluTime = new Date()
                                      zuluTime.setUTCHours(parseInt(hours), parseInt(minutes))
                                      const localTime = new Date(zuluTime.getTime() - (3 * 60 * 60 * 1000))
                                      return localTime.toTimeString().slice(0, 5)
                                    })()} Local
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">Responsáveis:</span>
                                <span>
                                  {flight.military_ids ? 
                                    JSON.parse(flight.military_ids).map((id: string) => getMilitaryName(id)).join(', ') :
                                    getMilitaryName(flight.military_id)
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          

                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(flight)}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteFlight(flight.id)}
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
      </div>
    </div>
  )
}

export { FlightScheduler }
export default FlightScheduler
