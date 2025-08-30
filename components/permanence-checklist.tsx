"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { militaryPersonnel } from "@/lib/data"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import type { DailyPermanenceRecord } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function PermanenceChecklist() {
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, text: "Verificar viaturas", checked: false },
    { id: 2, text: "Conferir armamento", checked: false },
    { id: 3, text: "Relatar ocorrências", checked: false },
  ])
  const [selectedMilitary, setSelectedMilitary] = useState<string>("")
  const [dailyRecords, setDailyRecords] = useState<DailyPermanenceRecord[]>([])
  const today = format(new Date(), "yyyy-MM-dd")

  useEffect(() => {
    fetchDailyRecords()
  }, [])

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

    const military = militaryPersonnel.find((m) => m.id === selectedMilitary)
    if (!military) {
      toast({
        title: "Militar não encontrado",
        description: "O militar selecionado não é válido.",
        variant: "destructive",
      })
      return
    }

    const newRecord: Omit<DailyPermanenceRecord, "id" | "createdAt" | "updatedAt"> = {
      militaryId: military.id,
      militaryName: military.name,
      date: today,
      checklist: checklistItems,
      status: checklistItems.every((item) => item.checked) ? "presente" : "ausente", // Simplified status logic
    }

    const { error } = await supabase.from("daily_permanence_records").insert([newRecord])

    if (error) {
      console.error("Error saving daily permanence record:", error)
      toast({
        title: "Erro ao salvar registro",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Registro Salvo!",
        description: `Checklist de permanência para ${military.name} em ${today} salvo com sucesso.`,
      })
      // Reset checklist and selected military
      setChecklistItems([
        { id: 1, text: "Verificar viaturas", checked: false },
        { id: 2, text: "Conferir armamento", checked: false },
        { id: 3, text: "Relatar ocorrências", checked: false },
      ])
      setSelectedMilitary("")
      fetchDailyRecords() // Refresh history
    }
  }

  return (
    <div className="p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checklist de Permanência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMilitary} onValueChange={setSelectedMilitary}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Militar" />
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
            <div key={item.id} className="flex items-center space-x-2">
              <Checkbox id={`item-${item.id}`} checked={item.checked} onCheckedChange={() => handleCheck(item.id)} />
              <Label htmlFor={`item-${item.id}`}>{item.text}</Label>
            </div>
          ))}
          <Button onClick={handleSaveRecord} className="w-full">
            Finalizar Checklist
          </Button>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Registros Diários Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyRecords.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum registro diário encontrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Data</th>
                    <th className="p-2 text-left">Militar</th>
                    <th className="p-2 text-left">Itens Completos</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyRecords.map((record) => (
                    <tr key={record.id} className="border-b last:border-b-0">
                      <td className="p-2">{record.date}</td>
                      <td className="p-2">{record.militaryName}</td>
                      <td className="p-2">
                        {record.checklist.filter((item) => item.checked).length} / {record.checklist.length}
                      </td>
                      <td className="p-2">{record.status}</td>
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
