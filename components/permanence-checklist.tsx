"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { fetchMilitaryPersonnel } from "@/lib/client-data"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { DailyPermanenceRecord, MilitaryPersonnel } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function PermanenceChecklist() {
  const [checklistItems, setChecklistItems] = useState<Array<{ id: number, text: string, checked: boolean }>>([])
  const [selectedMilitary, setSelectedMilitary] = useState<string>("")
  const [dailyRecords, setDailyRecords] = useState<DailyPermanenceRecord[]>([])
  const [notes, setNotes] = useState<string>("")

  const [militaryPersonnel, setMilitaryPersonnel] = useState<MilitaryPersonnel[]>([
    { id: "1", name: "NYCOLAS", rank: "S1", role: "military", created_at: "", updated_at: "" },
    { id: "2", name: "GABRIEL REIS", rank: "S1", role: "military", created_at: "", updated_at: "" },
    { id: "3", name: "DOUGLAS SILVA", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "4", name: "DA ROSA", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "5", name: "PIBER", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "6", name: "DENARDIN", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "7", name: "MILESI", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "8", name: "JOÃO GABRIEL", rank: "S2", role: "military", created_at: "", updated_at: "" },
    { id: "9", name: "VIEIRA", rank: "S2", role: "military", created_at: "", updated_at: "" },
  ])
  const today = format(new Date(), "yyyy-MM-dd")

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

    // Buscar o militar selecionado da lista local
    const military = militaryPersonnel.find(m => m.id === selectedMilitary)
    
    if (!military) {
      toast({
        title: "Militar não encontrado",
        description: "O militar selecionado não é válido.",
        variant: "destructive",
      })
      return
    }

    try {
      // Simplificar a estrutura de dados para evitar problemas
      const newRecord = {
        military_id: selectedMilitary,
        military_name: military.name,
        rank: military.rank,
        date: today,
        status: checklistItems.every((item) => item.checked) ? "presente" : "ausente",
        details: JSON.stringify({
          items: checklistItems,
          notes: notes,
          completed_at: new Date().toISOString()
        })
      }

      console.log("Tentando salvar registro:", newRecord)

      // Tentar inserir sem o .select() primeiro
      const { error } = await supabase
        .from("daily_permanence_records")
        .insert([newRecord])

      if (error) {
        console.error("Error saving daily permanence record:", error)
        console.error("Error details:", JSON.stringify(error, null, 2))
        
        // Se o erro for sobre a coluna details, tentar sem ela
        if (error.message && error.message.includes("details")) {
          console.log("Tentando salvar sem a coluna details...")
          const simpleRecord = {
            military_id: selectedMilitary,
            military_name: military.name,
            rank: military.rank,
            date: today,
            status: checklistItems.every((item) => item.checked) ? "presente" : "ausente"
          }
          
          const { error: simpleError } = await supabase
            .from("daily_permanence_records")
            .insert([simpleRecord])
            
          if (simpleError) {
            console.error("Erro mesmo sem details:", simpleError)
            toast({
              title: "Erro ao salvar registro",
              description: "Problema com a estrutura da tabela. Contate o administrador.",
              variant: "destructive",
            })
            return
          }
        } else {
          toast({
            title: "Erro ao salvar registro",
            description: error.message || "Erro desconhecido ao salvar o registro",
            variant: "destructive",
          })
          return
        }
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header da página */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
          {selectedMilitary ? (
            <>
              Permanência - {militaryPersonnel.find(m => m.id === selectedMilitary)?.name}
            </>
          ) : (
            "Checklist de Permanência"
          )}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {selectedMilitary ? (
            `Militar de serviço: ${militaryPersonnel.find(m => m.id === selectedMilitary)?.rank} ${militaryPersonnel.find(m => m.id === selectedMilitary)?.name}`
          ) : (
            "Selecione o militar para iniciar o checklist"
          )}
        </p>
      </div>

      {/* Grid de cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Card do Checklist */}
        <Card className="w-full shadow-lg border-0 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Checklist de Tarefas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <Select value={selectedMilitary} onValueChange={setSelectedMilitary}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o Militar">
                  {selectedMilitary && militaryPersonnel.find(m => m.id === selectedMilitary) && (
                    `${militaryPersonnel.find(m => m.id === selectedMilitary)?.rank} ${militaryPersonnel.find(m => m.id === selectedMilitary)?.name}`
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {militaryPersonnel.map((militar) => (
                  <SelectItem key={militar.id} value={militar.id}>
                    {militar.rank} {militar.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
            
            <Button onClick={handleSaveRecord} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              ✅ Finalizar Checklist
            </Button>
          </CardContent>
        </Card>

        {/* Card de Notas */}
        <Card className="w-full shadow-lg border-0 bg-white dark:bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Notas e Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Adicione observações importantes:
              </Label>
              <Textarea
                id="notes"
                placeholder="Digite aqui suas observações, anotações ou comentários sobre o serviço..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[200px] resize-none border-slate-200 dark:border-slate-700 focus:border-green-500 dark:focus:border-green-400"
              />
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
      <Card className="w-full shadow-lg border-0 bg-white dark:bg-slate-800">
        <CardHeader className="bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Histórico de Registros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {dailyRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg text-slate-600 dark:text-slate-400">Nenhum registro encontrado</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Complete um checklist para ver o histórico</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Data</th>
                    <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Militar</th>
                    <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Itens Completos</th>
                    <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRecords.map((record) => (
                    <tr key={record.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                      <td className="p-3 font-medium">{record.date}</td>
                      <td className="p-3 font-medium">{record.military_name}</td>
                                              <td className="p-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {record.details ? (() => {
                              try {
                                const parsed = JSON.parse(record.details)
                                if (parsed.items) {
                                  return `${parsed.items.filter((item: any) => item.checked).length} / ${parsed.items.length}`
                                } else if (parsed.checklist) {
                                  return `${parsed.checklist.filter((item: any) => item.checked).length} / ${parsed.checklist.length}`
                                } else {
                                  // Fallback para estrutura antiga
                                  return `${parsed.filter((item: any) => item.checked).length} / ${parsed.length}`
                                }
                              } catch {
                                return "0 / 0"
                              }
                            })() : "0 / 0"}
                          </span>
                        </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.status === 'presente' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {record.status === 'presente' ? '✅ Presente' : '❌ Ausente'}
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
