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
    
    // Buscar justificativas válidas para hoje
    const { data: justifications, error: justificationsError } = await supabase
      .from('military_justifications')
      .select('*')
      .lte('start_date', todayISO)
      .gte('end_date', todayISO)
      .eq('approved', true)
    
    if (justificationsError) {
      console.error('Erro ao buscar justificativas:', justificationsError)
      // Continuar sem justificativas se houver erro
    }
    
    // Calcular estatísticas considerando justificativas
    const total = militaryPersonnel?.length || 0
    const present = attendanceRecords?.filter(r => r.status === 'presente')?.length || 0
    const absent = attendanceRecords?.filter(r => r.status === 'ausente')?.length || 0
    
    // Contar justificados: registros com justification_id OU nomes com justificativa válida
    const justifiedFromRecords = attendanceRecords?.filter(r => r.justification_id)?.length || 0
    const justifiedFromJustifications = justifications?.length || 0
    const justified = Math.max(justifiedFromRecords, justifiedFromJustifications)
    
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0
    
    const attendanceData = {
      total,
      present,
      absent,
      justified,
      percentage,
      justifications_count: justifications?.length || 0,
      attendance_records_count: attendanceRecords?.length || 0
    }
    
    console.log('Dados de presença calculados:', attendanceData)
    console.log('Justificativas válidas para hoje:', justifications?.length || 0)
    
    return NextResponse.json(attendanceData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
