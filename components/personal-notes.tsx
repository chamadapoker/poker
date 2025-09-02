"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"
import { militaryPersonnel } from "@/lib/static-data"

interface Note {
  id: string
  military_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

function PersonalNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteTitle, setNewNoteTitle] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [selectedMilitary, setSelectedMilitary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Carregar notas existentes ao montar o componente
  useEffect(() => {
    fetchNotes()
  }, [])

  // Buscar notas do Supabase
  const fetchNotes = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("personal_notes")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Erro ao carregar notas:", error)
        toast.error("Erro ao carregar notas pessoais")
        return
      }

      setNotes(data || [])
      console.log("✅ Notas carregadas:", data?.length || 0, "registros")
    } catch (error) {
      console.error("Erro inesperado ao carregar notas:", error)
      toast.error("Erro inesperado ao carregar notas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNote = async () => {
    if (!selectedMilitary) {
      toast.error("Selecione um militar para a nota.")
      return
    }

    if (!newNoteTitle.trim()) {
      toast.error("O título da nota não pode ser vazio.")
      return
    }

    if (!newNoteContent.trim()) {
      toast.error("A nota não pode ser vazia.")
      return
    }

    setIsSaving(true)
    try {
      const newNote = {
        military_id: selectedMilitary,
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
      }

      console.log("💾 Tentando salvar nota:", newNote)

      const { data, error } = await supabase
        .from("personal_notes")
        .insert([newNote])
        .select()

      if (error) {
        console.error("Erro ao salvar nota:", error)
        toast.error("Erro ao salvar nota pessoal")
        return
      }

      if (data && data.length > 0) {
        const savedNote = data[0]
        setNotes([savedNote, ...notes])
        setNewNoteTitle("")
        setNewNoteContent("")
        setSelectedMilitary("")
        toast.success("Nota salva com sucesso!")
        console.log("✅ Nota salva:", savedNote)
      }
    } catch (error) {
      console.error("Erro inesperado ao salvar nota:", error)
      toast.error("Erro inesperado ao salvar nota")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("personal_notes")
        .delete()
        .eq("id", id)

      if (error) {
        console.error("Erro ao deletar nota:", error)
        toast.error("Erro ao deletar nota")
        return
      }

      setNotes(notes.filter((note) => note.id !== id))
      toast.success("Nota removida com sucesso!")
      console.log("✅ Nota deletada:", id)
    } catch (error) {
      console.error("Erro inesperado ao deletar nota:", error)
      toast.error("Erro inesperado ao deletar nota")
    }
  }

  // Buscar nome do militar pelo ID
  const getMilitaryName = (militaryId: string) => {
    const military = militaryPersonnel.find(m => m.id === militaryId)
    return military ? `${military.rank} ${military.name}` : "Militar não encontrado"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notas Pessoais</CardTitle>
        <CardDescription>Anote informações importantes e lembretes para cada militar.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Formulário para adicionar nota */}
        <div className="space-y-4 mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Militar
              </label>
              <select
                value={selectedMilitary}
                onChange={(e) => setSelectedMilitary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecione um militar</option>
                {militaryPersonnel.map((military) => (
                  <option key={military.id} value={military.id}>
                    {military.rank} {military.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                placeholder="Título da nota..."
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleAddNote} 
                disabled={isSaving || !selectedMilitary || !newNoteTitle.trim() || !newNoteContent.trim()}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Nota
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Conteúdo da Nota
            </label>
            <Textarea
              placeholder="Escreva sua nota aqui..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="w-full"
              rows={3}
              required
            />
          </div>
        </div>

        {/* Lista de notas */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Carregando notas...</span>
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma nota pessoal encontrada.</p>
              <p className="text-sm">Adicione uma nota usando o formulário acima.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{note.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Militar:</span> {getMilitaryName(note.military_id)}
                    </p>
                    <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    aria-label="Deletar nota"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 border-t pt-2">
                  <span>Criada em: {new Date(note.created_at).toLocaleString('pt-BR')}</span>
                  {note.updated_at !== note.created_at && (
                    <span className="ml-4">
                      Atualizada em: {new Date(note.updated_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { PersonalNotes }
export default PersonalNotes
