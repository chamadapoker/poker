import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todos os registros de faxina
    const { data: cleaningRecords, error: cleaningError } = await supabase
      .from('cleaning_records')
      .select('*')
    
    if (cleaningError) {
      console.error('Erro ao buscar registros de faxina:', cleaningError)
      return NextResponse.json({ error: 'Erro ao buscar dados de faxina' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = cleaningRecords?.length || 0
    const pending = cleaningRecords?.filter(c => c.status === 'pendente')?.length || 0
    const completed = cleaningRecords?.filter(c => c.status === 'concluído')?.length || 0
    
    // Verificar registros atrasados (mais de 14 dias)
    const today = new Date()
    const overdue = cleaningRecords?.filter(c => {
      if (c.status === 'concluído') return false
      
      const recordDate = new Date(c.date)
      const diffTime = today.getTime() - recordDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays > 14
    })?.length || 0
    
    const cleaningData = {
      total,
      pending,
      completed,
      overdue
    }
    
    console.log('Dados de faxina calculados:', cleaningData)
    
    return NextResponse.json(cleaningData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
