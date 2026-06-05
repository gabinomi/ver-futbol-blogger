import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const eventId = searchParams.get('id')

  if (!eventId) {
    return NextResponse.json({ error: 'Falta el parámetro id' }, { status: 400 })
  }

  try {
    const res = await fetch(`https://api.sofascore.com/api/v1/event/${eventId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.sofascore.com/',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store'
    })

    if (!res.ok) {
      return NextResponse.json({ error: `SofaScore error: ${res.status}` }, { status: res.status })
    }

    const data = await res.json()
    const event = data.event

    // Extraer solo lo que necesitamos
    const score = {
      id: event.id,
      status: event.status?.type,          // inprogress, finished, notstarted
      statusDescription: event.status?.description,
      minute: event.time?.currentPeriodStartTimestamp
        ? Math.floor((Date.now()/1000 - event.time.currentPeriodStartTimestamp) / 60)
        : null,
      period: event.time?.period || null,
      homeScore: event.homeScore?.current ?? 0,
      awayScore: event.awayScore?.current ?? 0,
      homeTeam: event.homeTeam?.name,
      awayTeam: event.awayTeam?.name,
      tournament: event.tournament?.name,
    }

    return NextResponse.json(score, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })

  } catch (e: any) {
    return NextResponse.json(
      { error: 'No se pudo obtener el marcador', detail: e.message },
      { status: 500 }
    )
  }
}
