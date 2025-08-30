"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import AnalyticsDashboard from "./analytics-dashboard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */
function safeLower(value: string | null | undefined) {
  return (value ?? "").toLowerCase()
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "—"
  const d = new Date(dateString)
  if (!isValid(d)) return dateString
  return format(d, "dd/MM/yyyy", { locale: ptBR })
}

/**
 * Faz SELECT * em <tableName>, mas devolve [] se a tabela não existir
 * (error.code === "42P01") ou se outro erro acontecer.
 */
async function fetchTableSafe<T>(tableName: string): Promise<T[]> {
  const { data, error } = await supabase.from(tableName).select("*")
  if (error) {
    if (error.code === "42P01") {
      console.warn(`Tabela '${tableName}' não encontrada — ignorando.`)
      return []
    }
    console.error(`Erro ao buscar '${tableName}':`, error)
    return []
  }
  return (data as T[]) ?? []
}

/* --------------------------------------------------
   Tipos
-------------------------------------------------- */
interface AttendanceRecord {
  id: string
  military_name: string
  rank: string
  date: string
  status: string
  justification_id: string | null
}

interface JustificationRecord {
  id: string
  military_name: string
  type: string
  start_date: string
  end_date: string
  reason: string
  approved: boolean
}

interface EventRecord {
  id: string
  title: string
  description: string
  date: string
  category: string
}

interface FlightRecord {
  id: string
  military_name: string
  date: string
  flight_type: string
  status: string
}

interface PermanenceRecord {
  id: string
  military_name: string
  date: string
  status: string
  notes: string
}

interface PersonalNoteRecord {
  id: string
  military_name: string
  date: string
  note_content: string
}

interface KeyHistoryRecord {
  id: string
  date: string
  key: string
  action: string
}

/* --------------------------------------------------
   Componente
-------------------------------------------------- */
export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState("attendance")

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [justificationRecords, setJustificationRecords] = useState<JustificationRecord[]>([])
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([])
  const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([])
  const [permanenceRecords, setPermanenceRecords] = useState<PermanenceRecord[]>([])
  const [personalNoteRecords, setPersonalNoteRecords] = useState<PersonalNoteRecord[]>([])
  const [keyHistoryRecords, setKeyHistoryRecords] = useState<KeyHistoryRecord[]>([])

  const [attendanceSearch, setAttendanceSearch] = useState("")
  const [attendanceFilterStatus, setAttendanceFilterStatus] = useState("all")
  const [attendanceFilterDate, setAttendanceFilterDate] = useState("all")

  const [justificationSearch, setJustificationSearch] = useState("")
  const [justificationFilterStatus, setJustificationFilterStatus] = useState("all")
  const [justificationFilterType, setJustificationFilterType] = useState("all")

  const [eventSearch, setEventSearch] = useState("")
  const [eventFilterCategory, setEventFilterCategory] = useState("all")

  const [flightSearch, setFlightSearch] = useState("")
  const [flightFilterStatus, setFlightFilterStatus] = useState("all")
  const [flightFilterType, setFlightFilterType] = useState("all")

  const [permanenceSearch, setPermanenceSearch] = useState("")
  const [permanenceFilterStatus, setPermanenceFilterStatus] = useState("all")

  const [personalNoteSearch, setPersonalNoteSearch] = useState("")

  // Gerar datas únicas para o filtro
  const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort().reverse()

  useEffect(() => {
    const fetchAllRecords = async () => {
      console.log("📥 Carregando dados do histórico de presença...")

      // Buscar apenas na tabela de presença
      const attendanceData = await fetchTableSafe<AttendanceRecord>("military_attendance_records")
      setAttendanceRecords(attendanceData)
      
      // Log para debug: mostrar todos os status únicos
      const uniqueStatuses = [...new Set(attendanceData.map(r => r.status))]
      console.log("✅ Histórico de presença carregado:", attendanceData.length, "registros")
      console.log("📊 Status únicos encontrados:", uniqueStatuses)
      console.log("📊 Dados carregados:", attendanceData)
    }

    fetchAllRecords()
  }, [])

  const filteredAttendance = attendanceRecords.filter(
    (r) =>
      safeLower(r.military_name).includes(attendanceSearch.toLowerCase()) &&
      (attendanceFilterStatus === "all" || r.status === attendanceFilterStatus) &&
      (attendanceFilterDate === "all" || r.date === attendanceFilterDate),
  )

  // Log para debug do filtro
  console.log("🔍 Filtros aplicados:", {
    search: attendanceSearch,
    status: attendanceFilterStatus,
    date: attendanceFilterDate,
    totalRecords: attendanceRecords.length,
    filteredRecords: filteredAttendance.length
  })
  
  // Log específico para verificar o TC CARNEIRO no filtro
  const tcCarneiroFiltered = filteredAttendance.find(r => r.military_name.includes("CARNEIRO"))
  if (tcCarneiroFiltered) {
    console.log("✅ TC CARNEIRO aparece no filtro:", tcCarneiroFiltered)
  } else {
    console.log("❌ TC CARNEIRO NÃO aparece no filtro")
    // Verificar se está sendo filtrado incorretamente
    const tcCarneiroOriginal = attendanceRecords.find(r => r.military_name.includes("CARNEIRO"))
    if (tcCarneiroOriginal) {
      console.log("🔍 TC CARNEIRO nos dados originais:", tcCarneiroOriginal)
      console.log("🔍 Verificando filtros:", {
        searchMatch: safeLower(tcCarneiroOriginal.military_name).includes(attendanceSearch.toLowerCase()),
        statusMatch: attendanceFilterStatus === "all" || tcCarneiroOriginal.status === attendanceFilterStatus,
        dateMatch: attendanceFilterDate === "all" || tcCarneiroOriginal.date === attendanceFilterDate
      })
    }
  }

  const filteredJustifications = justificationRecords.filter(
    (r) =>
      safeLower(r.military_name).includes(justificationSearch.toLowerCase()) &&
      (justificationFilterStatus === "all" || r.approved === (justificationFilterStatus === "aprovada")) &&
      (justificationFilterType === "all" || r.type === justificationFilterType),
  )

  const filteredEvents = eventRecords.filter(
    (r) =>
      safeLower(r.title).includes(eventSearch.toLowerCase()) &&
      (eventFilterCategory === "all" || r.category === eventFilterCategory),
  )

  const filteredFlights = flightRecords.filter(
    (r) =>
      safeLower(r.military_name).includes(flightSearch.toLowerCase()) &&
      (flightFilterStatus === "all" || r.status === flightFilterStatus) &&
      (flightFilterType === "all" || r.flight_type === flightFilterType),
  )

  const filteredPermanence = permanenceRecords.filter(
    (r) =>
      safeLower(r.military_name).includes(permanenceSearch.toLowerCase()) &&
      (permanenceFilterStatus === "all" || r.status === permanenceFilterStatus),
  )

  const filteredPersonalNotes = personalNoteRecords.filter(
    (r) =>
      safeLower(r.note_content).includes(personalNoteSearch.toLowerCase()) ||
      safeLower(r.military_name).includes(personalNoteSearch.toLowerCase()),
  )

  const filteredKeyHistory = keyHistoryRecords.filter(
    (r) =>
      safeLower(r.key).includes(personalNoteSearch.toLowerCase()) ||
      safeLower(r.action).includes(personalNoteSearch.toLowerCase()),
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico e Análises</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-1 p-1">
            <TabsTrigger value="attendance" className="text-xs sm:text-sm px-2 py-2">
              Presença
            </TabsTrigger>
            <TabsTrigger value="justifications" className="text-xs sm:text-sm px-2 py-2">
              Justificativas
            </TabsTrigger>
            <TabsTrigger value="events" className="text-xs sm:text-sm px-2 py-2">
              Eventos
            </TabsTrigger>
            <TabsTrigger value="flights" className="text-xs sm:text-sm px-2 py-2">
              Voos
            </TabsTrigger>
            <TabsTrigger value="permanence" className="text-xs sm:text-sm px-2 py-2">
              Permanência
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm px-2 py-2">
              Notas Pessoais
            </TabsTrigger>
            <TabsTrigger value="keys" className="text-xs sm:text-sm px-2 py-2">
              Chaves
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">
              Análises
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar..."
                value={attendanceSearch}
                onChange={(e) => setAttendanceSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={attendanceFilterStatus} onValueChange={setAttendanceFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    {attendanceFilterStatus === "all" ? "Todos os Status" : 
                     attendanceFilterStatus === "presente" ? "Presente" :
                     attendanceFilterStatus === "ausente" ? "Ausente" :
                     attendanceFilterStatus === "justificado" ? "Justificado" : "Filtrar por Status"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                  <SelectItem value="justificado">Justificado</SelectItem>
                </SelectContent>
              </Select>
                             <Select value={attendanceFilterDate} onValueChange={setAttendanceFilterDate}>
                 <SelectTrigger className="w-[180px]">
                   <SelectValue>
                     {attendanceFilterDate === "all" ? "Todas as Datas" : formatDate(attendanceFilterDate)}
                   </SelectValue>
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Todas as Datas</SelectItem>
                   {uniqueDates.map((date) => (
                     <SelectItem key={date} value={date}>
                       {formatDate(date)}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Militar</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Justificativa ID</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.rank} {r.military_name}</td>
                      <td className="px-6 py-4">{formatDate(r.date)}</td>
                      <td className="px-6 py-4">{r.status}</td>
                      <td className="px-6 py-4">{r.justification_id ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="justifications" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar ou motivo..."
                value={justificationSearch}
                onChange={(e) => setJustificationSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={justificationFilterStatus} onValueChange={setJustificationFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={justificationFilterType} onValueChange={setJustificationFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="dispensa">Dispensa</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="licenca">Licença</SelectItem>
                  <SelectItem value="missao">Missão</SelectItem>
                  <SelectItem value="medico">Médico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Militar</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Período</th>
                    <th className="px-6 py-3">Motivo</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJustifications.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                      <td className="px-6 py-4">{r.type}</td>
                      <td className="px-6 py-4">
                        {formatDate(r.start_date)} – {formatDate(r.end_date)}
                      </td>
                      <td className="px-6 py-4">{r.reason}</td>
                      <td className="px-6 py-4">{r.approved ? "Aprovada" : "Pendente"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar título ou descrição..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={eventFilterCategory} onValueChange={setEventFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  <SelectItem value="treinamento">Treinamento</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="operacao">Operação</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Título</th>
                    <th className="px-6 py-3">Descrição</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.title}</td>
                      <td className="px-6 py-4">{r.description}</td>
                      <td className="px-6 py-4">{formatDate(r.date)}</td>
                      <td className="px-6 py-4">{r.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="flights" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar..."
                value={flightSearch}
                onChange={(e) => setFlightSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={flightFilterStatus} onValueChange={setFlightFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={flightFilterType} onValueChange={setFlightFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="instrucao">Instrução</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Militar</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Tipo</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                      <td className="px-6 py-4">{formatDate(r.date)}</td>
                      <td className="px-6 py-4">{r.flight_type}</td>
                      <td className="px-6 py-4">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="permanence" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar militar ou notas..."
                value={permanenceSearch}
                onChange={(e) => setPermanenceSearch(e.target.value)}
                className="flex-1"
              />
              <Select value={permanenceFilterStatus} onValueChange={setPermanenceFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="presente">Presente</SelectItem>
                  <SelectItem value="ausente">Ausente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Militar</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPermanence.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                      <td className="px-6 py-4">{formatDate(r.date)}</td>
                      <td className="px-6 py-4">{r.status}</td>
                      <td className="px-6 py-4">{r.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar por conteúdo ou militar..."
                value={personalNoteSearch}
                onChange={(e) => setPersonalNoteSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Militar</th>
                    <th className="px-6 py-3">Data</th>
                    <th className="px-6 py-3">Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPersonalNotes.map((r) => (
                    <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                      <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                      <td className="px-6 py-4">{formatDate(r.date)}</td>
                      <td className="px-6 py-4">{r.note_content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="keys" className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Input
                placeholder="Buscar por chave ou ação..."
                value={personalNoteSearch}
                onChange={(e) => setPersonalNoteSearch(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeyHistory.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formatDate(r.date)}</TableCell>
                      <TableCell>{r.key}</TableCell>
                      <TableCell>{r.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default HistoryTabs
