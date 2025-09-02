"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { format, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { militaryPersonnel } from "@/lib/static-data"
import { useIsMobile } from "@/hooks/use-mobile"

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
 * Exporta dados para CSV
 */
function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("Nenhum dado para exportar")
    return
  }

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`
        }
        return value || ''
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Gera PDF usando jsPDF (fallback para quando a biblioteca não estiver disponível)
 */
function generatePDF(data: any[], filename: string, title: string, columns: string[]) {
  if (data.length === 0) {
    alert("Nenhum dado para exportar")
    return
  }

  try {
    // Tentar usar jsPDF se disponível
    if (typeof window !== 'undefined' && (window as any).jsPDF) {
      const { jsPDF } = (window as any).jsPDF
      const doc = new jsPDF()
      
      // Título do documento
      doc.setFontSize(18)
      doc.text(title, 14, 22)
      doc.setFontSize(12)
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30)
      doc.text(`Total de registros: ${data.length}`, 14, 37)
      
      // Preparar dados para a tabela
      const tableData = data.map(row => 
        columns.map(col => {
          const value = row[col]
          if (value === null || value === undefined) return ''
          if (typeof value === 'string' && value.length > 50) {
            return value.substring(0, 50) + '...'
          }
          return String(value)
        })
      )
      
      // Adicionar tabela
      if ((doc as any).autoTable) {
        (doc as any).autoTable({
          head: [columns],
          body: tableData,
          startY: 45,
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          }
        })
      }
      
      // Salvar PDF
      doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`)
    } else {
      // Fallback: criar PDF simples usando canvas
      createSimplePDF(data, filename, title, columns)
    }
  } catch (error) {
    console.error("Erro ao gerar PDF:", error)
    // Fallback para CSV
    exportToCSV(data, filename)
    alert("Erro ao gerar PDF. Arquivo CSV foi gerado como alternativa.")
  }
}

/**
 * Cria PDF simples usando canvas (fallback)
 */
function createSimplePDF(data: any[], filename: string, title: string, columns: string[]) {
  // Criar um canvas para renderizar o conteúdo
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = 800
  canvas.height = Math.max(600, data.length * 20 + 100)
  
  // Configurar estilo
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Título
  ctx.fillStyle = '#2c3e50'
  ctx.font = 'bold 24px Arial'
  ctx.textAlign = 'center'
  ctx.fillText(title, canvas.width / 2, 40)
  
  // Informações
  ctx.font = '14px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 70)
  ctx.fillText(`Total de registros: ${data.length}`, 20, 90)
  
  // Cabeçalho da tabela
  ctx.fillStyle = '#3498db'
  ctx.fillRect(20, 110, canvas.width - 40, 30)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 12px Arial'
  ctx.textAlign = 'center'
  
  const colWidth = (canvas.width - 40) / columns.length
  columns.forEach((col, index) => {
    ctx.fillText(col, 20 + colWidth * index + colWidth / 2, 130)
  })
  
  // Dados da tabela
  ctx.fillStyle = '#2c3e50'
  ctx.font = '10px Arial'
  ctx.textAlign = 'center'
  
  data.forEach((row, rowIndex) => {
    const y = 160 + rowIndex * 20
    if (y > canvas.height - 40) return // Evitar overflow
    
    columns.forEach((col, colIndex) => {
      const value = row[col]
      const text = value ? String(value).substring(0, 20) : ''
      ctx.fillText(text, 20 + colWidth * colIndex + colWidth / 2, y)
    })
  })
  
  // Converter para PDF usando canvas
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.png`
      link.click()
      URL.revokeObjectURL(url)
    }
  })
}

  /**
   * Gera relatório completo em PDF
   */
  function generateCompleteReport() {
    try {
      if (typeof window !== 'undefined' && (window as any).jsPDF) {
        const { jsPDF } = (window as any).jsPDF
        const doc = new jsPDF()
        
        // Título principal
        doc.setFontSize(20)
        doc.text('RELATÓRIO COMPLETO DO SISTEMA', 14, 22)
        doc.setFontSize(12)
        doc.text(`Esquadrão - ${new Date().toLocaleString('pt-BR')}`, 14, 30)
        
        let currentY = 40
        
        // Seção de Presença
        if (attendanceRecords.length > 0) {
          doc.setFontSize(16)
          doc.text('1. HISTÓRICO DE PRESENÇA', 14, currentY)
          currentY += 10
          
          const attendanceData = attendanceRecords.map(r => [
            `${r.rank} ${r.military_name}`,
            formatDate(r.date),
            r.status,
            r.justification_id ? 'Sim' : 'Não'
          ])
          
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [['Militar', 'Data', 'Status', 'Justificativa']],
              body: attendanceData,
              startY: currentY,
              styles: { fontSize: 8 }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
          }
        }
        
        // Seção de Justificativas
        if (justificationRecords.length > 0) {
          doc.setFontSize(16)
          doc.text('2. HISTÓRICO DE JUSTIFICATIVAS', 14, currentY)
          currentY += 10
          
          const justificationData = justificationRecords.map(r => [
            r.military_name,
            r.type,
            `${formatDate(r.start_date)} - ${formatDate(r.end_date)}`,
            r.approved ? 'Aprovada' : 'Pendente'
          ])
          
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [['Militar', 'Tipo', 'Período', 'Status']],
              body: justificationData,
              startY: currentY,
              styles: { fontSize: 8 }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
          }
        }
        
        // Seção de Eventos
        if (eventRecords.length > 0) {
          doc.setFontSize(16)
          doc.text('3. HISTÓRICO DE EVENTOS', 14, currentY)
          currentY += 10
          
          const eventData = eventRecords.map(r => [
            r.title,
            formatDate(r.date),
            r.time || '—',
            r.created_by_military_id ? 'Sim' : 'Não'
          ])
          
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [['Título', 'Data', 'Horário', 'Responsável']],
              body: eventData,
              startY: currentY,
              styles: { fontSize: 8 }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
          }
        }
        
        // Seção de Voos
        if (flightRecords.length > 0) {
          doc.setFontSize(16)
          doc.text('4. HISTÓRICO DE VOOS', 14, currentY)
          currentY += 10
          
          const flightData = flightRecords.map(r => [
            formatDate(r.flight_date),
            r.flight_time,
            r.military_ids ? JSON.parse(r.military_ids).length : 0
          ])
          
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [['Data', 'Horário Zulu', 'Militares']],
              body: flightData,
              startY: currentY,
              styles: { fontSize: 8 }
            })
            currentY = (doc as any).lastAutoTable.finalY + 10
          }
        }
        
        // Seção de Permanência
        if (permanenceRecords.length > 0) {
          doc.setFontSize(16)
          doc.text('5. HISTÓRICO DE PERMANÊNCIA', 14, currentY)
          currentY += 10
          
          const permanenceData = permanenceRecords.map(r => [
            `${r.rank} ${r.military_name}`,
            formatDate(r.date),
            r.status
          ])
          
          if ((doc as any).autoTable) {
            (doc as any).autoTable({
              head: [['Militar', 'Data', 'Status']],
              body: permanenceData,
              startY: currentY,
              styles: { fontSize: 8 }
            })
          }
        }
        
        // Salvar PDF
        doc.save(`relatorio-completo-${new Date().toISOString().split('T')[0]}.pdf`)
      } else {
        alert("Biblioteca jsPDF não disponível. Use os botões individuais de cada aba.")
      }
    } catch (error) {
      console.error("Erro ao gerar relatório completo:", error)
      alert("Erro ao gerar relatório completo. Use os botões individuais de cada aba.")
    }
  }

  /**
   * Exporta todos os dados para CSV
   */
  function exportAllToCSV() {
    // Exportar cada seção individualmente
    alert("Exportando cada seção individualmente...")
    
    if (attendanceRecords.length > 0) exportToCSV(attendanceRecords, 'historico-presenca')
    if (justificationRecords.length > 0) exportToCSV(justificationRecords, 'historico-justificativas')
    if (eventRecords.length > 0) exportToCSV(eventRecords, 'historico-eventos')
    if (flightRecords.length > 0) exportToCSV(flightRecords, 'historico-voos')
    if (permanenceRecords.length > 0) exportToCSV(permanenceRecords, 'historico-permanencia')
    if (personalNoteRecords.length > 0) exportToCSV(personalNoteRecords, 'historico-notas')
    if (keyHistoryRecords.length > 0) exportToCSV(keyHistoryRecords, 'historico-chaves')
    
    // Mostrar resumo
    setTimeout(() => {
      alert(`Exportação concluída!\n\nTotal de arquivos CSV gerados:\n` +
        `• Presença: ${attendanceRecords.length} registros\n` +
        `• Justificativas: ${justificationRecords.length} registros\n` +
        `• Eventos: ${eventRecords.length} registros\n` +
        `• Voos: ${flightRecords.length} registros\n` +
        `• Permanência: ${permanenceRecords.length} registros\n` +
        `• Notas: ${personalNoteRecords.length} registros\n` +
        `• Chaves: ${keyHistoryRecords.length} registros`)
    }, 1000)
  }

  /**
   * Faz SELECT * em <tableName>, mas devolve [] se a tabela não existir
   * (error.code === "42P01") ou se outro erro acontecer.
   */
  async function fetchTableSafe<T>(tableName: string): Promise<T[]> {
    console.log(`🔍 Tentando buscar dados da tabela: ${tableName}`)
    
    try {
      const { data, error } = await supabase.from(tableName).select("*")
      
      if (error) {
        if (error.code === "42P01") {
          console.warn(`⚠️ Tabela '${tableName}' não encontrada — ignorando.`)
          return []
        }
        console.error(`❌ Erro ao buscar '${tableName}':`, error)
        return []
      }
      
      console.log(`✅ Tabela '${tableName}' carregada com sucesso:`, data?.length || 0, "registros")
      return (data as T[]) ?? []
      
    } catch (catchError) {
      console.error(`💥 Erro inesperado ao buscar '${tableName}':`, catchError)
      return []
    }
  }

  /**
   * Busca histórico de chaves com detalhes das chaves (nome e número da sala)
   */
  async function fetchKeyHistoryWithDetails(): Promise<KeyHistoryRecord[]> {
    try {
      const { data, error } = await supabase
        .from("claviculario_movements")
        .select(`
          *,
          claviculario_keys (
            room_name,
            room_number
          )
        `)
        .order("timestamp", { ascending: false })

      if (error) {
        if (error.code === "42P01") {
          console.warn("Tabela 'claviculario_movements' não encontrada — ignorando.")
          return []
        }
        console.error("Erro ao buscar histórico de chaves:", error)
        return []
      }

      // Processar os dados para incluir informações das chaves
      const processedData = (data || []).map(record => ({
        id: record.id,
        key_id: record.key_id,
        key_name: record.claviculario_keys?.room_name || "Chave não encontrada",
        key_number: record.claviculario_keys?.room_number || null,
        military_id: record.military_id,
        military_name: record.military_name || "Militar não encontrado",
        military_rank: record.military_rank || "",
        type: record.type,
        timestamp: record.timestamp,
        notes: record.notes,
        created_at: record.created_at
      }))

      return processedData
    } catch (error) {
      console.error("Erro ao buscar histórico de chaves com detalhes:", error)
      return []
    }
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
  time: string
  created_by_military_id: string | null
  created_at: string
  updated_at: string
}

interface FlightRecord {
  id: string
  flight_date: string
  flight_time: string
  military_ids: string
  created_at: string
  updated_at: string
}

interface PermanenceRecord {
  id: string
  military_id: string
  military_name: string
  rank: string
  date: string
  status: string
  details: string
  created_at: string
  updated_at: string
}

interface PersonalNoteRecord {
  id: string
  military_name: string
  date: string
  note_content: string
}

interface KeyHistoryRecord {
  id: string
  key_id: string
  key_name: string | null
  key_number: string | null
  military_id: string | null
  military_name: string | null
  military_rank: string | null
  type: string
  timestamp: string
  notes: string | null
  created_at: string
}

/* --------------------------------------------------
   Componente
-------------------------------------------------- */
export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState("attendance")
  const isMobile = useIsMobile()

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [justificationRecords, setJustificationRecords] = useState<JustificationRecord[]>([])
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([])
  const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([])
  const [permanenceRecords, setPermanenceRecords] = useState<PermanenceRecord[]>([])
  const [personalNoteRecords, setPersonalNoteRecords] = useState<PersonalNoteRecord[]>([])
  const [keyHistoryRecords, setKeyHistoryRecords] = useState<KeyHistoryRecord[]>([])
  const [tiTicketRecords, setTiTicketRecords] = useState<any[]>([])

  const [attendanceSearch, setAttendanceSearch] = useState("")
  const [attendanceFilterStatus, setAttendanceFilterStatus] = useState("all")
  const [attendanceFilterDate, setAttendanceFilterDate] = useState("all")
  const [attendanceFilterJustificationType, setAttendanceFilterJustificationType] = useState("all")

  const [justificationSearch, setJustificationSearch] = useState("")
  const [justificationFilterStatus, setJustificationFilterStatus] = useState("all")
  const [justificationFilterType, setJustificationFilterType] = useState("all")

  const [eventSearch, setEventSearch] = useState("")
  const [eventFilterDate, setEventFilterDate] = useState("all")

  const [flightSearch, setFlightSearch] = useState("")
  const [flightFilterDate, setFlightFilterDate] = useState("all")

  const [permanenceSearch, setPermanenceSearch] = useState("")
  const [permanenceFilterStatus, setPermanenceFilterStatus] = useState("all")
  const [permanenceFilterDate, setPermanenceFilterDate] = useState("all")

  const [personalNoteSearch, setPersonalNoteSearch] = useState("")

  const [keyHistorySearch, setKeyHistorySearch] = useState("")
  const [keyHistoryFilterDate, setKeyHistoryFilterDate] = useState("all")
  const [keyHistoryFilterAction, setKeyHistoryFilterAction] = useState("all")

  const [tiSearch, setTiSearch] = useState("")
  const [tiFilterStatus, setTiFilterStatus] = useState("all")
  const [tiFilterUrgency, setTiFilterUrgency] = useState("all")
  const [tiFilterCategory, setTiFilterCategory] = useState("all")

  // Definir todas as abas disponíveis
  const availableTabs = [
    { value: "attendance", label: "Presença", icon: "👥", description: "Histórico de presença dos militares" },
    { value: "justifications", label: "Justificativas", icon: "📋", description: "Histórico de justificativas de ausência" },
    { value: "events", label: "Eventos", icon: "📅", description: "Histórico de eventos do Esquadrão" },
    { value: "flights", label: "Voos", icon: "✈️", description: "Histórico de agendamentos de voos" },
    { value: "permanence", label: "Permanência", icon: "🏠", description: "Histórico de permanência diária" },
    { value: "notes", label: "Notas Pessoais", icon: "📝", description: "Histórico de notas e anotações" },
    { value: "keys", label: "Chaves", icon: "🔑", description: "Histórico de movimentação de chaves" },
    { value: "ti", label: "TI", icon: "🖥️", description: "Histórico de chamados de tecnologia da informação" },
    { value: "analytics", label: "Análises", icon: "📈", description: "Dashboard de análises e estatísticas" }
  ]

  // Gerar datas únicas para o filtro
  const uniqueDates = [...new Set(attendanceRecords.map(r => r.date))].sort().reverse()

  useEffect(() => {
    const fetchAllRecords = async () => {
      console.log("📥 Carregando dados completos do histórico...")
      console.log("🔧 Configuração Supabase:", {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Config não encontrada',
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })

      try {
        // 1. Histórico de Presença
        console.log("🔄 Carregando histórico de presença...")
        const attendanceData = await fetchTableSafe<AttendanceRecord>("military_attendance_records")
        console.log("📊 Dados de presença recebidos:", attendanceData)
        setAttendanceRecords(attendanceData)
        console.log("✅ Presença carregada:", attendanceData.length, "registros")

        // 2. Histórico de Justificativas
        console.log("🔄 Carregando histórico de justificativas...")
        const justificationData = await fetchTableSafe<JustificationRecord>("military_justifications")
        console.log("📊 Dados de justificativas recebidos:", justificationData)
        setJustificationRecords(justificationData)
        console.log("✅ Justificativas carregadas:", justificationData.length, "registros")

        // 3. Histórico de Eventos
        console.log("🔄 Carregando histórico de eventos...")
        const eventData = await fetchTableSafe<EventRecord>("military_events")
        console.log("📊 Dados de eventos recebidos:", eventData)
        setEventRecords(eventData)
        console.log("✅ Eventos carregados:", eventData.length, "registros")

        // 4. Histórico de Voos
        console.log("🔄 Carregando histórico de voos...")
        const flightData = await fetchTableSafe<FlightRecord>("flight_schedules")
        console.log("📊 Dados de voos recebidos:", flightData)
        setFlightRecords(flightData)
        console.log("✅ Voos carregados:", flightData.length, "registros")

        // 5. Histórico de Permanência
        console.log("🔄 Carregando histórico de permanência...")
        const permanenceData = await fetchTableSafe<PermanenceRecord>("daily_permanence_records")
        console.log("📊 Dados de permanência recebidos:", permanenceData)
        setPermanenceRecords(permanenceData)
        console.log("✅ Permanência carregada:", permanenceData.length, "registros")

        // 6. Histórico de Notas Pessoais
        console.log("🔄 Carregando histórico de notas pessoais...")
        const notesData = await fetchTableSafe<PersonalNoteRecord>("personal_notes")
        console.log("📊 Dados de notas recebidos:", notesData)
        setPersonalNoteRecords(notesData)
        console.log("✅ Notas carregadas:", notesData.length, "registros")

        // 7. Histórico de Chaves
        console.log("🔄 Carregando histórico de chaves...")
        const keysData = await fetchKeyHistoryWithDetails()
        console.log("📊 Dados de chaves recebidos:", keysData)
        setKeyHistoryRecords(keysData)
        console.log("✅ Chaves carregadas:", keysData.length, "registros")

        // 8. Histórico de TI
        console.log("🔄 Carregando histórico de TI...")
        const tiData = await fetchTableSafe<any>("ti_tickets")
        console.log("📊 Dados de TI recebidos:", tiData)
        setTiTicketRecords(tiData)
        console.log("✅ TI carregado:", tiData.length, "registros")

        console.log("🎉 Todos os dados foram carregados com sucesso!")
        console.log("📊 Resumo final:", {
          attendance: attendanceData.length,
          justifications: justificationData.length,
          events: eventData.length,
          flights: flightData.length,
          permanence: permanenceData.length,
          notes: notesData.length,
          keys: keysData.length,
          ti: tiData.length
        })
        
      } catch (error) {
        console.error("❌ Erro ao carregar dados do histórico:", error)
        console.error("🔍 Detalhes do erro:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
    }

    fetchAllRecords()
  }, [])

  const filteredAttendance = attendanceRecords.filter(
    (r) => {
      // Busca por nome do militar
      const nameMatch = safeLower(r.military_name).includes(attendanceSearch.toLowerCase())
      
      // Busca por status
      const statusMatch = attendanceFilterStatus === "all" || r.status === attendanceFilterStatus
      
      // Busca por data
      const dateMatch = attendanceFilterDate === "all" || r.date === attendanceFilterDate
      
      // Busca por justificativa (se o filtro de status for "justificado")
      let justificationMatch = true
      if (attendanceFilterStatus === "justificado") {
        justificationMatch = r.justification_id !== null && r.justification_id !== ""
        
        // Se houver filtro por tipo de justificativa, aplicar também
        if (attendanceFilterJustificationType !== "all") {
          const justification = justificationRecords.find(j => j.id === r.justification_id)
          justificationMatch = justification && justification.type === attendanceFilterJustificationType
        }
      }
      
      return nameMatch && statusMatch && dateMatch && justificationMatch
    }
  )

  // Log para debug do filtro
  console.log("🔍 Filtros aplicados:", {
    search: attendanceSearch,
    status: attendanceFilterStatus,
    date: attendanceFilterDate,
    justificationType: attendanceFilterJustificationType,
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
      (safeLower(r.title).includes(eventSearch.toLowerCase()) ||
       safeLower(r.description).includes(eventSearch.toLowerCase())) &&
      (eventFilterDate === "all" || r.date === eventFilterDate),
  )

  const filteredFlights = flightRecords.filter(
    (r) =>
      (safeLower(r.flight_date).includes(flightSearch.toLowerCase()) ||
       safeLower(r.flight_time).includes(flightSearch.toLowerCase()) ||
       safeLower(r.military_ids).includes(flightSearch.toLowerCase())) &&
      (flightFilterDate === "all" || r.flight_date === flightFilterDate),
  )

  const filteredPermanence = permanenceRecords.filter(
    (r) =>
      (safeLower(r.military_name).includes(permanenceSearch.toLowerCase()) ||
       safeLower(r.rank).includes(permanenceSearch.toLowerCase()) ||
       safeLower(r.details).includes(permanenceSearch.toLowerCase())) &&
      (permanenceFilterStatus === "all" || r.status === permanenceFilterStatus) &&
      (permanenceFilterDate === "all" || r.date === permanenceFilterDate),
  )

  const filteredPersonalNotes = personalNoteRecords.filter(
    (r) =>
      safeLower(r.note_content).includes(personalNoteSearch.toLowerCase()) ||
      safeLower(r.military_name).includes(personalNoteSearch.toLowerCase()),
  )

  const filteredKeyHistory = keyHistoryRecords.filter(
    (r) => (
      (safeLower(r.key_id).includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.key_name || '').includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.key_number || '').includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.type).includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.notes || '').includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.military_name || '').includes(keyHistorySearch.toLowerCase()) ||
       safeLower(r.military_rank || '').includes(keyHistorySearch.toLowerCase())) &&
      (keyHistoryFilterDate === "all" || r.timestamp === keyHistoryFilterDate) &&
      (keyHistoryFilterAction === "all" || r.type === keyHistoryFilterAction)
    )
  )

  const filteredTiTickets = tiTicketRecords.filter(
    (r) => {
      const searchMatch = safeLower(r.title).includes(tiSearch.toLowerCase()) ||
                         safeLower(r.description).includes(tiSearch.toLowerCase()) ||
                         safeLower(r.requester_name).includes(tiSearch.toLowerCase())
      
      const statusMatch = tiFilterStatus === "all" || r.status === tiFilterStatus
      const urgencyMatch = tiFilterUrgency === "all" || r.urgency_level === tiFilterUrgency
      const categoryMatch = tiFilterCategory === "all" || r.category === tiFilterCategory
      
      return searchMatch && statusMatch && urgencyMatch && categoryMatch
    }
  )

  // Função para renderizar filtros de forma responsiva
  const renderFilters = (filters: React.ReactNode) => {
    if (isMobile) {
      return (
        <div className="space-y-3 mb-4">
          {filters}
        </div>
      )
    }
    return (
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {filters}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Histórico e Análises</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Botões de Exportação Geral */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Exportação Geral:</span>
          </div>
          <Button 
            onClick={() => generateCompleteReport()}
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 text-sm"
          >
            📋 Relatório Completo PDF
          </Button>
          <Button 
            onClick={() => exportAllToCSV()}
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-sm"
          >
            📊 Todos os Dados (CSV)
          </Button>
        </div>

        {/* Estatísticas Premium */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-800 dark:via-blue-950/20 dark:to-blue-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-1">
                  {attendanceRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">Presença</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-green-50 to-green-100 dark:from-gray-800 dark:via-green-950/20 dark:to-green-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-1">
                  {justificationRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">Justificativas</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-purple-50 to-purple-100 dark:from-gray-800 dark:via-purple-950/20 dark:to-purple-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-1">
                  {eventRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">Eventos</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-orange-50 to-orange-100 dark:from-gray-800 dark:via-orange-950/20 dark:to-orange-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent mb-1">
                  {flightRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-orange-700 dark:text-orange-300">Voos</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-red-50 to-red-100 dark:from-gray-800 dark:via-red-950/20 dark:to-red-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent mb-1">
                  {permanenceRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">Permanência</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-indigo-50 to-indigo-100 dark:from-gray-800 dark:via-indigo-950/20 dark:to-indigo-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent mb-1">
                  {personalNoteRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">Notas</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-yellow-50 to-yellow-100 dark:from-gray-800 dark:via-yellow-950/20 dark:to-yellow-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent mb-1">
                  {keyHistoryRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-300">Chaves</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-cyan-50 to-cyan-100 dark:from-gray-800 dark:via-cyan-950/20 dark:to-cyan-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent mb-1">
                  {tiTicketRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-cyan-700 dark:text-cyan-300">TI</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-800 dark:via-gray-950/20 dark:to-gray-900/30 group cursor-pointer hover:scale-105">
            {/* Background decorativo com gradiente */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-500 to-gray-600 shadow-lg"></div>
            
            {/* Efeito de brilho sutil no fundo */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <CardContent className="p-4 text-center relative">
              <div className="relative z-10">
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent mb-1">
                  {attendanceRecords.length + justificationRecords.length + eventRecords.length + 
                   flightRecords.length + permanenceRecords.length + personalNoteRecords.length + 
                   keyHistoryRecords.length}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Total</div>
              </div>
              
              {/* Efeito de brilho no hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </CardContent>
          </Card>
        </div>

        {/* Dropdown Premium para todas as abas */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="w-full sm:w-96">
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className="w-full h-16 text-base border-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 focus:from-blue-50 focus:to-indigo-50 dark:focus:from-blue-900/20 dark:focus:to-indigo-900/20 focus:ring-2 focus:ring-blue-200/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <SelectValue>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <span className="text-2xl">{availableTabs.find(tab => tab.value === activeTab)?.icon}</span>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                          {availableTabs.find(tab => tab.value === activeTab)?.label}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {availableTabs.find(tab => tab.value === activeTab)?.description}
                        </span>
                      </div>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-96 bg-white dark:bg-gray-800 border-0 shadow-2xl rounded-2xl overflow-hidden">
                  {availableTabs.map(tab => (
                    <SelectItem key={tab.value} value={tab.value} className="py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <span className="text-2xl">{tab.icon}</span>
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-gray-900 dark:text-white text-lg">{tab.label}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{tab.description}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Indicador de registros Premium */}
            <div className="w-full sm:w-auto">
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-blue-50 to-blue-100 dark:from-gray-800 dark:via-blue-950/20 dark:to-blue-900/30">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"></div>
                <div className="p-6 text-center relative">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
                    {(() => {
                      switch (activeTab) {
                        case "attendance": return attendanceRecords.length
                        case "justifications": return justificationRecords.length
                        case "events": return eventRecords.length
                        case "flights": return flightRecords.length
                        case "permanence": return permanenceRecords.length
                        case "notes": return personalNoteRecords.length
                        case "keys": return keyHistoryRecords.length
                        case "ti": return tiTicketRecords.length
                        case "analytics": return "📊"
                        default: return 0
                      }
                    })()}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                    Registros
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

            {/* Conteúdo das abas para Desktop */}
            {activeTab === "attendance" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredAttendance, 'historico-presenca')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredAttendance, 'historico-presenca', 'Histórico de Presença', ['Militar', 'Data', 'Status', 'Justificativa', 'Detalhes'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={attendanceFilterStatus} onValueChange={setAttendanceFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                    {attendanceFilterStatus === "justificado" && (
                      <Select value={attendanceFilterJustificationType} onValueChange={setAttendanceFilterJustificationType}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue>
                            {attendanceFilterJustificationType === "all" ? "Todos os Tipos" : attendanceFilterJustificationType}
                          </SelectValue>
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
                    )}
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Justificativa</th>
                        <th className="px-6 py-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((r) => {
                        // Buscar informações da justificativa se existir
                        const justification = r.justification_id ? 
                          justificationRecords.find(j => j.id === r.justification_id) : null
                        
                        return (
                          <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{r.rank} {r.military_name}</td>
                            <td className="px-6 py-4">{formatDate(r.date)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === 'presente' ? 'bg-green-100 text-green-800' : 
                                r.status === 'ausente' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {justification ? (
                                <div className="text-sm">
                                  <div className="font-medium text-blue-600">{justification.type}</div>
                                  <div className="text-gray-600">
                                    {formatDate(justification.start_date)} - {formatDate(justification.end_date)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {justification ? (
                                <div className="text-sm text-gray-600 max-w-xs truncate" title={justification.reason}>
                                  {justification.reason}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Justificativas para Desktop */}
            {activeTab === "justifications" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredJustifications, 'historico-justificativas')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredJustifications, 'historico-justificativas', 'Histórico de Justificativas', ['Militar', 'Tipo', 'Período', 'Motivo', 'Status'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar ou motivo..."
                      value={justificationSearch}
                      onChange={(e) => setJustificationSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={justificationFilterStatus} onValueChange={setJustificationFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
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
              </div>
            )}

            {/* Aba de Eventos para Desktop */}
            {activeTab === "events" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredEvents, 'historico-eventos')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredEvents, 'historico-eventos', 'Histórico de Eventos', ['Título', 'Data', 'Horário', 'Descrição', 'Responsável'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar evento..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={eventFilterDate} onValueChange={setEventFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(eventRecords.map(r => r.date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Título</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Horário</th>
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.title}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4">{r.time || '—'}</td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.description}>{r.description}</td>
                          <td className="px-6 py-4">{r.created_by_military_id ? 'Sim' : 'Não'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Voos para Desktop */}
            {activeTab === "flights" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredFlights, 'historico-voos')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredFlights, 'historico-voos', 'Histórico de Voos', ['Data', 'Horário Zulu', 'Militares', 'Criado em'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar voo..."
                      value={flightSearch}
                      onChange={(e) => setFlightSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={flightFilterDate} onValueChange={setFlightFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(flightRecords.map(r => r.flight_date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Horário Zulu</th>
                        <th className="px-6 py-3">Militares</th>
                        <th className="px-6 py-3">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">{formatDate(r.flight_date)}</td>
                          <td className="px-6 py-4">{r.flight_time}</td>
                          <td className="px-6 py-4">
                            {r.military_ids ? JSON.parse(r.military_ids).length : 0} militares
                          </td>
                          <td className="px-6 py-4">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Permanência para Desktop */}
            {activeTab === "permanence" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredPermanence, 'historico-permanencia')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredPermanence, 'historico-permanencia', 'Histórico de Permanência', ['Militar', 'Data', 'Status', 'Detalhes'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar..."
                      value={permanenceSearch}
                      onChange={(e) => setPermanenceSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={permanenceFilterStatus} onValueChange={setPermanenceFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="presente">Presente</SelectItem>
                        <SelectItem value="ausente">Ausente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={permanenceFilterDate} onValueChange={setPermanenceFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(permanenceRecords.map(r => r.date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermanence.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.rank} {r.military_name}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'presente' ? 'bg-green-100 text-green-800' : 
                              r.status === 'ausente' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.details}>{r.details || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Notas Pessoais para Desktop */}
            {activeTab === "notes" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredPersonalNotes, 'historico-notas')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredPersonalNotes, 'historico-notas', 'Histórico de Notas Pessoais', ['Militar', 'Data', 'Conteúdo'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar nota ou militar..."
                      value={personalNoteSearch}
                      onChange={(e) => setPersonalNoteSearch(e.target.value)}
                      className="flex-1"
                    />
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Conteúdo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonalNotes.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4 max-w-md truncate" title={r.note_content}>{r.note_content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Chaves para Desktop */}
            {activeTab === "keys" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredKeyHistory, 'historico-chaves')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredKeyHistory, 'historico-chaves', 'Histórico de Chaves', ['Chave', 'Militar', 'Ação', 'Data/Hora', 'Observações'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar chave, militar ou ação..."
                      value={keyHistorySearch}
                      onChange={(e) => setKeyHistorySearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={keyHistoryFilterDate} onValueChange={setKeyHistoryFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(keyHistoryRecords.map(r => r.timestamp.split('T')[0]))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={keyHistoryFilterAction} onValueChange={setKeyHistoryFilterAction}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Ações</SelectItem>
                        <SelectItem value="retirada">Retirada</SelectItem>
                        <SelectItem value="devolucao">Devolução</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Chave</th>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Ação</th>
                        <th className="px-6 py-3">Data/Hora</th>
                        <th className="px-6 py-3">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeyHistory.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="font-medium">{r.key_name || 'Chave não encontrada'}</div>
                            <div className="text-sm text-gray-500">{r.key_number || '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {r.military_name ? (
                              <div>
                                <div className="font-medium">{r.military_name}</div>
                                <div className="text-sm text-gray-500">{r.military_rank || '—'}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.type === 'retirada' ? 'bg-blue-100 text-blue-800' : 
                              r.type === 'devolucao' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.type === 'retirada' ? '🔑 Retirada' : 
                               r.type === 'devolucao' ? '✅ Devolução' : r.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(r.timestamp)}</td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.notes || ''}>{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de TI para Desktop */}
            {activeTab === "ti" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredTiTickets, 'historico-ti')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredTiTickets, 'historico-ti', 'Histórico de Chamados de TI', ['Título', 'Solicitante', 'Categoria', 'Urgência', 'Status', 'Data de Criação'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar por título, descrição ou solicitante..."
                      value={tiSearch}
                      onChange={(e) => setTiSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={tiFilterStatus} onValueChange={setTiFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tiFilterUrgency} onValueChange={setTiFilterUrgency}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Urgências</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tiFilterCategory} onValueChange={setTiFilterCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Rede/Internet">Rede/Internet</SelectItem>
                        <SelectItem value="Impressora">Impressora</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Sistema">Sistema</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Título</th>
                        <th className="px-6 py-3">Solicitante</th>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3">Urgência</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Data de Criação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTiTickets.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="font-medium max-w-xs truncate" title={r.title}>{r.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={r.description}>{r.description}</div>
                          </td>
                          <td className="px-6 py-4 font-medium">{r.requester_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {r.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.urgency_level === 'baixa' ? 'bg-green-100 text-green-800' : 
                              r.urgency_level === 'média' ? 'bg-yellow-100 text-yellow-800' : 
                              r.urgency_level === 'alta' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.urgency_level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'aberto' ? 'bg-blue-100 text-blue-800' : 
                              r.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : 
                              r.status === 'resolvido' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Análises para Desktop */}
            {activeTab === "analytics" && (
              <div>
                <AnalyticsDashboard />
              </div>
            )}

        {/* Conteúdo das abas para Mobile */}
        {isMobile && (
          <div className="mt-6">
            {/* Aba de Presença */}
            {activeTab === "attendance" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredAttendance, 'historico-presenca')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredAttendance, 'historico-presenca', 'Histórico de Presença', ['Militar', 'Data', 'Status', 'Justificativa', 'Detalhes'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar..."
                      value={attendanceSearch}
                      onChange={(e) => setAttendanceSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={attendanceFilterStatus} onValueChange={setAttendanceFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                    {attendanceFilterStatus === "justificado" && (
                      <Select value={attendanceFilterJustificationType} onValueChange={setAttendanceFilterJustificationType}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                          <SelectValue>
                            {attendanceFilterJustificationType === "all" ? "Todos os Tipos" : attendanceFilterJustificationType}
                          </SelectValue>
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
                    )}
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Justificativa</th>
                        <th className="px-6 py-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendance.map((r) => {
                        // Buscar informações da justificativa se existir
                        const justification = r.justification_id ? 
                          justificationRecords.find(j => j.id === r.justification_id) : null
                        
                        return (
                          <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{r.rank} {r.military_name}</td>
                            <td className="px-6 py-4">{formatDate(r.date)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                r.status === 'presente' ? 'bg-green-100 text-green-800' : 
                                r.status === 'ausente' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {justification ? (
                                <div className="text-sm">
                                  <div className="font-medium text-blue-600">{justification.type}</div>
                                  <div className="text-gray-600">
                                    {formatDate(justification.start_date)} - {formatDate(justification.end_date)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {justification ? (
                                <div className="text-sm text-gray-600 max-w-xs truncate" title={justification.reason}>
                                  {justification.reason}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Adicionar outras abas para mobile conforme necessário */}
            {activeTab === "justifications" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredJustifications, 'historico-justificativas')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredJustifications, 'historico-justificativas', 'Histórico de Justificativas', ['Militar', 'Tipo', 'Período', 'Motivo', 'Status'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar ou motivo..."
                      value={justificationSearch}
                      onChange={(e) => setJustificationSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={justificationFilterStatus} onValueChange={setJustificationFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                      <SelectTrigger className="w-full sm:w-[180px]">
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
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
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
              </div>
            )}

            {/* Aba de Eventos */}
            {activeTab === "events" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredEvents, 'historico-eventos')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredEvents, 'historico-eventos', 'Histórico de Eventos', ['Título', 'Data', 'Horário', 'Descrição', 'Responsável'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar evento..."
                      value={eventSearch}
                      onChange={(e) => setEventSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={eventFilterDate} onValueChange={setEventFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(eventRecords.map(r => r.date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Título</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Horário</th>
                        <th className="px-6 py-3">Descrição</th>
                        <th className="px-6 py-3">Responsável</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvents.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.title}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4">{r.time || '—'}</td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.description}>{r.description}</td>
                          <td className="px-6 py-4">{r.created_by_military_id ? 'Sim' : 'Não'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Voos */}
            {activeTab === "flights" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredFlights, 'historico-voos')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredFlights, 'historico-voos', 'Histórico de Voos', ['Data', 'Horário Zulu', 'Militares', 'Criado em'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar voo..."
                      value={flightSearch}
                      onChange={(e) => setFlightSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={flightFilterDate} onValueChange={setFlightFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(flightRecords.map(r => r.flight_date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Horário Zulu</th>
                        <th className="px-6 py-3">Militares</th>
                        <th className="px-6 py-3">Criado em</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFlights.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">{formatDate(r.flight_date)}</td>
                          <td className="px-6 py-4">{r.flight_time}</td>
                          <td className="px-6 py-4">
                            {r.military_ids ? JSON.parse(r.military_ids).length : 0} militares
                          </td>
                          <td className="px-6 py-4">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Permanência */}
            {activeTab === "permanence" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredPermanence, 'historico-permanencia')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredPermanence, 'historico-permanencia', 'Histórico de Permanência', ['Militar', 'Data', 'Status', 'Detalhes'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar militar..."
                      value={permanenceSearch}
                      onChange={(e) => setPermanenceSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={permanenceFilterStatus} onValueChange={setPermanenceFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="presente">Presente</SelectItem>
                        <SelectItem value="ausente">Ausente</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={permanenceFilterDate} onValueChange={setPermanenceFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(permanenceRecords.map(r => r.date))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermanence.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.rank} {r.military_name}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'presente' ? 'bg-green-100 text-green-800' : 
                              r.status === 'ausente' ? 'bg-red-100 text-red-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.details}>{r.details || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Notas Pessoais */}
            {activeTab === "notes" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredPersonalNotes, 'historico-notas')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredPersonalNotes, 'historico-notas', 'Histórico de Notas Pessoais', ['Militar', 'Data', 'Conteúdo'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar nota ou militar..."
                      value={personalNoteSearch}
                      onChange={(e) => setPersonalNoteSearch(e.target.value)}
                      className="flex-1"
                    />
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Conteúdo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPersonalNotes.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">{r.military_name}</td>
                          <td className="px-6 py-4">{formatDate(r.date)}</td>
                          <td className="px-6 py-4 max-w-md truncate" title={r.note_content}>{r.note_content}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de Chaves */}
            {activeTab === "keys" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredKeyHistory, 'historico-chaves')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredKeyHistory, 'historico-chaves', 'Histórico de Chaves', ['Chave', 'Militar', 'Ação', 'Data/Hora', 'Observações'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar chave, militar ou ação..."
                      value={keyHistorySearch}
                      onChange={(e) => setKeyHistorySearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={keyHistoryFilterDate} onValueChange={setKeyHistoryFilterDate}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Data" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Datas</SelectItem>
                        {[...new Set(keyHistoryRecords.map(r => r.timestamp.split('T')[0]))].sort().reverse().map((date) => (
                          <SelectItem key={date} value={date}>
                            {formatDate(date)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={keyHistoryFilterAction} onValueChange={setKeyHistoryFilterAction}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Ações</SelectItem>
                        <SelectItem value="retirada">Retirada</SelectItem>
                        <SelectItem value="devolucao">Devolução</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Chave</th>
                        <th className="px-6 py-3">Militar</th>
                        <th className="px-6 py-3">Ação</th>
                        <th className="px-6 py-3">Data/Hora</th>
                        <th className="px-6 py-3">Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKeyHistory.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="font-medium">{r.key_name || 'Chave não encontrada'}</div>
                            <div className="text-sm text-gray-500">{r.key_number || '—'}</div>
                          </td>
                          <td className="px-6 py-4">
                            {r.military_name ? (
                              <div>
                                <div className="font-medium">{r.military_name}</div>
                                <div className="text-sm text-gray-500">{r.military_rank || '—'}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.type === 'retirada' ? 'bg-blue-100 text-blue-800' : 
                              r.type === 'devolucao' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.type === 'retirada' ? '🔑 Retirada' : 
                               r.type === 'devolucao' ? '✅ Devolução' : r.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(r.timestamp)}</td>
                          <td className="px-6 py-4 max-w-xs truncate" title={r.notes || ''}>{r.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Aba de TI para Mobile */}
            {activeTab === "ti" && (
              <div>
                {renderFilters((
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={() => exportToCSV(filteredTiTickets, 'historico-ti')}
                        variant="outline"
                        className="w-fit"
                      >
                        📊 CSV
                      </Button>
                      <Button 
                        onClick={() => generatePDF(filteredTiTickets, 'historico-ti', 'Histórico de Chamados de TI', ['Título', 'Solicitante', 'Categoria', 'Urgência', 'Status', 'Data de Criação'])}
                        variant="outline"
                        className="w-fit bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                      >
                        📄 PDF
                      </Button>
                    </div>
                    <Input
                      placeholder="Buscar por título, descrição ou solicitante..."
                      value={tiSearch}
                      onChange={(e) => setTiSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={tiFilterStatus} onValueChange={setTiFilterStatus}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_andamento">Em Andamento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tiFilterUrgency} onValueChange={setTiFilterUrgency}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Urgência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Urgências</SelectItem>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="média">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={tiFilterCategory} onValueChange={setTiFilterCategory}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filtrar por Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as Categorias</SelectItem>
                        <SelectItem value="Hardware">Hardware</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Rede/Internet">Rede/Internet</SelectItem>
                        <SelectItem value="Impressora">Impressora</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Sistema">Sistema</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ))}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3">Título</th>
                        <th className="px-6 py-3">Solicitante</th>
                        <th className="px-6 py-3">Categoria</th>
                        <th className="px-6 py-3">Urgência</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Data de Criação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTiTickets.map((r) => (
                        <tr key={r.id} className="bg-white border-b dark:bg-gray-800">
                          <td className="px-6 py-4">
                            <div className="font-medium max-w-xs truncate" title={r.title}>{r.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate" title={r.description}>{r.description}</div>
                          </td>
                          <td className="px-6 py-4 font-medium">{r.requester_name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {r.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.urgency_level === 'baixa' ? 'bg-green-100 text-green-800' : 
                              r.urgency_level === 'média' ? 'bg-yellow-100 text-yellow-800' : 
                              r.urgency_level === 'alta' ? 'bg-orange-100 text-orange-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {r.urgency_level}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.status === 'aberto' ? 'bg-blue-100 text-blue-800' : 
                              r.status === 'em_andamento' ? 'bg-yellow-100 text-yellow-800' : 
                              r.status === 'resolvido' ? 'bg-green-100 text-green-800' : 
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Adicionar outras abas para mobile conforme necessário */}
            {activeTab === "analytics" && (
              <div>
                <AnalyticsDashboard />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default HistoryTabs
