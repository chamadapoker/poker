"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, User, Shield, Save, Calendar, Users, Settings, RotateCcw, Loader2 } from "lucide-react"
import { callTypes, attendanceStatuses } from "@/lib/static-data"
import { PDFGenerator } from "@/components/pdf-generator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { MilitaryAttendanceRecord } from "@/lib/types"

type MilitaryAttendance = {
  id: string
  militaryId: string
  militaryName: string
  rank: string
  status: string
  callType: string
  date: string
  isJustified: boolean
}

type JustificationRecord = {
  id: string
  military_id: string
  military_name: string
  reason: string
  start_date: string
  end_date: string
}

function AttendanceTracker() {
  const [selectedCallType, setSelectedCallType] = useState<string>("")
  const [militaryAttendance, setMilitaryAttendance] = useState<MilitaryAttendance[]>([])
  const [justifications, setJustifications] = useState<JustificationRecord[]>([])
  const [showPDFButton, setShowPDFButton] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [isBackdating, setIsBackdating] = useState(false)

  const [militaryList, setMilitaryList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Ordem de precedência das patentes
  const RANK_ORDER = [
    "Cel", "TC", "MJ", "CP", "1T", "2T", "Asp",
    "SO", "1S", "2S", "3S", "Cb", "S1", "S2"
  ]


  // Efeito ÚNICO centralizado para carregar tudo quando a data mudar ou na montagem
  useEffect(() => {
    loadAllData()
  }, [selectedDate])

  const loadAllData = async () => {
    console.log('=== INICIANDO CARREGAMENTO UNIFICADO ===')
    console.log('Data da chamada:', selectedDate)
    setLoading(true)

    try {
      // 1. Buscas em Paralelo para performance máxima
      const [militaryResponse, justificationsResponse, historyResponse] = await Promise.all([
        // A. Buscar Efetivo
        (supabase as any).from("military_personnel").select("*"),

        // B. Buscar Justificativas VÁLIDAS para a data
        (supabase as any)
          .from("military_justifications")
          .select("*")
          .lte("start_date", selectedDate)
          .gte("end_date", selectedDate),

        // C. Buscar Histórico de Presença do dia
        (supabase as any)
          .from("military_attendance_records")
          .select("*")
          .eq("date", selectedDate)
      ])

      // 2. Tratar erros
      if (militaryResponse.error) throw militaryResponse.error
      if (justificationsResponse.error) console.error("Erro ao buscar justificativas:", justificationsResponse.error)
      if (historyResponse.error) console.error("Erro ao buscar histórico:", historyResponse.error)

      // 3. Processar Efetivo (Ordenação)
      const rawMilitary = militaryResponse.data || []
      const sortedMilitary = rawMilitary.sort((a: any, b: any) => {
        // 1. Prioridade absoluta: Antiguidade (Seniority)
        if (a.seniority !== null && a.seniority !== undefined && b.seniority !== null && b.seniority !== undefined) {
          if (a.seniority !== b.seniority) return a.seniority - b.seniority
        }

        // 2. Fallback: Ordem de Patente (caso seniority falhe ou seja igual)
        const indexA = RANK_ORDER.indexOf(a.rank)
        const indexB = RANK_ORDER.indexOf(b.rank)
        const orderA = indexA === -1 ? 999 : indexA
        const orderB = indexB === -1 ? 999 : indexB
        if (orderA !== orderB) return orderA - orderB

        // 3. Desempate: Nome
        return a.name.localeCompare(b.name)
      })

      // 4. Processar Justificativas
      const currentJustifications = justificationsResponse.data || []
      setJustifications(currentJustifications)

      // 5. Construir Lista Final de Presença (Merge)
      const currentHistory = historyResponse.data || []

      const builtAttendance = sortedMilitary.map((military: any) => {
        // A. Verificar se tem justificativa (Prioriza ID, fallback para Nome)
        const justification = currentJustifications.find((j: any) =>
          j.military_id === military.id || j.military_name === military.name
        )
        const isJustified = !!justification

        // B. Verificar se tem histórico salvo
        const record = currentHistory.find((r: any) => r.military_id === military.id)

        // C. Determinar Status Final
        // Prioridade: Justificado > Histórico Salvo > Ausente (Padrão)
        let status = "ausente"
        if (isJustified) {
          status = "justificado"
        } else if (record) {
          status = record.status
        }

        return {
          id: `att_${military.id}`,
          militaryId: military.id,
          militaryName: military.name,
          rank: military.rank,
          status: status,
          callType: record ? record.call_type : (selectedCallType || ""),
          date: selectedDate,
          isJustified: isJustified,
        }
      })

      setMilitaryList(sortedMilitary)
      setMilitaryAttendance(builtAttendance)
      console.log('=== DADOS CARREGADOS E PROCESSADOS ===')
      console.log('Total Militares:', builtAttendance.length)
      console.log('Justificados:', currentJustifications.length)

    } catch (error: any) {
      console.error('ERRO FATAL NO CARREGAMENTO:', error)
      toast({
        title: "Erro de Carregamento",
        description: "Falha ao sincronizar dados da chamada. Tente atualizar a página.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Efeito secundário apenas para setup inicial de tipos de chamada e limpeza diária
  useEffect(() => {
    // Definir tipo padrão se não houver
    if (callTypes.length > 0 && !selectedCallType) {
      setSelectedCallType(callTypes[0].id)
    }

    // Verificar expiração diária
    const lastResetDate = localStorage.getItem('lastAttendanceReset')
    const today = new Date().toDateString()
    if (lastResetDate !== today) {
      localStorage.setItem('lastAttendanceReset', today)
    }
  }, [])

  // Removidos: useEffects redundantes de justifications e initial loads
  // Removido: fetchJustifications isolado
  // Removido: initializeAttendance isolado
  // Removido: fetchAttendanceHistory isolado

  const handleStatusChange = async (militaryId: string, newStatus: string) => {
    // 1. Atualização Otimista da UI (Feedback instantâneo)
    setMilitaryAttendance(prev =>
      prev.map((military: any) =>
        military.militaryId === militaryId
          ? { ...military, status: newStatus }
          : military
      )
    )

    // 2. Preparar dados para Upsert
    const military = militaryAttendance.find(m => m.militaryId === militaryId)
    if (!military) return

    // Se estiver justificado, não deveria estar mudando status manualmente, mas por segurança mantemos a lógica
    const recordToUpsert = {
      military_id: militaryId,
      military_name: military.militaryName,
      rank: military.rank,
      call_type: selectedCallType || "presenca_diaria", // Fallback seguro
      date: selectedDate,
      status: newStatus,
      // Se tiver justificativa, o status visual é "justificado", mas no banco pode ser útil saber o status original ou manter consistência
      // Decisão: Se o usuário está mudando o status manualmente, respeitamos o novo status.
      // Porém, se ele for justificado, a UI bloqueia a mudança. 
    }

    try {
      console.log(`Salvando status para ${military.rank} ${military.militaryName}: ${newStatus}`)

      const { error } = await (supabase as any)
        .from("military_attendance_records")
        .upsert(recordToUpsert, { onConflict: 'military_id, date' })

      if (error) throw error

      toast({
        title: "Salvo",
        description: `${military.rank} ${military.militaryName}: ${attendanceStatuses.find((s: any) => s.id === newStatus)?.label}`,
        duration: 2000,
        className: "bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-800"
      })

    } catch (error: any) {
      console.error("Erro ao salvar status:", error)
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o status no banco de dados.",
        variant: "destructive"
      })
      // Reverter UI em caso de erro? (Opcional, mas recomendado para consistência estrita)
    }
  }

  const handleClearAttendance = () => {
    // Confirmar antes de limpar
    if (!confirm('Tem certeza que deseja limpar a lista de presença? Os status serão resetados para "AUSENTE", mas os justificados permanecerão.')) {
      return
    }

    // Limpar apenas os status não justificados, mantendo os justificados
    const clearedAttendance = militaryAttendance.map((military: any) => {
      if (military.isJustified) {
        // Manter justificados como estão
        return military
      } else {
        // Resetar apenas os não justificados
        return {
          ...military,
          status: 'ausente',
          isJustified: false
        }
      }
    })
    setMilitaryAttendance(clearedAttendance)

    // Resetar o botão de PDF
    setShowPDFButton(false)

    toast({
      title: "Lista Limpa!",
      description: "Status resetados para 'AUSENTE'. Justificados mantidos.",
    })
  }



  const getStatusColor = (status: string, isJustified: boolean) => {
    if (isJustified) {
      return "border-l-blue-600 bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700"
    }

    switch (status) {
      case "presente":
        return "border-l-green-600 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700"
      case "ausente":
      default:
        return "border-l-red-600 bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700"
    }
  }

  const getStatusIcon = (status: string, isJustified: boolean) => {
    if (isJustified) {
      return <Shield className="h-6 w-6 text-blue-600" />
    }

    switch (status) {
      case "presente":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "ausente":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <User className="h-6 w-6 text-slate-500" />
    }
  }

  // Agora mostra todos os militares, incluindo justificados
  const allMilitary = militaryAttendance

  // Estatísticas
  const presentCount = allMilitary.filter(m => m.status === "presente" && !m.isJustified).length
  const absentCount = allMilitary.filter(m => m.status === "ausente" && !m.isJustified).length
  const justifiedCount = allMilitary.filter(m => m.isJustified).length
  const totalCount = allMilitary.length

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalCount}
            </p>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {presentCount}
            </p>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Presentes</p>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {absentCount}
            </p>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Ausentes</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {justifiedCount}
            </p>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Justificados</p>
          </CardContent>
        </Card>
      </div>

      {/* Seletor de Data */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            Data da Chamada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <label htmlFor="date-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Selecione a data para lançar a presença:
              </label>
              <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  console.log('Data alterada para:', e.target.value)
                  setSelectedDate(e.target.value)
                  setIsBackdating(e.target.value !== format(new Date(), "yyyy-MM-dd"))
                }}
                max={format(new Date(), "yyyy-MM-dd")}
                className="w-full max-w-md px-3 py-2 border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 rounded-md transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            {isBackdating && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Lançando presença em data passada
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Chamada */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
            Tipo de Chamada - {format(new Date(selectedDate), "dd/MM/yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4">
            <Select value={selectedCallType} onValueChange={(value) => {
              console.log('Tipo de chamada selecionado:', value)
              setSelectedCallType(value)
            }}>
              <SelectTrigger className="w-full max-w-md border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                <SelectValue placeholder="Selecione o tipo de chamada">
                  {selectedCallType && callTypes.find((t: any) => t.id === selectedCallType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {callTypes.map((type: any) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCallType && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600 dark:text-green-300" />
                <span className="text-sm font-medium text-green-700 dark:text-green-200">
                  {callTypes.find(t => t.id === selectedCallType)?.label}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Militares */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Users className="h-6 w-6 text-red-600 dark:text-red-400" />
            Militares ({format(new Date(selectedDate), "dd/MM/yyyy")})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-slate-500 font-medium animate-pulse">
                Sincronizando efetivo, justificativas e histórico...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allMilitary.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Nenhum militar encontrado nesta data.
                </div>
              ) : (
                allMilitary.map((military: any) => (
                  <div
                    key={military.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border-l-4 ${getStatusColor(military.status, military.isJustified)} bg-white dark:bg-slate-800 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group`}
                  >
                    <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                      <div className="p-1.5 sm:p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        {getStatusIcon(military.status, military.isJustified)}
                      </div>
                      <div>
                        <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                          {military.rank} {military.militaryName}
                        </span>
                      </div>
                    </div>

                    {military.isJustified ? (
                      // Para militares justificados, mostra apenas o status fixo
                      <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-600 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                        <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 font-medium">JUSTIFICADO</span>
                      </div>
                    ) : (
                      // Para militares não justificados, mostra o dropdown
                      <Select
                        value={military.status}
                        onValueChange={(value) => handleStatusChange(military.militaryId, value)}
                      >
                        <SelectTrigger className="w-full sm:w-48 border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                          <SelectValue>
                            {military.status && attendanceStatuses.find((s: any) => s.id === military.status)?.label}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {attendanceStatuses.map((status: any) => (
                            <SelectItem key={status.id} value={status.id}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Legenda */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-600 rounded-lg">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                <span className="text-green-700 dark:text-green-200 font-medium">Presente</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-600 rounded-lg">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <span className="text-red-700 dark:text-red-200 font-medium">Ausente</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-800 border border-blue-200 dark:border-blue-600 rounded-lg">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 dark:text-blue-200 font-medium">Justificado</span>
              </div>
            </div>

            {/* Botões de Ação */}
            {/* Removido o botão "Salvar Presença" pois agora é Auto-Save */}

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto justify-center">
              <Button
                onClick={() => setShowPDFButton(!showPDFButton)}
                className="h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold bg-gray-800 hover:bg-gray-900 text-white shadow-lg transition-all duration-300"
              >
                {showPDFButton ? "Ocultar Opções de PDF" : "Gerar Relatório (PDF)"}
              </Button>
            </div>

            {/* Botões de PDF e Email */}
            {showPDFButton && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                  <PDFGenerator
                    militaryAttendance={allMilitary.map((military: any) => {
                      // Buscar o motivo da justificativa se o militar estiver justificado
                      if (military.isJustified) {
                        // Buscar por nome completo ou apenas pelo nome
                        const justification = justifications.find((j: any) =>
                          j.military_name === `${military.rank} ${military.militaryName}` ||
                          j.military_name === military.militaryName ||
                          j.military_name.includes(military.militaryName)
                        )
                        return {
                          ...military,
                          justificationReason: justification?.reason || 'JUSTIFICADO'
                        }
                      }
                      return military
                    })}
                    selectedCallType={selectedCallType}
                    callTypes={callTypes}
                    attendanceStatuses={attendanceStatuses}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AttendanceTracker }
export default AttendanceTracker
