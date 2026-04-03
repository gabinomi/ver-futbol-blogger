import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Obtener partidos EN VIVO con fixture_id
  const { data: partidos } = await supabaseAdmin()
    .from('partidos')
    .select('id, fixture_id')
    .eq('estado', 'EN-VIVO')
    .not('fixture_id', 'is', null)

  if (!partidos?.length) return NextResponse.json({ updated: 0 })

  const ids = partidos.map(p => p.fixture_id).join('-')
  const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${ids}`, {
    headers: { 'x-apisports-key': process.env.API_FOOTBALL_KEY! },
  })
  const data = await res.json()
  const fixtures = data?.response || []

  let updated = 0
  for (const f of fixtures) {
    const partido = partidos.find(p => p.fixture_id === f.fixture.id)
    if (!partido) continue
    await supabaseAdmin()
      .from('partidos')
      .update({
        gol_local: f.goals.home ?? 0,
        gol_visitante: f.goals.away ?? 0,
      })
      .eq('id', partido.id)
    updated++
  }

  return NextResponse.json({ updated })
}
