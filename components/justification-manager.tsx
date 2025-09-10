"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { militaryPersonnel } from "@/lib/static-data"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
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
      console.log('🔍 Iniciando busca de justificativas...')
      console.log('📡 URL do Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log('🔑 Chave anônima configurada:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      const { data, error } = await (supabase as any)
        .from('military_justifications')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Resposta do Supabase:', { data, error })
      
      if (error) {
        console.error('❌ Erro do Supabase:', error)
        console.error('📋 Código do erro:', error.code)
        console.error('💬 Mensagem do erro:', error.message)
        console.error('🔍 Detalhes do erro:', error.details)
        throw error
      }
      
      console.log('✅ Justificativas carregadas com sucesso:', data)
      setJustifications(data || [])
    } catch (error: any) {
      console.error('💥 Erro ao buscar justificativas:', error)
      console.error('📋 Tipo do erro:', typeof error)
      console.error('🔍 Propriedades do erro:', Object.keys(error))
      
      let errorMessage = "Não foi possível carregar as justificativas."
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
      if (editingId) {
        // Atualizar justificativa existente
        const { data, error } = await (supabase as any)
          .from('military_justifications')
          .update({
            military_id: formData.military_id,
            military_name: formData.military_name,
            reason: formData.reason,
            start_date: formData.start_date,
            end_date: formData.end_date,
          })
          .eq('id', editingId)
          .select()

        if (error) throw error

        console.log('Justificativa atualizada:', data)
        toast({
          title: "Sucesso",
          description: "Justificativa atualizada com sucesso!",
        })
      } else {
        // Criar nova justificativa
        const { data, error } = await (supabase as any)
          .from('military_justifications')
          .insert([{
            military_id: formData.military_id,
            military_name: formData.military_name,
            reason: formData.reason,
            start_date: formData.start_date,
            end_date: formData.end_date,
          }])
          .select()

        if (error) throw error

        console.log('Justificativa criada:', data)
        toast({
          title: "Sucesso",
          description: "Justificativa criada com sucesso!",
        })
      }

      await fetchJustifications()
      setIsModalOpen(false)
      resetForm()
    } catch (error: any) {
      console.error('Erro completo ao salvar justificativa:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Propriedades do erro:', Object.keys(error))
      
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
      end_date: justification.end_date,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta justificativa?')) return

    try {
      const { error } = await (supabase as any)
        .from('military_justifications')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: "Sucesso",
        description: "Justificativa excluída com sucesso!",
      })

      await fetchJustifications()
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
    setFormData({
      military_id: "",
      military_name: "",
      reason: "",
      start_date: "",
      end_date: ""
    })
    setEditingId(null)
  }

  const handleMilitaryChange = (militaryId: string) => {
    const military = militaryPersonnel.find(m => m.id === militaryId)
    if (military) {
      setFormData(prev => ({
        ...prev,
        military_id: militaryId,
        military_name: `${military.rank} ${military.name}`
      }))
    }
  }

  const getSelectedMilitaryDisplay = () => {
    const military = militaryPersonnel.find(m => m.id === formData.military_id)
    return military ? `${military.rank} ${military.name}` : ""
  }

  const getMilitaryDisplayName = (militaryId: string) => {
    const military = militaryPersonnel.find(m => m.id === militaryId)
    return military ? `${military.rank} ${military.name}` : "Militar não encontrado"
  }

  const formatarDataParaExibicao = (data: string) => {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  }

  const getJustificationStats = () => {
    const now = new Date();
    const totalJustifications = justifications.length;
    const thisYearJustifications = justifications.filter(j => new Date(j.created_at!).getFullYear() === now.getFullYear()).length;
    const thisMonthJustifications = justifications.filter(j => new Date(j.created_at!).getMonth() === now.getMonth()).length;

    // Contar justificativas ativas hoje (se a data de início for hoje ou anterior)
    const activeJustificationsToday = justifications.filter(j => {
      const startDate = new Date(j.start_date);
      return startDate <= now && new Date(j.end_date) >= now;
    }).length;

    return {
      total: totalJustifications,
      thisYear: thisYearJustifications,
      thisMonth: thisMonthJustifications,
      activeJustifications: activeJustificationsToday
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Estatísticas das Justificativas - Design normal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {getJustificationStats().total}
            </p>
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total de Justificativas</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {getJustificationStats().thisYear}
            </p>
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Este Ano</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {getJustificationStats().thisMonth}
            </p>
            <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Este Mês</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {getJustificationStats().activeJustifications}
            </p>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Ativas Hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Nova Justificativa - Design normal */}
      <div className="text-center">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingId(null)
                resetForm()
                setIsModalOpen(true)
              }}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Justificativa
            </Button>
          </DialogTrigger>
          
          <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">
                {editingId ? "Editar Justificativa" : "Nova Justificativa"}
              </DialogTitle>
              <DialogDescription className="text-center text-muted-foreground">
                {editingId ? 'Edite os dados da justificativa selecionada.' : 'Preencha os dados para criar uma nova justificativa.'}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção do Militar */}
              <div className="space-y-2">
                <Label htmlFor="military" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Militar *
                </Label>
                <Select 
                  value={formData.military_id} 
                  onValueChange={handleMilitaryChange}
                >
                  <SelectTrigger className="h-11 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                    <SelectValue placeholder="Selecione o militar">
                      {formData.military_id ? getSelectedMilitaryDisplay() : "Selecione o militar"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {militaryPersonnel.map((military) => (
                      <SelectItem key={military.id} value={military.id} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-700">
                            {military.rank.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium">{military.rank} {military.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.military_id && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-2">
                    Selecionado: {getSelectedMilitaryDisplay()}
                  </p>
                )}
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Data de Início *
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="h-11 border-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Data de Término *
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="h-11 border-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Descrição/Motivo */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Descrição/Motivo da Justificativa *
                </Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Digite aqui o motivo da justificativa (ex: Atestado médico, Serviço externo, Dispensa, etc.)"
                  className="min-h-[120px] border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none"
                />
              </div>

              {/* Preview da Justificativa */}
              {formData.military_id && formData.start_date && formData.end_date && formData.reason && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 text-center">
                    Prévia da Justificativa
                  </h4>
                  <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                    <p><span className="font-medium">Militar:</span> {getSelectedMilitaryDisplay()}</p>
                    <p><span className="font-medium">Período:</span> {formData.start_date} a {formData.end_date}</p>
                    <p><span className="font-medium">Motivo:</span> {formData.reason}</p>
                  </div>
                </div>
              )}

              <DialogFooter className="flex gap-2">
                <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  {editingId ? "Atualizar Justificativa" : "Criar Justificativa"}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="border-gray-300 hover:bg-gray-50"
                >
                  Cancelar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Justificativas - Design melhorado */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
        <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-bold">Justificativas Existentes</span>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {justifications.length} justificativa{justifications.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {justifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <span className="text-4xl font-bold text-slate-600 dark:text-slate-300">J</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mb-2">
                Nenhuma justificativa encontrada
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-sm">
                Crie a primeira justificativa usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {justifications.map((justification) => (
                <div
                  key={justification.id}
                  className="border-0 rounded-xl p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:shadow-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        {getMilitaryDisplayName(justification.military_id)}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                            Motivo da Justificativa:
                          </p>
                          <p className="text-slate-800 dark:text-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border-l-4 border-l-blue-500">
                            {justification.reason}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">
                            Período da Justificativa:
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Início: {formatarDataParaExibicao(justification.start_date)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                Fim: {formatarDataParaExibicao(justification.end_date)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {justification.created_at && (
                            <p>
                              <strong>Criada em:</strong> {format(new Date(justification.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </p>
                          )}
                          {justification.military_name && (
                            <p>
                              <strong>Nome do Militar:</strong> {justification.military_name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(justification)}
                        className="flex items-center gap-2 w-full bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600"
                      >
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(justification.id!)}
                        className="flex items-center gap-2 w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600"
                      >
                        Excluir
                      </Button>
                    </div>
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
