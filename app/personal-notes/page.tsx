import { PersonalNotes } from "@/components/personal-notes"

export default function PersonalNotesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notas Pessoais</h1>
        <p className="text-muted-foreground">
          Gerencie suas notas e anotações pessoais
        </p>
      </div>
      
      <PersonalNotes />
    </div>
  )
}
