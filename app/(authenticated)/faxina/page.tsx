"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CalendarDays, CheckCircle, AlertTriangle, XCircle, Plus, Edit3, Save, X, Trash2, Download, Upload } from "lucide-react"
import { format, differenceInDays, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { useIsMobile } from "@/hooks/use-mobile"

// Tipos de dados
interface CleaningRecord {
  id: string
  sector: string
  location: string
  lastCleaningDate: string
  checkedBy: string
  notes?: string
  created_at: string
  updated_at: string
}

interface Sector {
  id: string
  name: string
  responsible: string
  rank: string
}

// Dados estáticos dos setores
const sectors: Sector[] = [
  { id: "1", name: "SETOR 1 - S1 GABRIEL REIS", responsible: "S1 GABRIEL REIS", rank: "S1" },
  { id: "2", name: "SETOR 2 - S2 DA ROSA", responsible: "S2 DA ROSA", rank: "S2" },
  { id: "3", name: "SETOR 3 - S2 DENARDIN", responsible: "S2 DENARDIN", rank: "S2" },
  { id: "4", name: "SETOR 4 - S2 DOUGLAS SILVA", responsible: "S2 DOUGLAS SILVA", rank: "S2" },
  { id: "5", name: "SETOR 5 - S1 NYCOLAS", responsible: "S1 NYCOLAS", rank: "S1" },
  { id: "6", name: "SETOR 6 - S2 PÍBER", responsible: "S2 PÍBER", rank: "S2" },
  { id: "7", name: "SETOR 7 - S2 JOÃO GABRIEL", responsible: "S2 JOÃO GABRIEL", rank: "S2" },
  { id: "8", name: "SETOR 8 - S2 VIEIRA", responsible: "S2 VIEIRA", rank: "S2" },
  { id: "9", name: "PERMANÊNCIA", responsible: "CGPAT", rank: "CGPAT" },
  { id: "10", name: "SOB DEMANDA", responsible: "CGPAT", rank: "CGPAT" }
]

// Dados estáticos das localizações por setor
const sectorLocations: Record<string, string[]> = {
  "1": ["Bar CB/SD - N° 18", "C PIS - N° 63", "Corredor SAP", "Salas Briefing Ouros - N° 36", "Meteoro N° 57"],
  "2": ["Bar SO/SGT - N° 8", "Corredor Vestiários", "Patrimônio - N° 17", "Sala Briefing Copas - N° 37", "Auditório - N° 31"],
  "3": ["Corredor SOP / AUD", "Vestiário Feminino - N° 16", "CADO - N° 23", "Contra-inteligência - N° 32", "Doutrina - N° 22"],
  "4": ["Corredor PIS", "Bar OF - N° 4", "Navegação - N° 21", "Inteligência - N° 33/34", "Lixo Sigiloso"],
  "5": ["Vestiário OF - N° 15", "RP - N° 5", "SOP - N° 25", "Sala N° 56", "Guerra Eletrônica - N° 26"],
  "6": ["Vestiário SO/SGT - N° 14", "SAP - N° 7", "SIPAA - N° 24", "Banheiro Feminino", "CGMASO - N° 28"],
  "7": ["Vestiário CB/SD - N° 19", "Ajudância - N° 10", "Sala Briefing Paus - N° 35", "Sala N° 61", "Sala N° 58", "Churrasqueira"],
  "8": ["Protocolo - N° 9", "Salão Histórico - N° 11", "Lixo Comum", "Escala - N° 27", "Banheiros Auditórios", "Aeromédica - N° 6"],
  "9": ["Sala CMT - N° 12", "Quarto Permanência - N° 20", "Hall de Entrada"],
  "10": ["Área externa"]
}

// Militares disponíveis para conferência
const availableMilitary = [
  "TC CARNEIRO",
  "MJ MAIA",
  "CP MIRANDA",
  "CP CAMILA CALDAS",
  "CP FARIAS",
  "CP SPINELLI",
  "CP ALMEIDA",
  "CP JÚNIOR",
  "CP FELIPPE MIRANDA",
  "CP EDUARDO",
  "CP MAIRINK",
  "1T ISMAEL",
  "2T OBREGON",
  "SO ELIASAFE",
  "1S MENEZES",
  "1S JACOBS",
  "2S RIBAS",
  "2S EDGAR",
  "2S MADUREIRO",
  "2S ORIEL",
  "2S FRANK",
  "2S BRAZ",
  "3S PITTIGLIANI",
  "3S L. TEIXEIRA",
  "3S MAIA",
  "3S ANNE",
  "3S JAQUES",
  "3S HÖEHR",
  "3S VILELA",
  "3S HENRIQUE"
]

export default function FaxinaPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const isMobile = useIsMobile()
  
  const [cleaningRecords, setCleaningRecords] = useState<CleaningRecord[]>([])
  const [selectedSector, setSelectedSector] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<CleaningRecord | null>(null)
  const [currentDate] = useState(new Date())

  // Estado para novo registro
  const [newRecord, setNewRecord] = useState({
    sector: "",
    location: "",
    lastCleaningDate: format(new Date(), "yyyy-MM-dd"),
    checkedBy: "",
    notes: ""
  })

  useEffect(() => {
    // Carregar dados iniciais (simulados)
    loadInitialData()
  }, [])

  const loadInitialData = () => {
    // Dados simulados baseados nos dados fornecidos
    const initialData: CleaningRecord[] = [
      // SETOR 1
      { id: "1", sector: "1", location: "Bar CB/SD - N° 18", lastCleaningDate: "2025-08-19", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "2", sector: "1", location: "C PIS - N° 63", lastCleaningDate: "2025-08-19", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "3", sector: "1", location: "Corredor SAP", lastCleaningDate: "2025-08-19", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "4", sector: "1", location: "Salas Briefing Ouros - N° 36", lastCleaningDate: "2025-08-19", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "5", sector: "1", location: "Meteoro N° 57", lastCleaningDate: "2025-08-19", checkedBy: "2S ORIEL", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 2
      { id: "6", sector: "2", location: "Bar SO/SGT - N° 8", lastCleaningDate: "2025-08-18", checkedBy: "2S ORIEL", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "7", sector: "2", location: "Corredor Vestiários", lastCleaningDate: "2025-06-13", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "8", sector: "2", location: "Patrimônio - N° 17", lastCleaningDate: "2025-09-02", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "9", sector: "2", location: "Sala Briefing Copas - N° 37", lastCleaningDate: "2025-06-13", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "10", sector: "2", location: "Auditório - N° 31", lastCleaningDate: "2025-06-13", checkedBy: "2S BRAZ", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 3
      { id: "11", sector: "3", location: "Corredor SOP / AUD", lastCleaningDate: "2025-07-24", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "12", sector: "3", location: "Vestiário Feminino - N° 16", lastCleaningDate: "2025-07-24", checkedBy: "3S Anne", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "13", sector: "3", location: "CADO - N° 23", lastCleaningDate: "2025-07-24", checkedBy: "3S Pittigliani", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "14", sector: "3", location: "Contra-inteligência - N° 32", lastCleaningDate: "2025-07-16", checkedBy: "3S Maia", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "15", sector: "3", location: "Doutrina - N° 22", lastCleaningDate: "2025-07-16", checkedBy: "2S Jacobs", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 4
      { id: "16", sector: "4", location: "Corredor PIS", lastCleaningDate: "2025-08-19", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "17", sector: "4", location: "Bar OF - N° 4", lastCleaningDate: "2025-08-19", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "18", sector: "4", location: "Navegação - N° 21", lastCleaningDate: "2025-08-19", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "19", sector: "4", location: "Inteligência - N° 33/34", lastCleaningDate: "2025-07-16", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "20", sector: "4", location: "Lixo Sigiloso", lastCleaningDate: "2025-08-19", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 5
      { id: "21", sector: "5", location: "Vestiário OF - N° 15", lastCleaningDate: "2025-09-01", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "22", sector: "5", location: "RP - N° 5", lastCleaningDate: "2025-09-01", checkedBy: "2T Obregon", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "23", sector: "5", location: "SOP - N° 25", lastCleaningDate: "2025-09-01", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "24", sector: "5", location: "Sala N° 56", lastCleaningDate: "2025-09-01", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "25", sector: "5", location: "Guerra Eletrônica - N° 26", lastCleaningDate: "2025-09-01", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 6
      { id: "26", sector: "6", location: "Vestiário SO/SGT - N° 14", lastCleaningDate: "2025-09-02", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "27", sector: "6", location: "SAP - N° 7", lastCleaningDate: "2025-09-02", checkedBy: "3S Vilela", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "28", sector: "6", location: "SIPAA - N° 24", lastCleaningDate: "2025-09-02", checkedBy: "3S Anne", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "29", sector: "6", location: "Banheiro Feminino", lastCleaningDate: "2025-09-02", checkedBy: "3S Anne", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "30", sector: "6", location: "CGMASO - N° 28", lastCleaningDate: "2025-09-02", checkedBy: "2S Ribas", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 7
      { id: "31", sector: "7", location: "Vestiário CB/SD - N° 19", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "32", sector: "7", location: "Ajudância - N° 10", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "33", sector: "7", location: "Sala Briefing Paus - N° 35", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "34", sector: "7", location: "Sala N° 61", lastCleaningDate: "2025-06-13", checkedBy: "3S Höehr", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "35", sector: "7", location: "Sala N° 58", lastCleaningDate: "2025-06-30", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "36", sector: "7", location: "Churrasqueira", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SETOR 8
      { id: "37", sector: "8", location: "Protocolo - N° 9", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "38", sector: "8", location: "Salão Histórico - N° 11", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "39", sector: "8", location: "Lixo Comum", lastCleaningDate: "2025-07-16", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "40", sector: "8", location: "Escala - N° 27", lastCleaningDate: "2025-08-19", checkedBy: "3S Jaques", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "41", sector: "8", location: "Banheiros Auditórios", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "42", sector: "8", location: "Aeromédica - N° 6", lastCleaningDate: "2025-06-13", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // PERMANÊNCIA
      { id: "43", sector: "9", location: "Sala CMT - N° 12", lastCleaningDate: "2025-06-17", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "44", sector: "9", location: "Quarto Permanência - N° 20", lastCleaningDate: "2025-06-17", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: "45", sector: "9", location: "Hall de Entrada", lastCleaningDate: "2025-06-17", checkedBy: "3S Braz", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      
      // SOB DEMANDA
      { id: "46", sector: "10", location: "Área externa", lastCleaningDate: "2025-05-14", checkedBy: "", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]
    
    setCleaningRecords(initialData)
  }

  // Função para calcular o status da faxina baseado na data
  const getCleaningStatus = (lastCleaningDate: string) => {
    const lastDate = parseISO(lastCleaningDate)
    const daysDiff = differenceInDays(currentDate, lastDate)
    
    if (daysDiff <= 0) return { status: "em-dia", label: "FAXINA EM D", color: "bg-green-100 text-green-800", icon: CheckCircle }
    if (daysDiff <= 1) return { status: "atrasada-1", label: "FAXINA EM D-1", color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle }
    if (daysDiff <= 2) return { status: "atrasada-2", label: "FAXINA EM D-2", color: "bg-orange-100 text-orange-800", icon: AlertTriangle }
    if (daysDiff <= 6) return { status: "atrasada-6", label: "FAXINA EM ATÉ D-6", color: "bg-red-100 text-red-800", icon: XCircle }
    if (daysDiff <= 13) return { status: "atrasada-13", label: "FAXINA EM ATÉ D-13", color: "bg-red-200 text-red-900", icon: XCircle }
    return { status: "atrasada-14", label: "FAXINA EM D-14 OU ANTES", color: "bg-red-300 text-red-950", icon: XCircle }
  }

  // Filtrar registros
  const filteredRecords = cleaningRecords.filter(record => {
    const sectorMatch = selectedSector === "all" || record.sector === selectedSector
    const searchMatch = record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       record.checkedBy.toLowerCase().includes(searchTerm.toLowerCase())
    return sectorMatch && searchMatch
  })

  // Agrupar registros por setor
  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const sector = sectors.find(s => s.id === record.sector)
    if (!sector) return acc
    
    if (!acc[sector.id]) {
      acc[sector.id] = {
        sector,
        records: []
      }
    }
    acc[sector.id].records.push(record)
    return acc
  }, {} as Record<string, { sector: Sector, records: CleaningRecord[] }>)

  // Adicionar novo registro
  const handleAddRecord = () => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas usuários administradores podem adicionar registros",
        variant: "destructive"
      })
      return
    }

    if (!newRecord.sector || !newRecord.location || !newRecord.lastCleaningDate || !newRecord.checkedBy) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive"
      })
      return
    }

    const record: CleaningRecord = {
      id: Date.now().toString(),
      ...newRecord,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setCleaningRecords(prev => [...prev, record])
    setNewRecord({
      sector: "",
      location: "",
      lastCleaningDate: format(new Date(), "yyyy-MM-dd"),
      checkedBy: "",
      notes: ""
    })
    setIsAddDialogOpen(false)
    
    toast({
      title: "Sucesso",
      description: "Registro de faxina adicionado com sucesso"
    })
  }

  // Editar registro
  const handleEditRecord = (record: CleaningRecord) => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas usuários administradores podem editar registros",
        variant: "destructive"
      })
      return
    }

    setEditingRecord(record)
    setNewRecord({
      sector: record.sector,
      location: record.location,
      lastCleaningDate: record.lastCleaningDate,
      checkedBy: record.checkedBy,
      notes: record.notes || ""
    })
    setIsAddDialogOpen(true)
  }

  // Salvar edição
  const handleSaveEdit = () => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas usuários administradores podem editar registros",
        variant: "destructive"
      })
      return
    }

    if (!editingRecord) return

    setCleaningRecords(prev => prev.map(record => 
      record.id === editingRecord.id 
        ? { ...record, ...newRecord, updated_at: new Date().toISOString() }
        : record
    ))

    setEditingRecord(null)
    setNewRecord({
      sector: "",
      location: "",
      lastCleaningDate: format(new Date(), "yyyy-MM-dd"),
      checkedBy: "",
      notes: ""
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Sucesso",
      description: "Registro de faxina atualizado com sucesso"
    })
  }

  // Excluir registro
  const handleDeleteRecord = (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas usuários administradores podem excluir registros",
        variant: "destructive"
      })
      return
    }

    setCleaningRecords(prev => prev.filter(record => record.id !== id))
    toast({
      title: "Sucesso",
      description: "Registro de faxina excluído com sucesso"
    })
  }

  // Exportar para CSV
  const exportToCSV = () => {
    const headers = ["Setor", "Localização", "Data da Última Limpeza", "Conferido Por", "Status", "Notas"]
    const csvContent = [
      headers.join(","),
      ...filteredRecords.map(record => {
        const sector = sectors.find(s => s.id === record.sector)
        const status = getCleaningStatus(record.lastCleaningDate)
        return [
          sector?.name || "",
          record.location,
          record.lastCleaningDate,
          record.checkedBy,
          status.label,
          record.notes || ""
        ].join(",")
      })
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `faxina-instalacoes-${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header padronizado */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          FAXINA DAS INSTALAÇÕES
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
          1º/10º GAV - Sistema de Gestão de Limpeza
        </p>
      </div>

       {/* Aviso de permissão para usuários não-administradores */}
       {!isAdmin && (
         <Card className="border-2 border-yellow-200 dark:border-yellow-800">
           <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
             <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
               👁️ Modo Visualização
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4 text-sm text-yellow-700 dark:text-yellow-300">
             <p>Você está visualizando esta página em <strong>modo somente leitura</strong>. Apenas usuários administradores podem adicionar, editar ou excluir registros de faxina.</p>
           </CardContent>
         </Card>
       )}

       {/* Instruções */}
      <Card className="border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            📋 INSTRUÇÕES
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-3 text-sm text-gray-700 dark:text-gray-300">
          <p><strong>Graduados e Oficiais</strong> de cada Célula/Seção conferem do seu respectivo setor.</p>
          <p><strong>CGPAT</strong> - vestiários, corredores, auditório, churrasqueira/área externa, Esquadrilhas e setores que não possuem efetivo trabalhando.</p>
          <p><strong>CGDAP</strong> - salas de estar.</p>
          <p>Na ausência dos responsáveis diretos pela conferência, alguém da <strong>CGPAT</strong> ou da <strong>SAP</strong> pode conferir.</p>
        </CardContent>
      </Card>

             {/* Legenda */}
       <Card className="border-2 border-gray-200 dark:border-gray-700">
         <CardHeader className="bg-gray-50 dark:bg-gray-800">
           <CardTitle className="flex items-center gap-2">
             🎨 LEGENDA
           </CardTitle>
         </CardHeader>
         <CardContent className="p-4">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
             <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-green-400 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-green-500 border-2 border-green-600 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-green-800 dark:text-green-200 whitespace-nowrap">FAXINA EM D</span>
             </div>
             <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-yellow-400 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-yellow-500 border-2 border-yellow-600 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200 whitespace-nowrap">FAXINA EM D-1</span>
             </div>
             <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-orange-400 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-orange-500 border-2 border-orange-600 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-orange-800 dark:text-orange-200 whitespace-nowrap">FAXINA EM D-2</span>
             </div>
             <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-red-400 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-red-500 border-2 border-red-600 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-red-800 dark:text-red-200 whitespace-nowrap">FAXINA EM ATÉ D-6</span>
             </div>
             <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-red-500 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-red-600 border-2 border-red-700 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-red-900 dark:text-red-100 whitespace-nowrap">FAXINA EM ATÉ D-13</span>
             </div>
                                        <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-md border-2 border-red-600 shadow-sm hover:shadow-md transition-all duration-200">
               <div className="w-4 h-4 bg-red-700 border-2 border-red-800 rounded shadow-inner"></div>
               <span className="text-xs font-medium text-red-950 dark:text-red-50 whitespace-nowrap">FAXINA EM D-14+</span>
             </div>
           </div>
         </CardContent>
       </Card>

      {/* Controles */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrar por Setor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Setores</SelectItem>
              {sectors.map(sector => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="🔍 Buscar por localização ou conferente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportToCSV} variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          
          {isAdmin && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Faxina
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? "Editar Registro de Faxina" : "Novo Registro de Faxina"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sector">Setor</Label>
                    <Select value={newRecord.sector} onValueChange={(value) => setNewRecord(prev => ({ ...prev, sector: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar Setor" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map(sector => (
                          <SelectItem key={sector.id} value={sector.id}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Select value={newRecord.location} onValueChange={(value) => setNewRecord(prev => ({ ...prev, location: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar Localização" />
                      </SelectTrigger>
                      <SelectContent>
                        {newRecord.sector && sectorLocations[newRecord.sector]?.map(location => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lastCleaningDate">Data da Última Limpeza</Label>
                    <Input
                      id="lastCleaningDate"
                      type="date"
                      value={newRecord.lastCleaningDate}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, lastCleaningDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="checkedBy">Conferido Por</Label>
                    <Select value={newRecord.checkedBy} onValueChange={(value) => setNewRecord(prev => ({ ...prev, checkedBy: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar Militar" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMilitary.map(military => (
                          <SelectItem key={military} value={military}>
                            {military}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações adicionais..."
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  
                  {editingRecord ? (
                    <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  ) : (
                    <Button onClick={handleAddRecord} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  )}
                </div>
                             </div>
             </DialogContent>
           </Dialog>
           )}
         </div>
      </div>

             {/* Estatísticas */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
         {Object.entries(groupedRecords).map(([sectorId, { sector, records }]) => {
           const statusCounts = records.reduce((acc, record) => {
             const status = getCleaningStatus(record.lastCleaningDate).status
             acc[status] = (acc[status] || 0) + 1
             return acc
           }, {} as Record<string, number>)

                       // Definir cores baseadas no setor
            const sectorColors = {
              "1": "from-blue-500 to-blue-600",
              "2": "from-green-500 to-green-600", 
              "3": "from-cyan-500 to-cyan-600",
              "4": "from-orange-500 to-orange-600",
              "5": "from-teal-500 to-teal-600",
              "6": "from-emerald-500 to-emerald-600",
              "7": "from-indigo-500 to-indigo-600",
              "8": "from-red-500 to-red-600",
              "9": "from-gray-500 to-gray-600",
              "10": "from-yellow-500 to-yellow-600"
            }

           const currentColors = sectorColors[sectorId as keyof typeof sectorColors] || "from-gray-500 to-gray-600"

                                   return (
              <Card key={sectorId} className="text-center p-6 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gray-200 dark:border-gray-700 relative group hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
                {/* Background decorativo */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${currentColors}`}></div>
                
                                 {/* Botão de adicionar nova sala */}
                 {isAdmin && (
                   <button 
                     className="absolute top-3 right-3 w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:scale-110"
                     title="Adicionar nova sala ao setor"
                     onClick={() => {
                       setNewRecord(prev => ({ ...prev, sector: sectorId }))
                       setIsAddDialogOpen(true)
                     }}
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                 )}
                
                {/* Número de localizações */}
                <div className="relative mb-3">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${currentColors} text-white rounded-full shadow-lg mb-3`}>
                    <span className="text-2xl font-bold">{records.length}</span>
                  </div>
                </div>
                
                {/* Nome do setor */}
                <div className="mb-4">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-1">
                    {sector.name.split(" - ")[1] || sector.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {sector.name.split(" - ")[0]}
                  </div>
                </div>
                
                                 {/* Status badges */}
                 <div className="space-y-1">
                   {statusCounts["em-dia"] > 0 && (
                     <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium border border-green-200 shadow-sm whitespace-nowrap">
                       ✅ {statusCounts["em-dia"]} em dia
                     </div>
                   )}
                   {statusCounts["atrasada-1"] > 0 && (
                     <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium border border-yellow-200 shadow-sm whitespace-nowrap">
                       ⚠️ {statusCounts["atrasada-1"]} D-1
                     </div>
                   )}
                   {(statusCounts["atrasada-2"] || 0) + (statusCounts["atrasada-6"] || 0) + (statusCounts["atrasada-13"] || 0) + (statusCounts["atrasada-14"] || 0) > 0 && (
                     <div className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium border border-red-200 shadow-sm whitespace-nowrap">
                       🚨 {(statusCounts["atrasada-2"] || 0) + (statusCounts["atrasada-6"] || 0) + (statusCounts["atrasada-13"] || 0) + (statusCounts["atrasada-14"] || 0)} atrasadas
                     </div>
                   )}
                 </div>
                
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Card>
            )
         })}
       </div>

             {/* Tabela de Registros */}
       <div className="space-y-6">
         {Object.entries(groupedRecords).map(([sectorId, { sector, records }]) => {
           // Definir cores baseadas no setor para o header
           const sectorColors = {
             "1": "from-blue-500 to-blue-600",
             "2": "from-green-500 to-green-600", 
             "3": "from-cyan-500 to-cyan-600",
             "4": "from-orange-500 to-orange-600",
             "5": "from-teal-500 to-teal-600",
             "6": "from-emerald-500 to-emerald-600",
             "7": "from-indigo-500 to-indigo-600",
             "8": "from-red-500 to-red-600",
             "9": "from-gray-500 to-gray-600",
             "10": "from-yellow-500 to-yellow-600"
           }
           
           const currentColors = sectorColors[sectorId as keyof typeof sectorColors] || "from-gray-500 to-gray-600"
           
           return (
             <Card key={sectorId} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
               <CardHeader className={`bg-gradient-to-r ${currentColors} text-white p-6`}>
                 <CardTitle className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
                     <span className="text-xl font-bold text-white">
                       {sector.name}
                     </span>
                   </div>
                   <div className="flex items-center gap-3">
                     <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm font-semibold px-4 py-2">
                       📍 {records.length} localizações
                     </Badge>
                                           {isAdmin && (
                        <button 
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                          title="Adicionar nova sala ao setor"
                          onClick={() => {
                            setNewRecord(prev => ({ ...prev, sector: sectorId }))
                            setIsAddDialogOpen(true)
                          }}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      )}
                   </div>
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <div className="overflow-x-auto">
                   <table className="w-full min-w-[800px]">
                                           <thead className="bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Localização
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Data da Última Limpeza
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Conferido Por
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Ações
                          </th>
                        </tr>
                      </thead>
                     <tbody className="divide-y divide-gray-200/50 dark:divide-gray-600/50">
                       {records.map((record, index) => {
                         const status = getCleaningStatus(record.lastCleaningDate)
                         const StatusIcon = status.icon
                         
                         return (
                           <tr key={record.id} className={`hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 transition-all duration-200 group ${index % 2 === 0 ? 'bg-white/50 dark:bg-gray-800/50' : 'bg-gray-50/50 dark:bg-gray-900/50'}`}>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                 <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentColors} shadow-sm`}></div>
                                 <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
                                   {record.location}
                                 </span>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                 <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                   {format(parseISO(record.lastCleaningDate), "dd/MM/yyyy", { locale: ptBR })}
                                 </span>
                               </div>
                             </td>
                             <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                 <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                   {record.checkedBy ? record.checkedBy.charAt(0) : "—"}
                                 </div>
                                 <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                   {record.checkedBy || "—"}
                                 </span>
                               </div>
                             </td>
                                                           <td className="px-6 py-4">
                                <Badge className={`${status.color} flex items-center gap-1 px-2 py-1 rounded-full font-semibold text-xs shadow-sm border-0 whitespace-nowrap`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </Badge>
                              </td>
                                                           <td className="px-6 py-4">
                                                                 {isAdmin ? (
                                   <div className="flex flex-col sm:flex-row gap-2">
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleEditRecord(record)}
                                       className="h-9 px-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                                     >
                                       <Edit3 className="w-4 h-4 mr-1" />
                                       <span className="hidden sm:inline">Editar</span>
                                     </Button>
                                     <Button
                                       size="sm"
                                       variant="outline"
                                       onClick={() => handleDeleteRecord(record.id)}
                                       className="h-9 px-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 hover:border-red-300 dark:hover:border-red-600 shadow-sm transition-all duration-200 hover:scale-105 text-xs sm:text-sm"
                                     >
                                       <Trash2 className="w-4 h-4 mr-1" />
                                       <span className="hidden sm:inline">Excluir</span>
                                     </Button>
                                   </div>
                                 ) : (
                                  <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Apenas visualização
                                  </span>
                                )}
                              </td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>
               </CardContent>
             </Card>
           )
         })}
       </div>
    </div>
  )
}
