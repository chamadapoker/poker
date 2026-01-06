import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar dados de presença do dia atual
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0]
    
    // Buscar registros de presença
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('military_attendance_records')
      .select('*')
      .eq('date', todayISO)
    
    if (attendanceError) {
      console.error('Erro ao buscar presença:', attendanceError)
      return NextResponse.json({ error: 'Erro ao buscar dados de presença' }, { status: 500 })
    }
    
    // Buscar total de militares
    const { data: militaryPersonnel, error: militaryError } = await supabase
      .from('military_personnel')
      .select('*')
    
    if (militaryError) {
      console.error('Erro ao buscar militares:', militaryError)
      return NextResponse.json({ error: 'Erro ao buscar dados de militares' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const total = militaryPersonnel?.length || 0
    const present = attendanceRecords?.filter(r => r.status === 'presente')?.length || 0
    const absent = attendanceRecords?.filter(r => r.status === 'ausente')?.length || 0
    const justified = attendanceRecords?.filter(r => r.justification_id)?.length || 0
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    
    const attendanceData = {
      total,
      present,
      absent,
      justified,
      percentage
    }
    
    console.log('Dados de presença calculados:', attendanceData)
    
    return NextResponse.json(attendanceData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
