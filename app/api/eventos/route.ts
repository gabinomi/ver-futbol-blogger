import { NextResponse } from 'next/server'

async function fetchStreamTP() {
  try {
    const res = await fetch('https://streamtp.sbs/eventos.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://streamtp.sbs/',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000)
    })
    if (!res.ok) return []
    return await res.json()
  } catch (e) {
    return []
  }
}

async function fetchStreamX550() {
  try {
    const res = await fetch('https://streamx741.com/json/agenda550.json?nocache=' + Date.now(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000)
    })
    if (!res.ok) return []
    const rawData = await res.json()
    
    return rawData
  } catch (e) {
    return []
  }
}

const getStreamId = (url: string) => {
  if (!url) return ''
  try {
    const u = new URL(url)
    return u.searchParams.get('stream') || u.searchParams.get('channel') || url
  } catch {
    const match = url.match(/(stream|channel)=([^&]+)/)
    return match ? match[2] : url
  }
}

const getMatchTeams = (title: string) => {
  if (!title) return ''
  const parts = title.split(':')
  return parts.length > 1 ? parts[1].toLowerCase().trim() : title.toLowerCase().trim()
}

export async function GET() {
  try {
    const [streamTpEvents, x550Events] = await Promise.all([
      fetchStreamTP(),
      fetchStreamX550()
    ])

    let merged = streamTpEvents && streamTpEvents.length > 0 ? [...streamTpEvents] : []

    if (merged.length === 0 && x550Events && x550Events.length > 0) {
      // Fallback: Si StreamTP falla, armamos la agenda exclusivamente con StreamX741
      // Nos aseguramos de no repetir exactamente el mismo partido y el mismo enlace
      const uniqueX550: any[] = []
      const seen = new Set()
      x550Events.forEach((ev: any) => {
        const teams = getMatchTeams(ev.title)
        const streamId = getStreamId(ev.link)
        const key = `${teams}-${streamId}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueX550.push(ev)
        }
      })
      merged = uniqueX550
    } else if (merged.length > 0 && x550Events && x550Events.length > 0) {
      // 1. Enriquecer streamTpEvents con categorías de x550 (usando coincidencia de equipos)
      // Pero evitamos añadir enlaces extra para NO duplicar opciones de video en el frontend
      merged = merged.map((ev: any) => {
        const teams = getMatchTeams(ev.title)
        const matchingX550 = x550Events.filter((x: any) => getMatchTeams(x.title) === teams)
        
        if (matchingX550.length > 0) {
          const cat = matchingX550.find((x: any) => x.category && x.category !== 'Other')?.category
          if (cat && (!ev.category || ev.category === 'Other')) {
            ev.category = cat
          }
        }
        return ev
      })
    }
    
    // Ordenar por hora
    merged = merged.sort((a, b) => (a.time || '').localeCompare(b.time || ''))

    if (merged.length === 0) {
      throw new Error('No se encontraron eventos en ninguna fuente.')
    }

    return NextResponse.json(merged, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'No se pudo cargar la agenda', detail: error.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
