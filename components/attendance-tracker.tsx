"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, User, Shield, Save, Calendar, Users, Settings, RotateCcw, Lock, Unlock, Download, Search, Filter, BarChart3, Clock, AlertTriangle, CheckSquare, XSquare, Eye, EyeOff, RefreshCw, Zap, TrendingUp, Activity } from "lucide-react"
import { militaryPersonnel, callTypes, attendanceStatuses } from "@/lib/static-data"
import { PDFGenerator } from "@/components/pdf-generator"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { MilitaryAttendanceRecord } from "@/lib/types"
import { ErrorBoundary } from "@/components/error-boundary"

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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // Garantir que sempre usamos a data local do cliente
    const now = new Date()
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
    return format(localDate, "yyyy-MM-dd")
  })
  const [isBackdating, setIsBackdating] = useState(false)
  const [isListLocked, setIsListLocked] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Novos estados para melhorias
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [rankFilter, setRankFilter] = useState("all")
  const [showOnlyChanged, setShowOnlyChanged] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [lastChangeTime, setLastChangeTime] = useState<Date | null>(null)
  const [changeHistory, setChangeHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Funções para persistência no localStorage por data
  const saveAttendanceToLocalStorage = (attendance: MilitaryAttendance[], date: string, callType: string) => {
    try {
      const data = {
        attendance,
        date,
        callType,
        timestamp: new Date().toISOString(),
        isLocked: isListLocked
      }
      
      // Salvar por data específica
      const key = `poker_attendance_${date}`
      localStorage.setItem(key, JSON.stringify(data))
      
      // Também salvar como backup geral (para compatibilidade)
      localStorage.setItem('poker_attendance_backup', JSON.stringify(data))
      
      setLastSaved(new Date())
      console.log(`💾 Lista de presença salva no localStorage para ${date}`)
    } catch (error) {
      console.error('❌ Erro ao salvar no localStorage:', error)
    }
  }

  const loadAttendanceFromLocalStorage = (date?: string) => {
    try {
      const targetDate = date || selectedDate
      const key = `poker_attendance_${targetDate}`
      const saved = localStorage.getItem(key)
      
      if (saved) {
        const data = JSON.parse(saved)
        console.log(`📱 Lista de presença carregada do localStorage para ${targetDate}:`, data)
        return data
      }
      
      // Fallback para o backup geral se não encontrar por data
      const fallback = localStorage.getItem('poker_attendance_backup')
      if (fallback) {
        const data = JSON.parse(fallback)
        console.log('📱 Usando backup geral do localStorage:', data)
        return data
      }
    } catch (error) {
      console.error('❌ Erro ao carregar do localStorage:', error)
    }
    return null
  }

  // Nova função para carregar dados por data específica
  const loadAttendanceForDate = async (date: string) => {
    console.log(`🔄 Carregando dados para a data: ${date}`)
    
    // 1. Primeiro tentar carregar do localStorage
    const savedData = loadAttendanceFromLocalStorage(date)
    if (savedData && savedData.attendance && savedData.attendance.length > 0) {
      console.log('✅ Dados encontrados no localStorage para a data:', date)
      setMilitaryAttendance(savedData.attendance)
      setSelectedCallType(savedData.callType || '')
      setIsListLocked(savedData.isLocked || false)
      setLastSaved(new Date(savedData.timestamp))
      return
    }
    
    // 2. Se não encontrar no localStorage, carregar do servidor
    console.log('🔍 Buscando dados no servidor para a data:', date)
    try {
      await fetchJustifications()
      await fetchAttendanceHistory()
    } catch (error) {
      console.error('Erro ao carregar dados do servidor:', error)
    }
  }

  const clearAttendanceFromLocalStorage = () => {
    try {
      localStorage.removeItem('poker_attendance_backup')
      console.log('🗑️ Backup da lista de presença removido')
    } catch (error) {
      console.error('❌ Erro ao limpar localStorage:', error)
    }
  }

  const toggleListLock = () => {
    const newLockState = !isListLocked
    setIsListLocked(newLockState)
    
    // Salvar estado de travamento
    if (militaryAttendance.length > 0) {
      saveAttendanceToLocalStorage(militaryAttendance, selectedDate, selectedCallType)
    }
    
    toast({
      title: newLockState ? "🔒 Lista Travada" : "🔓 Lista Destravada",
      description: newLockState 
        ? "A lista está protegida contra alterações acidentais" 
        : "A lista pode ser editada normalmente",
    })
  }

  const saveCurrentState = () => {
    if (militaryAttendance.length > 0 && selectedCallType) {
      saveAttendanceToLocalStorage(militaryAttendance, selectedDate, selectedCallType)
      toast({
        title: "💾 Lista Salva",
        description: "A lista foi salva localmente e será restaurada se o celular bloquear",
      })
    }
  }

  // Auto-save a cada 30 segundos
  useEffect(() => {
    if (militaryAttendance.length > 0 && selectedCallType) {
      const interval = setInterval(() => {
        if (!isListLocked) {
          saveAttendanceToLocalStorage(militaryAttendance, selectedDate, selectedCallType)
        }
      }, 30000) // 30 segundos

      return () => clearInterval(interval)
    }
  }, [militaryAttendance, selectedDate, selectedCallType, isListLocked])

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('=== INICIANDO CARREGAMENTO DE DADOS ===')
        console.log('militaryPersonnel disponível:', militaryPersonnel)
        console.log('callTypes disponível:', callTypes)
        
        // 1. PRIMEIRO: Verificar se há dados salvos no localStorage
        const savedData = loadAttendanceFromLocalStorage()
        if (savedData && savedData.attendance && savedData.attendance.length > 0) {
          console.log('🔄 Restaurando lista de presença do localStorage...')
          setMilitaryAttendance(savedData.attendance)
          setSelectedCallType(savedData.callType || '')
          setIsListLocked(savedData.isLocked || false)
          setLastSaved(new Date(savedData.timestamp))
          console.log('✅ Lista restaurada com sucesso!')
          
          // Se a lista está travada, não carregar dados do servidor
          if (savedData.isLocked) {
            console.log('🔒 Lista travada - mantendo dados locais')
            return
          }
        }
        
        // 1. PRIMEIRO: Carregar justificativas
        console.log('1. Carregando justificativas...')
        await fetchJustifications()
        
        console.log('=== CARREGAMENTO DE DADOS CONCLUÍDO ===')
      } catch (error) {
        console.error('❌ Erro crítico ao carregar dados:', error)
        
        // Tratamento de erro mais específico
        if (error instanceof Error) {
          console.error('Detalhes do erro:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        }
        
        // Mostrar toast de erro
        toast({
          title: "Erro ao Carregar",
          description: "Não foi possível carregar os dados. Verifique sua conexão.",
          variant: "destructive"
        })
        
        console.log('Continuando com dados estáticos...')
      }
    }
    
    // Adicionar delay para garantir que o componente está montado
    const timeoutId = setTimeout(() => {
      loadData()
    }, 100)
    
    return () => clearTimeout(timeoutId)
    
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
    if (justifications.length > 0) { // Volta para > 0 para evitar loop
      console.log('=== JUSTIFICATIVAS ATUALIZADAS, INICIALIZANDO LISTA ===')
      console.log('Justificativas disponíveis:', justifications)
      console.log('militaryPersonnel disponível:', militaryPersonnel)
      initializeAttendance()
      fetchAttendanceHistory()
    }
  }, [justifications.length]) // Dependência apenas do length para evitar loop

  // useEffect para reagir às mudanças de data
  useEffect(() => {
    if (selectedDate) {
      console.log('=== DATA ALTERADA, RECARREGANDO DADOS ===')
      console.log('Nova data selecionada:', selectedDate)
      
      // Carregar dados para a nova data
      loadAttendanceForDate(selectedDate)
    }
  }, [selectedDate])

  const fetchJustifications = async () => {
    console.log("Buscando justificativas para a data:", selectedDate)
    console.log("Data selecionada formatada:", selectedDate)
    
    try {
      // Primeiro, buscar TODAS as justificativas para debug
      const { data: allRecords, error: allError } = await (supabase as any)
        .from("military_justifications")
        .select("*")

      if (allError) {
        console.error("Error fetching all justifications:", allError)
        // Se houver erro, usar dados mockados para teste
        console.log("Usando dados mockados para justificativas...")
        const mockJustifications = [
          {
            id: '1',
            military_id: '30',
            military_name: '3S HENRIQUE',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '2',
            military_id: '27',
            military_name: '3S JAQUES',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '3',
            military_id: '25',
            military_name: '3S MAIA',
            start_date: '2025-09-22',
            end_date: '2025-10-02',
            reason: 'FÉRIAS',
            approved: true
          },
          {
            id: '4',
            military_id: '23',
            military_name: '3S PITTIGLIANI',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '5',
            military_id: '14',
            military_name: 'SO ELIASAFE',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '6',
            military_id: '11',
            military_name: 'CP MAIRINK',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '7',
            military_id: '10',
            military_name: 'CP EDUARDO',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '8',
            military_id: '9',
            military_name: 'CP FELIPPE MIRANDA',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '9',
            military_id: '7',
            military_name: 'CP ALMEIDA',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '10',
            military_id: '8',
            military_name: 'CP JÚNIOR',
            start_date: '2025-09-22',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '11',
            military_id: '6',
            military_name: 'CP SPINELLI',
            start_date: '2025-09-22',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '12',
            military_id: '5',
            military_name: 'CP FARIAS',
            start_date: '2025-09-22',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '13',
            military_id: '3',
            military_name: 'CP MIRANDA',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '14',
            military_id: '2',
            military_name: 'MJ MAIA',
            start_date: '2025-09-22',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '15',
            military_id: '1',
            military_name: 'TC CARNEIRO',
            start_date: '2025-09-21',
            end_date: '2025-10-11',
            reason: 'Operação Atlas',
            approved: true
          },
          {
            id: '16',
            military_id: '15',
            military_name: 'MENEZES',
            start_date: '2025-09-01',
            end_date: '2025-09-01',
            reason: 'PROFESP',
            approved: true
          },
          {
            id: '17',
            military_id: '34',
            military_name: 'DA ROSA',
            start_date: '2025-08-31',
            end_date: '2025-09-09',
            reason: 'Férias',
            approved: true
          },
          {
            id: '18',
            military_id: '24',
            military_name: 'L. TEIXEIRA',
            start_date: '2025-03-31',
            end_date: '2025-11-15',
            reason: 'Licença Maternidade',
            approved: true
          },
          {
            id: '19',
            military_id: '12',
            military_name: 'ISMAEL',
            start_date: '2025-05-31',
            end_date: '2025-09-30',
            reason: 'Missão Acolhida em Boa Vista',
            approved: true
          }
        ]
        
        // Filtrar justificativas válidas para a data selecionada
        const validJustifications = mockJustifications.filter(j => {
          const startDate = j.start_date
          const endDate = j.end_date
          return selectedDate >= startDate && selectedDate <= endDate
        })
        
        console.log("Justificativas mockadas válidas para a data selecionada:", validJustifications)
        setJustifications(validJustifications)
        return
      } else {
        console.log("TODAS as justificativas no banco:", allRecords)
        
        // Debug das datas de cada justificativa
        if (allRecords && allRecords.length > 0) {
          allRecords.forEach((record: any, index: number) => {
            console.log(`Justificativa ${index + 1}:`, {
              military_name: record.military_name,
              start_date: record.start_date,
              end_date: record.end_date,
              start_date_type: typeof record.start_date,
              end_date_type: typeof record.end_date,
              today: selectedDate,
              today_type: typeof selectedDate
            })
          })
        }
      }
      
      // Agora buscar apenas as válidas para a data selecionada
      const { data: records, error } = await (supabase as any)
        .from("military_justifications")
        .select("*")
        .lte("start_date", selectedDate)
        .gte("end_date", selectedDate)

      if (error) {
        console.error("Error fetching justifications for selected date:", error)
        setJustifications([])
      } else {
        console.log("Justificativas válidas para a data selecionada:", records)
        setJustifications(records || [])
      }
    } catch (error) {
      console.error("Erro geral ao buscar justificativas:", error)
      setJustifications([])
    }
  }

  const initializeAttendance = () => {
    console.log("Inicializando lista de presença...")
    console.log("Justificativas disponíveis:", justifications)
    console.log("Data selecionada:", selectedDate)
    
    const initialAttendance = militaryPersonnel.map((military) => {
      // CORREÇÃO: Comparar datas como strings para evitar problemas de timezone
      const isJustified = justifications.some(
        (justification: any) => {
          const justificationStart = justification.start_date
          const justificationEnd = justification.end_date
          const todayStr = selectedDate
          
          console.log(`=== VERIFICAÇÃO DETALHADA PARA ${military.rank} ${military.name} ===`)
          console.log('Justificativa sendo verificada:', {
            military_name: justification.military_name,
            start_date: justificationStart,
            end_date: justificationEnd,
            today: todayStr
          })
          
          // CORREÇÃO: Verificar correspondência de nomes considerando diferentes formatos
          let nameMatch = false
          
          // Formato 1: Comparação exata
          if (justification.military_name === military.name) {
            nameMatch = true
          }
          // Formato 2: Justificativa tem formato "RANK NOME", militar tem "NOME" e "RANK" separados
          else if (justification.military_name === `${military.rank} ${military.name}`) {
            nameMatch = true
          }
          // Formato 3: Justificativa tem apenas o nome, militar tem "RANK NOME"
          else if (justification.military_name === military.name && military.rank) {
            nameMatch = true
          }
          // Formato 4: Busca por correspondência parcial (para casos especiais)
          else if (justification.military_name.includes(military.name) || military.name.includes(justification.military_name)) {
            nameMatch = true
          }
          
          const dateRange = selectedDate >= justificationStart && selectedDate <= justificationEnd
          
          console.log('Resultados da verificação:', {
            justification_name: justification.military_name,
            military_name: military.name,
            military_rank: military.rank,
            name_match: nameMatch,
            date_range: dateRange,
            start_date_check: `${selectedDate} >= ${justificationStart} = ${selectedDate >= justificationStart}`,
            end_date_check: `${selectedDate} <= ${justificationEnd} = ${selectedDate <= justificationEnd}`
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
        date: selectedDate,
        isJustified,
      }
    })
    console.log("Lista de presença inicializada:", initialAttendance)
    setMilitaryAttendance(initialAttendance)
  }

  const fetchAttendanceHistory = async () => {
    console.log("Buscando histórico de presença para:", selectedDate)
    
    try {
      const { data: records, error } = await (supabase as any)
        .from("military_attendance_records")
        .select("*")
        .eq("date", selectedDate)

      if (error) {
        console.error("Error fetching attendance history:", error)
        console.log("Usando dados estáticos para histórico de presença")
        return
      } else if (records && records.length > 0) {
        // Atualiza o estado com os dados do banco
        const updatedAttendance = militaryPersonnel.map((military) => {
          const record = records.find((r: any) => r.military_id === military.id)
          const isJustified = justifications.some(
            (justification: any) => {
              // CORREÇÃO: Verificar correspondência de nomes considerando diferentes formatos
              let nameMatch = false
              
              // Formato 1: Comparação exata
              if (justification.military_name === military.name) {
                nameMatch = true
              }
              // Formato 2: Justificativa tem formato "RANK NOME", militar tem "NOME" e "RANK" separados
              else if (justification.military_name === `${military.rank} ${military.name}`) {
                nameMatch = true
              }
              // Formato 3: Justificativa tem apenas o nome, militar tem "RANK NOME"
              else if (justification.military_name === military.name && military.rank) {
                nameMatch = true
              }
              // Formato 4: Busca por correspondência parcial (para casos especiais)
              else if (justification.military_name.includes(military.name) || military.name.includes(justification.military_name)) {
                nameMatch = true
              }
              
              const dateRange = selectedDate >= justification.start_date && selectedDate <= justification.end_date
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
            date: selectedDate,
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
    const oldAttendance = militaryAttendance.find(m => m.militaryId === militaryId)
    
    setMilitaryAttendance(prev => 
      prev.map((military: any) => 
        military.militaryId === militaryId 
          ? { ...military, status: newStatus }
          : military
      )
    )
    
    // Registrar mudança no histórico
    if (oldAttendance && oldAttendance.status !== newStatus) {
      const change = {
        id: Date.now(),
        militaryId,
        militaryName: oldAttendance.militaryName,
        rank: oldAttendance.rank,
        oldStatus: oldAttendance.status,
        newStatus,
        timestamp: new Date(),
        user: 'Sistema'
      }
      setChangeHistory(prev => [change, ...prev.slice(0, 49)]) // Manter apenas 50 mudanças
      setLastChangeTime(new Date())
    }
  }

  // Funções de filtro e busca
  const getFilteredMilitary = () => {
    let filtered = militaryAttendance

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(military => 
        military.militaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        military.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${military.rank} ${military.militaryName}`.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtro por status
    if (statusFilter !== "all") {
      if (statusFilter === "justified") {
        filtered = filtered.filter(military => military.isJustified)
      } else {
        filtered = filtered.filter(military => military.status === statusFilter && !military.isJustified)
      }
    }

    // Filtro por patente
    if (rankFilter !== "all") {
      filtered = filtered.filter(military => military.rank === rankFilter)
    }

    // Filtro por alterações
    if (showOnlyChanged) {
      filtered = filtered.filter(military => 
        changeHistory.some(change => change.militaryId === military.militaryId)
      )
    }

    return filtered
  }

  const getUniqueRanks = () => {
    const ranks = [...new Set(militaryPersonnel.map(m => m.rank))]
    return ranks.sort()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setRankFilter("all")
    setShowOnlyChanged(false)
  }

  const getStatsData = () => {
    const total = militaryAttendance.length
    const present = militaryAttendance.filter(m => m.status === "presente" && !m.isJustified).length
    const absent = militaryAttendance.filter(m => m.status === "ausente" && !m.isJustified).length
    const justified = militaryAttendance.filter(m => m.isJustified).length
    const changed = changeHistory.length
    
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    
    return { total, present, absent, justified, changed, percentage }
  }

  // Função para listar datas com dados salvos
  const getAvailableDates = () => {
    const dates = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('poker_attendance_')) {
        const date = key.replace('poker_attendance_', '')
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}')
          if (data.attendance && data.attendance.length > 0) {
            dates.push({
              date,
              callType: data.callType,
              timestamp: data.timestamp,
              count: data.attendance.length
            })
          }
        } catch (error) {
          console.error('Erro ao processar dados salvos:', error)
        }
      }
    }
    return dates.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  // Função para verificar se há dados salvos para a data atual
  const hasDataForDate = (date: string) => {
    const key = `poker_attendance_${date}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        return data.attendance && data.attendance.length > 0
      } catch (error) {
        return false
      }
    }
    return false
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

  const handleSaveAttendance = async () => {
    if (!selectedCallType) {
      toast({
        title: "Tipo de Chamada não selecionado",
        description: "Por favor, selecione o tipo de chamada antes de salvar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      console.log('=== INICIANDO SALVAMENTO DE PRESENÇA ===')
      console.log('Tipo de chamada selecionado:', selectedCallType)
      console.log('Data:', selectedDate)
      console.log('Lista de presença:', militaryAttendance)
      
      // Remove registros existentes para a data selecionada
      console.log('1. Removendo registros existentes...')
      const { error: deleteError } = await (supabase as any)
        .from("military_attendance_records")
        .delete()
        .eq("date", selectedDate)

      if (deleteError) {
        console.error('Erro ao deletar registros existentes:', deleteError)
        throw deleteError
      }
      console.log('Registros existentes removidos com sucesso')

      // Insere novos registros (incluindo militares justificados)
      const recordsToInsert = militaryAttendance.map((attendance: any) => {
        // Buscar justificativa correspondente se o militar está justificado
        let justificationId = null
        if (attendance.isJustified) {
          const justification = justifications.find((j: any) => {
            // CORREÇÃO: Verificar correspondência de nomes considerando diferentes formatos
            let nameMatch = false
            
            // Formato 1: Comparação exata
            if (j.military_name === attendance.militaryName) {
              nameMatch = true
            }
            // Formato 2: Justificativa tem formato "RANK NOME", militar tem "NOME" e "RANK" separados
            else if (j.military_name === `${attendance.rank} ${attendance.militaryName}`) {
              nameMatch = true
            }
            // Formato 3: Justificativa tem apenas o nome, militar tem "RANK NOME"
            else if (j.military_name === attendance.militaryName && attendance.rank) {
              nameMatch = true
            }
            // Formato 4: Busca por correspondência parcial (para casos especiais)
            else if (j.military_name.includes(attendance.militaryName) || attendance.militaryName.includes(j.military_name)) {
              nameMatch = true
            }
            
            const dateRange = selectedDate >= j.start_date && selectedDate <= j.end_date
            return nameMatch && dateRange
          })
          justificationId = justification?.id || null
        }
        
        return {
          military_id: attendance.militaryId,
          military_name: attendance.militaryName,
          rank: attendance.rank,
          call_type: selectedCallType,
          date: attendance.date,
          status: attendance.status, // Inclui "justificado" se for o caso
          justification_id: justificationId
        }
      })

      console.log('2. Registros para inserir:', recordsToInsert)
      console.log('Quantidade de registros:', recordsToInsert.length)

      if (recordsToInsert.length > 0) {
        console.log('3. Inserindo novos registros...')
        const { data, error: insertError } = await (supabase as any)
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
        description: `Dados de presença salvos para ${callTypes.find((t: any) => t.id === selectedCallType)?.label}. Agora você pode gerar o PDF ou enviar por email.`,
      })
      setShowPDFButton(true)
      setLastSaved(new Date())
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
    } finally {
      setIsLoading(false)
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
  const filteredMilitary = getFilteredMilitary()
  const stats = getStatsData()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cards de estatísticas melhorados */}
      {showStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.present}
                </span>
              </div>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">Presentes</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {stats.percentage}% do total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {stats.absent}
                </span>
              </div>
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Ausentes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.justified}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Justificados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.changed}
                </span>
              </div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Alterações</p>
              {lastChangeTime && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  Última: {format(lastChangeTime, "HH:mm")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controles de filtro e busca */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Filter className="h-6 w-6 text-red-600 dark:text-red-400" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por nome */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Buscar por nome
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Digite o nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 rounded-md transition-colors duration-200 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Filtro por status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="presente">Presentes</SelectItem>
                  <SelectItem value="ausente">Ausentes</SelectItem>
                  <SelectItem value="justified">Justificados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por patente */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Patente
              </label>
              <Select value={rankFilter} onValueChange={setRankFilter}>
                <SelectTrigger className="border-2 border-slate-200 hover:border-red-400 focus:border-red-500 dark:border-slate-600 dark:hover:border-red-500 dark:focus:border-red-400 transition-colors duration-200">
                  <SelectValue placeholder="Todas as patentes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {getUniqueRanks().map(rank => (
                    <SelectItem key={rank} value={rank}>{rank}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Controles adicionais */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Opções
              </label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowOnlyChanged(!showOnlyChanged)}
                  className={`w-full ${showOnlyChanged ? 'bg-orange-100 dark:bg-orange-900' : ''}`}
                >
                  {showOnlyChanged ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showOnlyChanged ? 'Mostrar Todos' : 'Só Alterados'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Data */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-slate-100">
            <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
            Data da Chamada
            {hasDataForDate(selectedDate) && (
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-full">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                  Dados Salvos
                </span>
              </div>
            )}
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
            <div className="flex flex-col gap-2">
              {isBackdating && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                  <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Lançando presença em data passada
                  </span>
                </div>
              )}
              {hasDataForDate(selectedDate) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Dados salvos para esta data
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Lista de datas disponíveis */}
          {getAvailableDates().length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Datas com dados salvos:
              </h4>
              <div className="flex flex-wrap gap-2">
                {getAvailableDates().slice(0, 5).map((dateInfo) => (
                  <button
                    key={dateInfo.date}
                    onClick={() => {
                      setSelectedDate(dateInfo.date)
                      setIsBackdating(dateInfo.date !== format(new Date(), "yyyy-MM-dd"))
                    }}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selectedDate === dateInfo.date
                        ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-300'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {format(new Date(dateInfo.date), "dd/MM")}
                    {dateInfo.callType && (
                      <span className="ml-1 text-xs opacity-75">
                        ({callTypes.find(t => t.id === dateInfo.callType)?.label || dateInfo.callType})
                      </span>
                    )}
                  </button>
                ))}
                {getAvailableDates().length > 5 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    +{getAvailableDates().length - 5} mais
                  </span>
                )}
              </div>
            </div>
          )}
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
          {/* Contador de resultados */}
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Mostrando {filteredMilitary.length} de {allMilitary.length} militares
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(!showStats)}
                  className="text-slate-600 dark:text-slate-400"
                >
                  {showStats ? <BarChart3 className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  className={`text-slate-600 dark:text-slate-400 ${autoSaveEnabled ? 'text-green-600 dark:text-green-400' : ''}`}
                >
                  <Zap className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            {filteredMilitary.map((military: any) => (
              <div
                key={military.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-xl border-l-4 ${getStatusColor(military.status, military.isJustified)} bg-white dark:bg-slate-800 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group ${
                  changeHistory.some(change => change.militaryId === military.militaryId) 
                    ? 'ring-2 ring-orange-200 dark:ring-orange-800' 
                    : ''
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-0">
                  <div className="p-1.5 sm:p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    {getStatusIcon(military.status, military.isJustified)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200">
                        {military.rank} {military.militaryName}
                      </span>
                      {changeHistory.some(change => change.militaryId === military.militaryId) && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 rounded-full">
                          <Clock className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                          <span className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                            Alterado
                          </span>
                        </div>
                      )}
                    </div>
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
            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
              <Button 
                onClick={handleSaveAttendance} 
                className="flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!selectedCallType || isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                )}
                {isLoading ? 'Salvando...' : 'Salvar Presença'}
              </Button>
              
              <Button 
                onClick={handleClearAttendance}
                variant="outline"
                className="h-12 sm:h-14 text-base sm:text-lg font-semibold border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Limpar Lista
              </Button>
              
              <Button 
                onClick={saveCurrentState}
                variant="outline"
                className="h-12 sm:h-14 text-base sm:text-lg font-semibold border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Salvar Local
              </Button>
            </div>

            {/* Status de salvamento */}
            {lastSaved && (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                <span>Último salvamento: {format(lastSaved, "dd/MM/yyyy HH:mm")}</span>
              </div>
            )}

            {/* Indicador de auto-save */}
            {autoSaveEnabled && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Zap className="h-4 w-4" />
                <span>Auto-save ativado (30s)</span>
              </div>
            )}

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

// Componente principal com Error Boundary
const AttendanceTrackerWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <AttendanceTracker />
    </ErrorBoundary>
  )
}

export { AttendanceTracker }
export default AttendanceTrackerWithErrorBoundary
