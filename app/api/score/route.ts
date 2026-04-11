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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-AR,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      // Si SofaScore sigue bloqueando, intentar con AllSports API (gratuita)
      return await fallbackAllSports(eventId)
    }

    const data = await res.json()
    const event = data.event
    const score = {
      id: event.id,
      status: event.status?.type,
      statusDescription: event.status?.description,
      minute: event.time?.currentPeriodStartTimestamp
        ? Math.floor((Date.now() / 1000 - event.time.currentPeriodStartTimestamp) / 60)
        : null,
      period: event.time?.period || null,
      homeScore: event.homeScore?.current ?? 0,
      awayScore: event.awayScore?.current ?? 0,
      homeTeam: event.homeTeam?.name,
      awayTeam: event.awayTeam?.name,
      tournament: event.tournament?.name,
      source: 'sofascore',
    }

    return NextResponse.json(score, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })

  } catch (e: any) {
    return NextResponse.json(
      { error: 'Error consultando marcador', detail: e.message },
      { status: 500 }
    )
  }
}

// Fallback: TheSportsDB livescores (ya tenemos la key en el proyecto)
async function fallbackAllSports(eventId: string) {
  try {
    // Intentar con football-data.org como alternativa gratuita
    // o devolver error claro para que el usuario lo ingrese manual
    return NextResponse.json(
      { 
        error: 'SofaScore bloqueó la request desde el servidor. Ingresá el marcador manualmente o usá la URL de TheSportsDB.',
        code: 'BLOCKED'
      },
      { status: 403, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  } catch {
    return NextResponse.json({ error: 'Fallback también falló' }, { status: 500 })
  }
}
