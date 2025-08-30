"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface Note {
  id: string
  content: string
  timestamp: string
}

function PersonalNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteContent, setNewNoteContent] = useState("")

  const handleAddNote = () => {
    if (newNoteContent.trim() === "") {
      toast.error("A nota não pode ser vazia.")
      return
    }
    const newNote: Note = {
      id: Date.now().toString(),
      content: newNoteContent,
      timestamp: new Date().toLocaleString(),
    }
    setNotes([...notes, newNote])
    setNewNoteContent("")
    toast.success("Nota adicionada!")
  }

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id))
    toast.info("Nota removida.")
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Notas Pessoais</CardTitle>
        <CardDescription>Anote informações importantes e lembretes.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Textarea
            placeholder="Escreva sua nota aqui..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAddNote} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4">
          {notes.length === 0 && <p className="text-gray-500">Nenhuma nota ainda.</p>}
          {notes.map((note) => (
            <div key={note.id} className="border rounded-md p-3 flex justify-between items-start">
              <div>
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-gray-500 mt-1">{note.timestamp}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)} aria-label="Deletar nota">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export { PersonalNotes }
export default PersonalNotes
