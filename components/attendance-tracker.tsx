"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, User, Shield } from "lucide-react"
import { militaryPersonnel, callTypes, attendanceStatuses } from "@/lib/static-data"
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
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    const loadData = async () => {
      console.log('=== INICIANDO CARREGAMENTO DE DADOS ===')
      
      // 1. PRIMEIRO: Carregar justificativas
      console.log('1. Carregando justificativas...')
      await fetchJustifications()
      
      console.log('=== CARREGAMENTO DE DADOS CONCLUÍDO ===')
    }
    loadData()
    
    // Definir um tipo de chamada padrão
    if (callTypes.length > 0) {
      setSelectedCallType(callTypes[0].id)
      console.log('Tipo de chamada padrão definido:', callTypes[0].id)
    }
  }, [])

  // NOVO: useEffect separado para reagir às mudanças em justifications
  useEffect(() => {
    if (justifications.length > 0) {
      console.log('=== JUSTIFICATIVAS ATUALIZADAS, INICIALIZANDO LISTA ===')
      console.log('Justificativas disponíveis:', justifications)
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
    const { data: records, error } = await supabase
      .from("military_attendance_records")
      .select("*")
      .eq("date", today)
      .order("military_name", { ascending: true })

    if (error) {
      console.error("Error fetching attendance history:", error)
    } else if (records && records.length > 0) {
      // Atualiza o estado com os dados do banco
      const updatedAttendance = militaryPersonnel.map((military) => {
        const record = records.find((r) => r.military_id === military.id)
        // CORREÇÃO: Usar a mesma lógica de comparação de datas
        const isJustified = justifications.some(
          (justification) => {
            const justificationStart = justification.start_date
            const justificationEnd = justification.end_date
            const todayStr = today
            
            return justification.military_name === military.name &&
                   todayStr >= justificationStart &&
                   todayStr <= justificationEnd
          }
        )

        return {
          id: `att_${military.id}`,
          militaryId: military.id,
          militaryName: military.name,
          rank: military.rank,
          status: isJustified ? "justificado" : (record?.status || "ausente"),
          callType: record?.call_type || "",
          date: today,
          isJustified,
        }
      })
      setMilitaryAttendance(updatedAttendance)
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
        title: "Presença Salva!",
        description: `Retirada de faltas salva com sucesso para ${callTypes.find(t => t.id === selectedCallType)?.label}.`,
      })
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
      return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
    }
    
    switch (status) {
      case "presente":
        return "border-l-green-500"
      case "ausente":
      default:
        return "border-l-red-500"
    }
  }

  const getStatusIcon = (status: string, isJustified: boolean) => {
    if (isJustified) {
      return <Shield className="h-5 w-5 text-blue-500" />
    }
    
    switch (status) {
      case "presente":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "ausente":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  }

  // Agora mostra todos os militares, incluindo justificados
  const allMilitary = militaryAttendance

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tipo de Chamada</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCallType} onValueChange={(value) => {
            console.log('Tipo de chamada selecionado:', value)
            setSelectedCallType(value)
          }}>
            <SelectTrigger className="w-full max-w-md">
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
            <p className="text-sm text-muted-foreground mt-2">
              Tipo selecionado: {callTypes.find(t => t.id === selectedCallType)?.label}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Militares ({format(new Date(), "dd/MM/yyyy")})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {allMilitary.map((military) => (
              <div
                key={military.id}
                className={`flex items-center justify-between p-3 rounded-lg border-l-4 ${getStatusColor(military.status, military.isJustified)} bg-card hover:bg-accent/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(military.status, military.isJustified)}
                  <span className="font-medium">{military.rank} {military.militaryName}</span>
                </div>
                
                {military.isJustified ? (
                  // Para militares justificados, mostra apenas o status fixo
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-blue-600 font-medium">JUSTIFICADO</span>
                  </div>
                ) : (
                  // Para militares não justificados, mostra o dropdown
                  <Select 
                    value={military.status} 
                    onValueChange={(value) => handleStatusChange(military.militaryId, value)}
                  >
                    <SelectTrigger className="w-48">
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

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Ausente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Justificado</span>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveAttendance} 
              className="w-full"
              disabled={!selectedCallType}
            >
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { AttendanceTracker }
export default AttendanceTracker
