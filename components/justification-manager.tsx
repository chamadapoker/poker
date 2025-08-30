"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Plus, Save, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { militaryPersonnel } from "@/lib/static-data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"

interface Justification {
  id?: string
  military_id: string
  military_name: string
  reason: string
  start_date: string
  end_date: string
  created_at?: string
}

export function JustificationManager() {
  const { toast } = useToast()
  const [justifications, setJustifications] = useState<Justification[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Justification>({
    military_id: "",
    military_name: "",
    reason: "",
    start_date: "",
    end_date: ""
  })

  useEffect(() => {
    fetchJustifications()
  }, [])

  const fetchJustifications = async () => {
    try {
      const { data, error } = await supabase
        .from('military_justifications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJustifications(data || [])
      console.log('Justificativas carregadas:', data)
    } catch (error: any) {
      console.error('Erro ao buscar justificativas:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as justificativas.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.military_id || !formData.reason || !formData.start_date || !formData.end_date) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    try {
      // CORREÇÃO DEFINITIVA: Enviar datas diretamente como strings, sem conversão
      console.log('=== DEBUG COMPLETO ===')
      console.log('1. FormData atual:', formData)
      console.log('2. Datas que serão enviadas:', {
        start_date: formData.start_date,
        end_date: formData.end_date
      })
      console.log('3. Tipo das datas:', {
        start_date_type: typeof formData.start_date,
        end_date_type: typeof formData.end_date
      })
      console.log('4. Data atual do sistema:', new Date().toISOString().split('T')[0])

      const justificationData = {
        military_id: formData.military_id,
        military_name: formData.military_name,
        reason: formData.reason,
        start_date: formData.start_date,  // Enviar diretamente
        end_date: formData.end_date       // Enviar diretamente
      }

      console.log('5. Dados que serão enviados para o Supabase:', justificationData)
      console.log('=== FIM DEBUG ===')
      console.log('Tentando salvar justificativa:', justificationData)

      if (editingId) {
        // Atualizar justificativa existente
        const { data, error } = await supabase
          .from('military_justifications')
          .update(justificationData)
          .eq('id', editingId)
          .select()

        if (error) {
          console.error('Erro Supabase (update):', error)
          throw error
        }
        
        console.log('Justificativa atualizada:', data)
        toast({
          title: "Sucesso",
          description: "Justificativa atualizada com sucesso!",
        })
      } else {
        // Criar nova justificativa
        const { data, error } = await supabase
          .from('military_justifications')
          .insert([justificationData])
          .select()

        if (error) {
          console.error('Erro Supabase (insert):', error)
          throw error
        }
        
        console.log('Justificativa criada:', data)
        toast({
          title: "Sucesso",
          description: "Justificativa criada com sucesso!",
        })
      }

      // Limpar formulário e recarregar dados
      resetForm()
      fetchJustifications()
    } catch (error: any) {
      console.error('Erro completo ao salvar justificativa:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Mensagem do erro:', error?.message)
      console.error('Código do erro:', error?.code)
      console.error('Detalhes do erro:', error?.details)
      
      let errorMessage = "Erro ao salvar a justificativa."
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.code) {
        errorMessage = `Erro ${error.code}: ${errorMessage}`
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const handleEdit = (justification: Justification) => {
    setEditingId(justification.id!)
    setFormData({
      military_id: justification.military_id,
      military_name: justification.military_name,
      reason: justification.reason,
      start_date: justification.start_date,
      end_date: justification.end_date
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta justificativa?')) return

    try {
      const { error } = await supabase
        .from('military_justifications')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast({
        title: "Sucesso",
        description: "Justificativa excluída com sucesso!",
      })
      
      fetchJustifications()
    } catch (error: any) {
      console.error('Erro ao excluir justificativa:', error)
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir a justificativa.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setFormData({
      military_id: "",
      military_name: "",
      reason: "",
      start_date: "",
      end_date: ""
    })
  }

  const handleMilitaryChange = (militaryId: string) => {
    console.log('Militar selecionado:', militaryId)
    
    // Validar se o ID não está vazio
    if (!militaryId || militaryId.trim() === '') {
      console.log('ID do militar está vazio, ignorando seleção')
      return
    }
    
    const military = militaryPersonnel.find(m => m.id === militaryId)
    if (military) {
      console.log('Dados do militar encontrado:', military)
      setFormData(prev => ({
        ...prev,
        military_id: militaryId,
        military_name: military.name
      }))
      console.log('Estado atualizado:', {
        military_id: militaryId,
        military_name: military.name
      })
    } else {
      console.error('Militar não encontrado para ID:', militaryId)
    }
  }

  const getMilitaryDisplayName = (militaryId: string) => {
    const military = militaryPersonnel.find(m => m.id === militaryId)
    return military ? `${military.rank} ${military.name}` : militaryId
  }

  const getSelectedMilitaryDisplay = () => {
    if (!formData.military_id) return ""
    const military = militaryPersonnel.find(m => m.id === formData.military_id)
    return military ? `${military.rank} ${military.name}` : ""
  }

  // Função para formatar data YYYY-MM-DD para DD/MM/AAAA sem problemas de timezone
  const formatarDataParaExibicao = (dataString: string) => {
    console.log('Formatando data para exibição:', dataString)
    
    // Se a data está no formato YYYY-MM-DD, converter diretamente
    if (dataString.includes('-') && dataString.length === 10) {
      const [year, month, day] = dataString.split('-')
      const dataFormatada = `${day}/${month}/${year}`
      console.log('Data formatada:', {
        original: dataString,
        formatada: dataFormatada
      })
      return dataFormatada
    }
    
    // Se não estiver no formato esperado, tentar com new Date()
    try {
      const date = new Date(dataString)
      const dataFormatada = format(date, 'dd/MM/yyyy', { locale: ptBR })
      console.log('Data formatada com new Date():', {
        original: dataString,
        formatada: dataFormatada
      })
      return dataFormatada
    } catch (error) {
      console.error('Erro ao formatar data:', error)
      return dataString
    }
  }

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {editingId ? (
              <>
                <Edit className="h-5 w-5" />
                Editar Justificativa
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Nova Justificativa
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Seleção do Militar */}
              <div>
                <Label htmlFor="military">Militar *</Label>
                <Select 
                  value={formData.military_id} 
                  onValueChange={handleMilitaryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o militar">
                      {formData.military_id ? getSelectedMilitaryDisplay() : "Selecione o militar"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {militaryPersonnel.map((military) => (
                      <SelectItem key={military.id} value={military.id}>
                        {military.rank} {military.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.military_id && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selecionado: {getSelectedMilitaryDisplay()}
                  </p>
                )}
              </div>

              {/* Data de Início */}
              <div>
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>

              {/* Data de Término */}
              <div>
                <Label htmlFor="endDate">Data de Término *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Descrição/Motivo */}
            <div>
              <Label htmlFor="reason">Descrição/Motivo da Justificativa *</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Digite aqui o motivo da justificativa (ex: Atestado médico, Serviço externo, Dispensa, etc.)"
                className="min-h-[120px]"
              />
            </div>

            {/* Debug Info */}
            <div className="p-3 bg-gray-100 rounded text-xs">
              <p><strong>Debug:</strong></p>
              <p>military_id: {formData.military_id}</p>
              <p>military_name: {formData.military_name}</p>
              <p>reason: {formData.reason}</p>
              <p>start_date: {formData.start_date}</p>
              <p>end_date: {formData.end_date}</p>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button type="submit" className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <Save className="h-4 w-4" />
                    Atualizar
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar
                  </>
                )}
              </Button>
              
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Justificativas */}
      <Card>
        <CardHeader>
          <CardTitle>Justificativas Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {justifications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma justificativa encontrada.
            </p>
          ) : (
            <div className="space-y-3">
              {justifications.map((justification) => (
                <div
                  key={justification.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium">
                        {getMilitaryDisplayName(justification.military_id)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Motivo:</strong> {justification.reason}</p>
                      <p><strong>Período:</strong> {formatarDataParaExibicao(justification.start_date)} a {formatarDataParaExibicao(justification.end_date)}</p>
                      {justification.created_at && (
                        <p><strong>Criada em:</strong> {format(new Date(justification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(justification)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(justification.id!)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default JustificationManager
