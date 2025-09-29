import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar histórico de chaves
    const { data: keyHistory, error: keyHistoryError } = await supabase
      .from('claviculario_keys')
      .select('*')
    
    if (keyHistoryError) {
      console.error('Erro ao buscar histórico de chaves:', keyHistoryError)
      return NextResponse.json({ error: 'Erro ao buscar dados de chaves' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = keyHistory?.length || 0
    
    // Chaves disponíveis (não emprestadas)
    const available = keyHistory?.filter(k => k.type === 'devolução')?.length || 0
    
    // Chaves emprestadas
    const borrowed = keyHistory?.filter(k => k.type === 'empréstimo')?.length || 0
    
    const keysData = {
      total,
      available,
      borrowed
    }
    
    console.log('Dados de chaves calculados:', keysData)
    
    return NextResponse.json(keysData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
