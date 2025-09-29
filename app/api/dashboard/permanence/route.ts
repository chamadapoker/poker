import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todos os registros de permanência
    const { data: permanenceRecords, error: permanenceError } = await supabase
      .from('daily_permanence_records')
      .select('*')
    
    if (permanenceError) {
      console.error('Erro ao buscar permanência:', permanenceError)
      return NextResponse.json({ error: 'Erro ao buscar dados de permanência' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = permanenceRecords?.length || 0
    const active = permanenceRecords?.filter(p => p.status === 'ativo')?.length || 0
    const completed = permanenceRecords?.filter(p => p.status === 'concluído')?.length || 0
    
    const permanenceData = {
      total,
      active,
      completed
    }
    
    console.log('Dados de permanência calculados:', permanenceData)
    
    return NextResponse.json(permanenceData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
