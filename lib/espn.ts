// Helper para conectarse e interactuar con la API pública de ESPN (oculta)
// Endpoint general de scores diarios:
// URL: https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard

export interface ESPNEventInfo {
  id: string
  date: string // ISO
  name: string // "Boca Juniors at River Plate"
  shortName: string // "BOC @ RIV"
  status: {
    clock: number // Segundos transcurridos (no siempre exacto)
    displayClock: string // "45'", "90'+4'"
    period: number
    type: {
        name: string // "STATUS_IN_PROGRESS", "STATUS_FULL_TIME", "STATUS_SCHEDULED", "STATUS_CANCELED"
        state: string // "in", "pre", "post"
        completed: boolean
    }
  }
  competitors: {
    id: string
    homeAway: "home" | "away"
    score: string // "0", "1"...
    team: {
      name: string
      displayName: string // "River Plate"
      abbreviation: string
      logo?: string
    }
  }[]
}

const LIGAS_SLUGS = [
  'fifa.world', 'fifa.friendly',
  'arg.1', 'arg.copa', 'conmebol.libertadores', 'conmebol.sudamericana',
  'esp.1', 'esp.2', 'uefa.champions', 'uefa.europa', 'bra.1', 'col.1',
  'mex.1', 'eng.1', 'ita.1', 'ger.1'
]

// 1. Obtener todos los partidos de fútbol del mundo (top leagues) del día (o cercanos)
export async function fetchEspnDailyScoreboard(): Promise<ESPNEventInfo[]> {
  try {
    const allEvents: ESPNEventInfo[] = []
    
    await Promise.all(
      LIGAS_SLUGS.map(async (slug) => {
        try {
          const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/scoreboard?limit=50`, {
            next: { revalidate: 30 }
          })
          if (res.ok) {
            const data = await res.json()
            if (data.events) {
              allEvents.push(...data.events)
            }
          }
        } catch (e) {
          // Ignore individual fetch errors
        }
      })
    )
    
    return allEvents
  } catch (error) {
    console.error("Error fetching ESPN Scoreboard:", error)
    return []
  }
}

// 2. Fetcher específico para pedir el detalle de 1 partido (usado por el cron)
export async function fetchEspnEventSummary(eventId: string): Promise<ESPNEventInfo | null> {
    try {
        const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/all/summary?event=${eventId}`, {
            next: { revalidate: 0 } // Siempre freco para el live
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.header?.competitions?.[0] as ESPNEventInfo // El summary structure es un pelin diferente (esta dentro de header.competitions)
    } catch (e) {
        return null
    }
}
// 3. Emparejamiento borroso (Fuzzy Matcher)
// Trata de buscar dentro del scoreboard de ESPN el ID del evento de nuestro partido.
// NOTA: La API de ESPN anida competitors en: event.competitions[0].competitors[]
export function matchEspnEvent(
  localTitle: string, 
  visitanteTitle: string, 
  espnEvents: any[]
): string | null {
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '')
  
  const targetLocal = norm(localTitle)
  const targetVisita = norm(visitanteTitle)

  // Helper: extraer competitors del evento (manejar ambas estructuras)
  function getTeams(ev: any): { homeName: string; awayName: string } | null {
    // Estructura real: ev.competitions[0].competitors[]
    const comp = ev.competitions?.[0]
    const competitors = comp?.competitors || ev.competitors || []
    const home = competitors.find((c: any) => c.homeAway === 'home')
    const away = competitors.find((c: any) => c.homeAway === 'away')
    if (!home || !away) return null
    return {
      homeName: home.team?.displayName || home.team?.name || '',
      awayName: away.team?.displayName || away.team?.name || ''
    }
  }

  // Primero buscar coincidencia estricta en displayName
  for (const ev of espnEvents) {
    const teams = getTeams(ev)
    if (!teams) continue
     
    const espnL = norm(teams.homeName)
    const espnV = norm(teams.awayName)

    // Si ambos lados se incluyen o coinciden
    if ((espnL.includes(targetLocal) || targetLocal.includes(espnL)) && 
        (espnV.includes(targetVisita) || targetVisita.includes(espnV))) {
            return ev.id
    }
  }

  // Si no encuentra, tratar de ser mas agresivo comparando las primeras letras
  for (const ev of espnEvents) {
    const teams = getTeams(ev)
    if (!teams) continue
    
    const espnL = norm(teams.homeName).split(' ')[0]
    const espnV = norm(teams.awayName).split(' ')[0]

    const tgtL = targetLocal.split(' ')[0]
    const tgtV = targetVisita.split(' ')[0]

    if (espnL.length > 2 && espnV.length > 2 && espnL === tgtL && espnV === tgtV) {
        return ev.id
    }
  }

  return null
}
