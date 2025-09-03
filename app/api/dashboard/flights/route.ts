import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todos os voos
    const { data: flights, error: flightsError } = await supabase
      .from('flight_schedules')
      .select('*')
    
    if (flightsError) {
      console.error('Erro ao buscar voos:', flightsError)
      return NextResponse.json({ error: 'Erro ao buscar dados de voos' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0]
    
    const total = flights?.length || 0
    const todayFlights = flights?.filter(f => f.flight_date === todayISO)?.length || 0
    
    // Voos agendados (futuros)
    const scheduled = flights?.filter(f => {
      const flightDate = new Date(f.flight_date)
      return flightDate > today
    })?.length || 0
    
    const flightsData = {
      total,
      today: todayFlights,
      scheduled
    }
    
    console.log('Dados de voos calculados:', flightsData)
    
    return NextResponse.json(flightsData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
