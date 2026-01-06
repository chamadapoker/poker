import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar informações da canção
    const { data: cancao, error } = await supabase
      .from('cancoes')
      .select('*')
      .eq('ativo', true)
      .single()

    if (error) {
      console.error('Erro ao buscar canção:', error)
      return NextResponse.json({ error: 'Erro ao buscar canção' }, { status: 500 })
    }

    if (!cancao) {
      return NextResponse.json({ error: 'Canção não encontrada' }, { status: 404 })
    }

    return NextResponse.json({ cancao })
  } catch (error) {
    console.error('Erro na API de canção:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { cancaoId } = await request.json()

    if (!cancaoId) {
      return NextResponse.json({ error: 'ID da canção é obrigatório' }, { status: 400 })
    }

    // Registrar download
    const { error: downloadError } = await (supabase as any)
      .from('cancao_downloads')
      .insert({
        cancao_id: cancaoId,
        user_id: user.id
      })

    if (downloadError) {
      console.error('Erro ao registrar download:', downloadError)
      return NextResponse.json({ error: 'Erro ao registrar download' }, { status: 500 })
    }

    // Incrementar contador de downloads
    const { error: incrementError } = await (supabase as any)
      .rpc('increment_download_count', { cancao_uuid: cancaoId })

    if (incrementError) {
      console.error('Erro ao incrementar contador:', incrementError)
      // Não falha a operação se o contador não puder ser incrementado
    }

    return NextResponse.json({ success: true, message: 'Download registrado com sucesso' })
  } catch (error) {
    console.error('Erro na API de download:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
