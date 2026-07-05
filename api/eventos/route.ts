import { NextResponse } from 'next/server'

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// Normaliza cualquier evento a formato estándar {title, time, link, category, status}
// Soporta tanto el formato streamtpnew (link: l.url) como streamx550 (link o url directo)
function normalizeEvent(ev: any, overrideStatus?: string): any {
  const link = ev.link || ev.url || ev.stream_url || ev.streamUrl || ''
  const status = overrideStatus
    ?? (ev.status ? ev.status.toLowerCase() : 'próximo')
  return {
    title:    ev.title    || ev.name    || '',
    time:     ev.time     || ev.hora    || '',
    category: ev.category || ev.cat     || '',
    link,
    status,
  }
}

// ── Fuente 1: streamtp.sbs ────────────────────────────────────────────────────

async function fetchStreamTP(): Promise<any[]> {
  try {
    const res = await fetch('https://streamtp.sbs/wc.json?nocache=' + Date.now(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer':    'https://streamtp.sbs/',
        'Accept':     'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const data = await res.json()
    const flattened: any[] = []
    if (data && data.events && Array.isArray(data.events)) {
      data.events.forEach((ev: any) => {
        if (ev.links && Array.isArray(ev.links)) {
          ev.links.forEach((l: any) => {
            const link = l.url || l.link || l.stream || ''
            if (!link) return
            flattened.push(normalizeEvent({
              title:    ev.title,
              time:     ev.time,
              category: ev.category,
              link,
            }, l.status === 'live' ? 'en vivo' : 'próximo'))
          })
        }
      })
    }
    return flattened
  } catch {
    return []
  }
}

// ── Fuente 2: streamx996 (complementaria) ────────────────────────────────────

async function fetchStreamX550(): Promise<any[]> {
  try {
    const res = await fetch('https://streamx996.one/json/agenda550.json?nocache=' + Date.now(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept':     'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    })
    if (!res.ok) return []
    const rawData = await res.json()
    if (!Array.isArray(rawData)) return []
    // Normalizar todos los eventos — soporta link, url, stream_url, etc.
    return rawData
      .map((ev: any) => normalizeEvent(ev))
      .filter((ev: any) => ev.link && ev.title && ev.time)
  } catch {
    return []
  }
}

// ── Fusión ───────────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const [streamTpEvents, x550Events] = await Promise.allSettled([
      fetchStreamTP(),
      fetchStreamX550(),
    ])

    const tp   = streamTpEvents.status === 'fulfilled' ? streamTpEvents.value : []
    const x550 = x550Events.status    === 'fulfilled' ? x550Events.value    : []

    // streamx996 como fuente primaria; streamtp como complemento y fallback
    let merged: any[] = []

    if (x550.length > 0) {
      merged = [...x550]

      if (tp.length > 0) {
        // Enriquecer categorías de x550 con las de streamtp cuando sean "Other" / vacías
        const tpByTeams = new Map<string, any>()
        tp.forEach(ev => {
          const key = getMatchTeams(ev.title)
          if (!tpByTeams.has(key)) tpByTeams.set(key, ev)
        })

        // Complementar con links de streamtp que no existan en x550
        const x550ByTeams = new Map<string, Set<string>>()
        x550.forEach(ev => {
          const key = getMatchTeams(ev.title)
          if (!x550ByTeams.has(key)) x550ByTeams.set(key, new Set())
          const sid = getStreamId(ev.link)
          if (sid) x550ByTeams.get(key)!.add(sid)
        })

        const extras: any[] = []
        tp.forEach(ev => {
          const teams = getMatchTeams(ev.title)
          if (!x550ByTeams.has(teams)) return  // evento no existe en x550 → descartar
          const sid = getStreamId(ev.link)
          if (x550ByTeams.get(teams)!.has(sid)) return  // canal ya presente → ignorar
          // Canal nuevo de streamtp → añadir con el título canónico de x550
          extras.push({ ...ev })
          x550ByTeams.get(teams)!.add(sid)
        })

        // Enriquecer categorías
        merged = merged.map(ev => {
          const teams = getMatchTeams(ev.title)
          const tpEv = tpByTeams.get(teams)
          if (tpEv && (!ev.category || ev.category === 'Other') && tpEv.category && tpEv.category !== 'Other') {
            return { ...ev, category: tpEv.category }
          }
          return ev
        })

        merged = [...merged, ...extras]
      }
    } else if (tp.length > 0) {
      // Fallback: solo streamtp
      const seen = new Set<string>()
      tp.forEach(ev => {
        const key = `${getMatchTeams(ev.title)}-${getStreamId(ev.link)}`
        if (!seen.has(key)) { seen.add(key); merged.push(ev) }
      })
    }

    if (merged.length === 0) {
      return NextResponse.json([], {
        headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' },
      })
    }

    merged = merged.sort((a, b) => (a.time || '').localeCompare(b.time || ''))

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
