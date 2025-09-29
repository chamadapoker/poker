import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todos os chamados de TI
    const { data: tiTickets, error: tiTicketsError } = await supabase
      .from('ti_tickets')
      .select('*')
    
    if (tiTicketsError) {
      console.error('Erro ao buscar chamados de TI:', tiTicketsError)
      return NextResponse.json({ error: 'Erro ao buscar dados de TI' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = tiTickets?.length || 0
    const open = tiTickets?.filter(t => t.status === 'aberto')?.length || 0
    const inProgress = tiTickets?.filter(t => t.status === 'em_andamento')?.length || 0
    const resolved = tiTickets?.filter(t => t.status === 'resolvido')?.length || 0
    
    const tiData = {
      total,
      open,
      inProgress,
      resolved
    }
    
    console.log('Dados de TI calculados:', tiData)
    
    return NextResponse.json(tiData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
