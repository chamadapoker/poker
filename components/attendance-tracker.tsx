"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, User, Shield, Save, Calendar, Users, Settings, RotateCcw } from "lucide-react"
import { militaryPersonnel, callTypes, attendanceStatuses } from "@/lib/static-data"
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
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const loadData = async () => {
      console.log('=== INICIANDO CARREGAMENTO DE DADOS ===')
      console.log('militaryPersonnel disponível:', militaryPersonnel)
      console.log('callTypes disponível:', callTypes)
      
      try {
        // 1. PRIMEIRO: Carregar justificativas
        console.log('1. Carregando justificativas...')
        await fetchJustifications()
        
        console.log('=== CARREGAMENTO DE DADOS CONCLUÍDO ===')
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        console.log('Continuando com dados estáticos...')
      }
    }
    loadData()
    
    // Definir um tipo de chamada padrão
    if (callTypes.length > 0) {
      setSelectedCallType(callTypes[0].id)
      console.log('Tipo de chamada padrão definido:', callTypes[0].id)
    }

    // Verificar se deve limpar a lista (expiração diária)
    const lastResetDate = localStorage.getItem('lastAttendanceReset')
    const today = new Date().toDateString()
    
    if (lastResetDate !== today) {
      // É um novo dia, limpar a lista
      console.log('Novo dia detectado, limpando lista de presença...')
      localStorage.setItem('lastAttendanceReset', today)
      // A lista será inicializada como "ausente" no initializeAttendance
    }
  }, [])

  // NOVO: useEffect separado para reagir às mudanças em justifications
  useEffect(() => {
    if (justifications.length >= 0) { // Mudança: >= 0 em vez de > 0
      console.log('=== JUSTIFICATIVAS ATUALIZADAS, INICIALIZANDO LISTA ===')
      console.log('Justificativas disponíveis:', justifications)
      console.log('militaryPersonnel disponível:', militaryPersonnel)
      initializeAttendance()
      fetchAttendanceHistory()
    }
  }, [justifications])

  const fetchJustifications = async () => {
    console.log("Buscando justificativas para a data:", today)
    console.log("Data atual formatada:", today)
    
    // Primeiro, buscar TODAS as justificativas para debug
    const { data: allRecords, error: allError } = await supabase
      .from("military_justifications")
      .select("*")

    if (allError) {
      console.error("Error fetching all justifications:", allError)
    } else {
      console.log("TODAS as justificativas no banco:", allRecords)
      
      // Debug das datas de cada justificativa
      if (allRecords && allRecords.length > 0) {
        allRecords.forEach((record, index) => {
          console.log(`Justificativa ${index + 1}:`, {
            military_name: record.military_name,
            start_date: record.start_date,
            end_date: record.end_date,
            start_date_type: typeof record.start_date,
            end_date_type: typeof record.end_date,
            today: today,
            today_type: typeof today
          })
        })
      }
    }
    
    // Agora buscar apenas as válidas para hoje
    const { data: records, error } = await supabase
      .from("military_justifications")
      .select("*")
      .lte("start_date", today)
      .gte("end_date", today)

    if (error) {
      console.error("Error fetching justifications for today:", error)
    } else {
      console.log("Justificativas válidas para hoje:", records)
      setJustifications(records || [])
    }
  }

  const initializeAttendance = () => {
    console.log("Inicializando lista de presença...")
    console.log("Justificativas disponíveis:", justifications)
    console.log("Data atual (today):", today)
    
    const initialAttendance = militaryPersonnel.map((military) => {
      // CORREÇÃO: Comparar datas como strings para evitar problemas de timezone
      const isJustified = justifications.some(
        (justification) => {
          const justificationStart = justification.start_date
          const justificationEnd = justification.end_date
          const todayStr = today
          
          console.log(`=== VERIFICAÇÃO DETALHADA PARA ${military.rank} ${military.name} ===`)
          console.log('Justificativa sendo verificada:', {
            military_name: justification.military_name,
            start_date: justificationStart,
            end_date: justificationEnd,
            today: todayStr
          })
          
          const nameMatch = justification.military_name === military.name
          const dateRange = todayStr >= justificationStart && todayStr <= justificationEnd
          
          console.log('Resultados da verificação:', {
            name_match: nameMatch,
            date_range: dateRange,
            start_date_check: `${todayStr} >= ${justificationStart} = ${todayStr >= justificationStart}`,
            end_date_check: `${todayStr} <= ${justificationEnd} = ${todayStr <= justificationEnd}`
          })
          
          const result = nameMatch && dateRange
          console.log(`Resultado final para ${military.rank} ${military.name}: ${result}`)
          console.log('=== FIM VERIFICAÇÃO ===')
          
          return result
        }
      )

      console.log(`Militar ${military.rank} ${military.name}: isJustified = ${isJustified}`)

      return {
        id: `att_${military.id}`,
        militaryId: military.id,
        militaryName: military.name,
        rank: military.rank,
        status: isJustified ? "justificado" : "ausente",
        callType: "",
        date: today,
        isJustified,
      }
    })
    console.log("Lista de presença inicializada:", initialAttendance)
    setMilitaryAttendance(initialAttendance)
  }

  const fetchAttendanceHistory = async () => {
    console.log("Buscando histórico de presença para:", today)
    
    try {
      const { data: records, error } = await supabase
        .from("military_attendance_records")
        .select("*")
        .eq("date", today)

      if (error) {
        console.error("Error fetching attendance history:", error)
        console.log("Usando dados estáticos para histórico de presença")
        return
      } else if (records && records.length > 0) {
        // Atualiza o estado com os dados do banco
        const updatedAttendance = militaryPersonnel.map((military) => {
          const record = records.find(r => r.military_id === military.id)
          const isJustified = justifications.some(
            (justification) => {
              const nameMatch = justification.military_name === military.name
              const dateRange = today >= justification.start_date && today <= justification.end_date
              return nameMatch && dateRange
            }
          )

          return {
            id: `att_${military.id}`,
            militaryId: military.id,
            militaryName: military.name,
            rank: military.rank,
            status: record ? record.status : (isJustified ? "justificado" : "ausente"),
            callType: record ? record.call_type : "",
            date: today,
            isJustified,
          }
        })
        setMilitaryAttendance(updatedAttendance)
      }
    } catch (error) {
      console.error("Erro geral ao buscar histórico de presença:", error)
      console.log("Usando dados estáticos para histórico de presença")
    }
  }

  const handleStatusChange = (militaryId: string, newStatus: string) => {
    setMilitaryAttendance(prev => 
      prev.map(military => 
        military.militaryId === militaryId 
          ? { ...military, status: newStatus }
          : military
      )
    )
  }

  const handleClearAttendance = () => {
    // Confirmar antes de limpar
    if (!confirm('Tem certeza que deseja limpar a lista de presença? Os status serão resetados para "AUSENTE", mas os justificados permanecerão.')) {
      return
    }
    
    // Limpar apenas os status não justificados, mantendo os justificados
    const clearedAttendance = militaryAttendance.map(military => {
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

  const handleSaveAttendance = async () => {
    if (!selectedCallType) {
      toast({
        title: "Tipo de Chamada não selecionado",
        description: "Por favor, selecione o tipo de chamada antes de salvar.",
        variant: "destructive",
      })
      return
    }

    try {
      console.log('=== INICIANDO SALVAMENTO DE PRESENÇA ===')
      console.log('Tipo de chamada selecionado:', selectedCallType)
      console.log('Data:', today)
      console.log('Lista de presença:', militaryAttendance)
      
      // Remove registros existentes para hoje
      console.log('1. Removendo registros existentes...')
      const { error: deleteError } = await supabase
        .from("military_attendance_records")
        .delete()
        .eq("date", today)

      if (deleteError) {
        console.error('Erro ao deletar registros existentes:', deleteError)
        throw deleteError
      }
      console.log('Registros existentes removidos com sucesso')

      // Insere novos registros (incluindo militares justificados)
      const recordsToInsert = militaryAttendance.map((attendance) => ({
        military_id: attendance.militaryId,
        military_name: attendance.militaryName,
        rank: attendance.rank,
        call_type: selectedCallType,
        date: attendance.date,
        status: attendance.status, // Inclui "justificado" se for o caso
      }))

      console.log('2. Registros para inserir:', recordsToInsert)
      console.log('Quantidade de registros:', recordsToInsert.length)

      if (recordsToInsert.length > 0) {
        console.log('3. Inserindo novos registros...')
        const { data, error: insertError } = await supabase
          .from("military_attendance_records")
          .insert(recordsToInsert)
          .select()

        if (insertError) {
          console.error('Erro Supabase (insert):', insertError)
          console.error('Código do erro:', insertError.code)
          console.error('Mensagem do erro:', insertError.message)
          console.error('Detalhes do erro:', insertError.details)
          throw insertError
        }
        
        console.log('Registros inseridos com sucesso:', data)
      } else {
        console.log('Nenhum registro para inserir (todos estão justificados)')
      }

      console.log('=== SALVAMENTO CONCLUÍDO COM SUCESSO ===')

      toast({
        title: "✅ Presença Salva com Sucesso!",
        description: `Dados de presença salvos para ${callTypes.find(t => t.id === selectedCallType)?.label}. Agora você pode gerar o PDF ou enviar por email.`,
      })
      setShowPDFButton(true)
    } catch (error: any) {
      console.error("=== ERRO AO SALVAR PRESENÇA ===")
      console.error("Tipo do erro:", typeof error)
      console.error("Erro completo:", error)
      console.error("Mensagem do erro:", error?.message)
      console.error("Código do erro:", error?.code)
      console.error("Detalhes do erro:", error?.details)
      
      let errorMessage = "Erro ao salvar a presença."
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.code) {
        errorMessage = `Erro ${error.code}: ${errorMessage}`
      }
      
      toast({
        title: "Erro ao salvar",
        description: errorMessage,
        variant: "destructive",
      })
    }
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
        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-200">{totalCount}</p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-300">Presentes</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-700 dark:text-green-200">{presentCount}</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-300">Ausentes</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-700 dark:text-red-200">{absentCount}</p>
              </div>
              <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 dark:text-red-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Justificados</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-700 dark:text-blue-200">{justifiedCount}</p>
              </div>
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tipo de Chamada */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Settings className="h-6 w-6 text-red-600 dark:text-red-400" />
            Tipo de Chamada
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
                  {selectedCallType && callTypes.find(t => t.id === selectedCallType)?.label}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {callTypes.map((type) => (
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
            Militares ({format(new Date(), "dd/MM/yyyy")})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3">
            {allMilitary.map((military) => (
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
                        {military.status && attendanceStatuses.find(s => s.id === military.status)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {attendanceStatuses.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>
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
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
              <Button 
                onClick={handleSaveAttendance} 
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!selectedCallType}
              >
                <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Salvar Presença
              </Button>
              
              <Button 
                onClick={handleClearAttendance}
                variant="outline"
                className="h-12 sm:h-14 text-base sm:text-lg font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Limpar Lista
              </Button>
            </div>

            {/* Botões de PDF e Email */}
            {showPDFButton && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md mx-auto px-2 sm:px-0">
                  <PDFGenerator
                    militaryAttendance={allMilitary.map(military => {
                      // Buscar o motivo da justificativa se o militar estiver justificado
                      if (military.isJustified) {
                        // Buscar por nome completo ou apenas pelo nome
                        const justification = justifications.find(j => 
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
