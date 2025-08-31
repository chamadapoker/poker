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
import { Edit, Trash2, Plus, Save, X, Calendar, User, FileText, Clock } from "lucide-react"
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
      
      const { data, error } = await supabase
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
      // CORREÇÃO DEFINITIVA: Enviar datas diretamente como strings, sem conversão
      const justificationData = {
        military_id: formData.military_id,
        military_name: formData.military_name,
        reason: formData.reason,
        start_date: formData.start_date,  // Enviar diretamente
        end_date: formData.end_date       // Enviar diretamente
      }

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
      setIsModalOpen(false)
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
    setIsModalOpen(true)
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
    setIsModalOpen(false)
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

  const getJustificationStats = () => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas das Justificativas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Justificativas</p>
                <p className="text-2xl font-bold text-blue-900">{getJustificationStats().total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Este Ano</p>
                <p className="text-2xl font-bold text-green-900">{getJustificationStats().thisYear}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Este Mês</p>
                <p className="text-2xl font-bold text-purple-900">{getJustificationStats().thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">🗓️</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Ativas Hoje</p>
                <p className="text-2xl font-bold text-orange-900">{getJustificationStats().activeJustifications}</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Nova/Editar Justificativa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button 
            onClick={() => {
              setEditingId(null)
              resetForm()
              setIsModalOpen(true)
            }}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Justificativa
          </Button>
        </DialogTrigger>
        
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              {editingId ? (
                <>
                  <Edit className="h-5 w-5 text-blue-600" />
                  Editar Justificativa
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-green-600" />
                  Nova Justificativa
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingId ? 'Edite os dados da justificativa selecionada.' : 'Preencha os dados para criar uma nova justificativa.'}
            </DialogDescription>
                    </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Seleção do Militar */}
            <div className="space-y-2">
              <Label htmlFor="military" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
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
                <p className="text-sm text-blue-600 font-medium mt-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Selecionado: {getSelectedMilitaryDisplay()}
                </p>
              )}
            </div>

            {/* Datas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-600" />
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
                <Label htmlFor="endDate" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
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
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-purple-600" />
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
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Preview da Justificativa
                </h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Militar:</span> {getSelectedMilitaryDisplay()}</p>
                  <p><span className="font-medium">Período:</span> {formData.start_date} a {formData.end_date}</p>
                  <p><span className="font-medium">Motivo:</span> {formData.reason}</p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                {editingId ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Atualizar Justificativa
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Justificativa
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                className="border-gray-300 hover:bg-gray-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lista de Justificativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Justificativas Existentes</span>
            <Badge variant="secondary" className="text-sm">
              {justifications.length} justificativa{justifications.length !== 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {justifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                Nenhuma justificativa encontrada
              </p>
              <p className="text-muted-foreground text-sm">
                Crie a primeira justificativa usando o formulário acima
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {justifications.map((justification) => (
                <div
                  key={justification.id}
                  className="border rounded-lg p-6 hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        {getMilitaryDisplayName(justification.military_id)}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">
                            <strong>Motivo da Justificativa:</strong>
                          </p>
                          <p className="text-foreground bg-muted/50 p-3 rounded-md border-l-4 border-l-blue-500">
                            {justification.reason}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground mb-1">
                            <strong>Período da Justificativa:</strong>
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <span className="mr-1">📅</span>
                                Início: {formatarDataParaExibicao(justification.start_date)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <span className="mr-1">📅</span>
                                Fim: {formatarDataParaExibicao(justification.end_date)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
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
                        className="flex items-center gap-2 w-full"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(justification.id!)}
                        className="flex items-center gap-2 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
