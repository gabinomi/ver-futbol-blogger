import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 })

  const { data, error } = await supabase
    .from('marcadores')
    .select('*')
    .eq('sofascore_id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Partido no encontrado en cache', code: 'NOT_IN_CACHE' },
      { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }

  return NextResponse.json(data, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  })
}

// POST — registrar un partido para ser trackeado
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sofascore_id, equipo_local, equipo_visitante, liga, apifootball_id, sportmonks_id } = body

  if (!sofascore_id) return NextResponse.json({ error: 'Falta sofascore_id' }, { status: 400 })

  const { error } = await supabase.from('marcadores').upsert({
    sofascore_id,
    equipo_local: equipo_local || '',
    equipo_visitante: equipo_visitante || '',
    liga: liga || '',
    apifootball_id: apifootball_id || null,
    sportmonks_id: sportmonks_id || null,
    activo: true,
    gol_local: 0,
    gol_visitante: 0,
    estado: 'PRONTO',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'sofascore_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true, sofascore_id })
}
