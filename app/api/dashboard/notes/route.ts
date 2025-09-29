import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todas as notas
    const { data: notes, error: notesError } = await supabase
      .from('personal_notes')
      .select('*')
    
    if (notesError) {
      console.error('Erro ao buscar notas:', notesError)
      return NextResponse.json({ error: 'Erro ao buscar dados de notas' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = notes?.length || 0
    
    // Notas recentes (últimos 7 dias)
    const today = new Date()
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 7)
    
    const recent = notes?.filter(n => {
      const noteDate = new Date(n.created_at)
      return noteDate >= lastWeek && noteDate <= today
    })?.length || 0
    
    const notesData = {
      total,
      recent
    }
    
    console.log('Dados de notas calculados:', notesData)
    
    return NextResponse.json(notesData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
