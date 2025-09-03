"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { DailyPermanenceRecord } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { militaryPersonnel } from "@/lib/static-data"

function PermanenceChecklist() {
  const [checklistItems, setChecklistItems] = useState<Array<{ id: number, text: string, checked: boolean }>>([])
  const [selectedMilitary, setSelectedMilitary] = useState<string>("")
  const [dailyRecords, setDailyRecords] = useState<DailyPermanenceRecord[]>([])
  const [notes, setNotes] = useState<string>("")

  // Usar dados do static-data.ts
  const today = format(new Date(), "yyyy-MM-dd")

  // Filtrar militares para mostrar apenas os específicos solicitados
  const filteredMilitaryPersonnel = militaryPersonnel.filter(military => {
    // Lista específica dos militares solicitados
    const allowedMilitary = [
      { rank: "S1", name: "NYCOLAS" },
      { rank: "S1", name: "GABRIEL REIS" },
      { rank: "S2", name: "DOUGLAS SILVA" },
      { rank: "S2", name: "DA ROSA" },
      { rank: "S2", name: "DENARDIN" },
      { rank: "S2", name: "MILESI" },
      { rank: "S2", name: "JOÃO GABRIEL" },
      { rank: "S2", name: "VIEIRA" },
      { rank: "S2", name: "PIBER" }
    ]
    
    // Verificar se o militar atual está na lista permitida
    return allowedMilitary.some(allowed => 
      allowed.rank === military.rank && allowed.name === military.name
    )
  })

  // Debug: verificar se o filtro está funcionando
  console.log("🔍 Debug - Lista completa:", militaryPersonnel.length, "militares")
  console.log("🔍 Debug - Lista filtrada:", filteredMilitaryPersonnel.length, "militares")
  console.log("🔍 Debug - Militares filtrados:", filteredMilitaryPersonnel.map(m => `${m.rank} ${m.name}`))
  console.log("🔍 Debug - Estado selectedMilitary:", selectedMilitary)
  
  // Debug adicional: verificar se o array está sendo renderizado
  console.log("🔍 Debug - Array para renderização:", filteredMilitaryPersonnel)

  useEffect(() => {
    fetchDailyRecords()
    fetchChecklistItems()
  }, [])



  const fetchChecklistItems = async () => {
    try {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true })

      if (error) {
        console.error("Error fetching checklist items:", error)
        toast({
          title: "Erro ao carregar itens do checklist",
          description: "Não foi possível carregar os itens do checklist.",
          variant: "destructive",
        })
      } else {
        // Transformar os dados para o formato esperado
        const items = data.map((item: any) => ({
          id: item.id,
          text: item.text,
          checked: false
        }))
        setChecklistItems(items)
      }
    } catch (error) {
      console.error("Failed to fetch checklist items:", error)
      toast({
        title: "Erro ao carregar itens do checklist",
        description: "Não foi possível carregar os itens do checklist.",
        variant: "destructive",
      })
    }
  }

  const fetchDailyRecords = async () => {
    const { data, error } = await supabase
      .from("daily_permanence_records")
      .select("*")
      .order("date", { ascending: false })
      .limit(50)
    if (error) {
      console.error("Error fetching daily permanence records:", error)
      toast({
        title: "Erro ao carregar registros diários",
        description: "Não foi possível carregar os registros de permanência.",
        variant: "destructive",
      })
    } else {
      setDailyRecords(data as DailyPermanenceRecord[])
    }
  }

  // Função para carregar checklist existente quando militar for selecionado
  const loadExistingChecklist = async (militaryId: string) => {
    if (!militaryId) return

    try {
      console.log("🔍 Carregando checklist existente para militar:", militaryId)
      
      const { data, error } = await supabase
        .from("daily_permanence_records")
        .select("*")
        .eq("military_id", militaryId)
        .eq("date", today)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Erro ao carregar checklist existente:", error)
        return
      }

      if (data && data.checklist) {
        console.log("✅ Checklist existente encontrado:", data.checklist)
        
        // Carregar itens do checklist
        if (data.checklist.items && Array.isArray(data.checklist.items)) {
          setChecklistItems(data.checklist.items)
          console.log("📋 Itens do checklist carregados:", data.checklist.items.length)
        }
        
        // Carregar notas
        if (data.checklist.notes) {
          setNotes(data.checklist.notes)
          console.log("📝 Notas carregadas:", data.checklist.notes)
        }
        
        toast({
          title: "Checklist Carregado",
          description: `Checklist existente para ${today} foi carregado.`,
        })
      } else {
        console.log("🆕 Nenhum checklist encontrado para hoje, iniciando novo")
        // Reset para novo checklist
        fetchChecklistItems()
        setNotes("")
      }
      
    } catch (error) {
      console.error("Erro inesperado ao carregar checklist:", error)
    }
  }

  // Função para lidar com mudança de militar selecionado
  const handleMilitaryChange = (militaryId: string) => {
    console.log("🔄 Militar selecionado mudou para:", militaryId)
    setSelectedMilitary(militaryId)
    
    if (militaryId) {
      // Carregar checklist existente para o militar selecionado
      loadExistingChecklist(militaryId)
    } else {
      // Reset quando nenhum militar estiver selecionado
      fetchChecklistItems()
      setNotes("")
    }
  }

  const handleCheck = (id: number) => {
    setChecklistItems(checklistItems.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }



  const handleSaveRecord = async () => {
    if (!selectedMilitary) {
      toast({
        title: "Militar não selecionado",
        description: "Por favor, selecione o militar para registrar o checklist.",
        variant: "destructive",
      })
      return
    }

    // Buscar o militar selecionado da lista filtrada
    const military = filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)
    
    if (!military) {
      toast({
        title: "Militar não encontrado",
        description: "O militar selecionado não é válido.",
        variant: "destructive",
      })
      return
    }

    try {
      // Estrutura correta baseada na tabela real
      const newRecord = {
        military_id: selectedMilitary,
        military_name: military.name,
        date: today,
        checklist: {
          items: checklistItems,
          notes: notes,
          status: checklistItems.every((item) => item.checked) ? "presente" : "ausente",
          completed_at: new Date().toISOString()
        }
      }

      console.log("Tentando salvar registro:", newRecord)

      // Tentar inserir sem o .select() primeiro
      const { error } = await supabase
        .from("daily_permanence_records")
        .insert([newRecord])

      if (error) {
        console.error("Error saving daily permanence record:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        
        toast({
          title: "Erro ao salvar registro",
          description: error.message || "Erro desconhecido ao salvar o registro",
          variant: "destructive",
        })
        return
      }

      console.log("Registro salvo com sucesso!")

      toast({
        title: "Registro Salvo!",
        description: `Checklist de permanência para ${military.name} em ${today} salvo com sucesso.`,
      })
      
      // Reset checklist and selected military
      fetchChecklistItems()
      setSelectedMilitary("")
      setNotes("")
      fetchDailyRecords() // Refresh history
      
    } catch (catchError) {
      console.error("Erro inesperado ao salvar:", catchError)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao salvar o registro. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleSavePersonalNote = async () => {
    if (!selectedMilitary) {
      toast({
        title: "Militar não selecionado",
        description: "Por favor, selecione o militar para salvar a nota.",
        variant: "destructive",
      })
      return
    }

    const military = filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)
    if (!military) {
      toast({
        title: "Militar não encontrado",
        description: "O militar selecionado não é válido.",
        variant: "destructive",
      })
      return
    }

    try {
      const newNote = {
        military_id: selectedMilitary,
        title: `Nota de Permanência - ${today}`,
        content: notes.trim(),
      }

      console.log("💾 Salvando nota pessoal:", newNote)

      const { error } = await supabase
        .from("personal_notes")
        .insert([newNote])

      if (error) {
        console.error("Erro ao salvar nota pessoal:", error)
        toast({
          title: "Erro ao salvar nota pessoal",
          description: error.message || "Erro desconhecido ao salvar a nota.",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Nota pessoal salva com sucesso!")
      toast({
        title: "Nota Pessoal Salva!",
        description: `Nota de permanência para ${military.name} em ${today} salva com sucesso.`,
      })

      // Reset notes
      setNotes("")
    } catch (catchError) {
      console.error("Erro inesperado ao salvar nota:", catchError)
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro inesperado ao salvar a nota. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header da página */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
          {selectedMilitary ? (
            <>
              Permanência - {filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)?.name}
            </>
          ) : (
            "Checklist de Permanência"
          )}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
          {selectedMilitary ? (
            `Militar de serviço: ${filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)?.rank} ${filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)?.name}`
          ) : (
            "Selecione o militar para iniciar o checklist"
          )}
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Card do Checklist */}
        <Card className="w-full border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20 border-b border-blue-200 dark:border-blue-700">
            <CardTitle className="text-lg sm:text-xl text-blue-800 dark:text-blue-200 text-center">
              📋 Checklist de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Dropdown HTML Nativo - Solução Definitiva */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Selecione o Militar:
              </label>
              
                             <Select value={selectedMilitary} onValueChange={handleMilitaryChange}>
                 <SelectTrigger className="w-full">
                   <SelectValue placeholder="Selecione o Militar" />
                 </SelectTrigger>
                 <SelectContent>
                   {filteredMilitaryPersonnel.map((militar) => (
                     <SelectItem key={militar.id} value={militar.id}>
                       {militar.rank} {militar.name}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
            </div>

            {/* Indicador do militar selecionado */}
            {selectedMilitary && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-medium">Militar selecionado:</span> {
                    filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)?.rank
                  } {filteredMilitaryPersonnel.find(m => m.id === selectedMilitary)?.name}
                </p>
              </div>
            )}

            {checklistItems.map((item) => (
              <div key={item.id} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                item.checked 
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}>
                <Checkbox 
                  id={`item-${item.id}`} 
                  checked={item.checked} 
                  onCheckedChange={() => handleCheck(item.id)}
                  className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <Label 
                  htmlFor={`item-${item.id}`} 
                  className={`flex-1 cursor-pointer transition-all duration-200 ${
                    item.checked 
                      ? 'line-through text-green-700 dark:text-green-300' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.text}
                </Label>
              </div>
            ))}
            
            <Button onClick={handleSaveRecord} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              ✅ Finalizar Checklist
            </Button>
          </CardContent>
        </Card>

        {/* Card de Notas */}
        <Card className="w-full border-0 shadow-lg bg-white dark:bg-slate-800">
          <CardHeader className="bg-green-50 dark:bg-green-950/20 border-b border-green-200 dark:border-green-700">
            <CardTitle className="text-lg sm:text-xl text-green-800 dark:text-green-200 text-center">
              📝 Notas e Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Adicione observações importantes:
              </Label>
              <Textarea
                id="notes"
                placeholder="Digite aqui suas observações, anotações ou comentários sobre o serviço..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[150px] sm:min-h-[200px] resize-none border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-400"
              />
              
              {/* Botão para salvar nota pessoal */}
              {selectedMilitary && notes.trim() && (
                <Button 
                  onClick={handleSavePersonalNote}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  💾 Salvar Nota Pessoal
                </Button>
              )}
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">💡 Dicas:</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Anote problemas encontrados durante a verificação</li>
                <li>• Registre observações sobre equipamentos</li>
                <li>• Documente situações especiais ou emergências</li>
                <li>• Adicione comentários sobre o estado geral das instalações</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Card do Histórico */}
      <Card className="w-full border-0 shadow-lg bg-white dark:bg-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-700">
          <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 text-center">
            📊 Histórico de Registros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {dailyRecords.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📝</div>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">Nenhum registro encontrado</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-500">Complete um checklist para ver o histórico</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-2 sm:p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Militar</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Itens Completos</th>
                    <th className="p-2 sm:p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                      <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{record.date}</td>
                      <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{record.military_name}</td>
                      <td className="p-2 sm:p-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {record.checklist ? (() => {
                            try {
                              const parsed = record.checklist
                              if (parsed.items) {
                                return `${parsed.items.filter((item: any) => item.checked).length} / ${parsed.items.length}`
                              } else {
                                return "0 / 0"
                              }
                            } catch {
                              return "0 / 0"
                            }
                          })() : "0 / 0"}
                        </span>
                      </td>
                      <td className="p-2 sm:p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          record.checklist?.status === 'presente' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {record.checklist?.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export { PermanenceChecklist }
export default PermanenceChecklist
