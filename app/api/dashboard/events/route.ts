import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Buscar todos os eventos
    const { data: events, error: eventsError } = await supabase
      .from('military_events')
      .select('*')
    
    if (eventsError) {
      console.error('Erro ao buscar eventos:', eventsError)
      return NextResponse.json({ error: 'Erro ao buscar dados de eventos' }, { status: 500 })
    }
    
    // Calcular estatísticas
    const today = new Date()
    const todayISO = today.toISOString().split('T')[0]
    
    const total = events?.length || 0
    const todayEvents = events?.filter(e => e.date === todayISO)?.length || 0
    
    // Eventos próximos (próximos 7 dias)
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)
    const nextWeekISO = nextWeek.toISOString().split('T')[0]
    
    const upcoming = events?.filter(e => {
      const eventDate = new Date(e.date)
      return eventDate > today && eventDate <= nextWeek
    })?.length || 0
    
    const eventsData = {
      total,
      today: todayEvents,
      upcoming
    }
    
    console.log('Dados de eventos calculados:', eventsData)
    
    return NextResponse.json(eventsData)
    
  } catch (error) {
    console.error('Erro interno:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
