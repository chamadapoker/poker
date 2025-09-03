import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todas as justificativas
    const { data: justifications, error: justificationsError } = await supabase
      .from('military_justifications')
      .select('*')
    
    if (justificationsError) {
      console.error('Erro ao buscar justificativas:', justificationsError)
      return NextResponse.json({ error: 'Erro ao buscar dados de justificativas' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = justifications?.length || 0
    const pending = justifications?.filter(j => !j.approved)?.length || 0
    const approved = justifications?.filter(j => j.approved)?.length || 0
    const rejected = justifications?.filter(j => j.approved === false)?.length || 0
    
    const justificationsData = {
      total,
      pending,
      approved,
      rejected
    }
    
    console.log('Dados de justificativas calculados:', justificationsData)
    
    return NextResponse.json(justificationsData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
