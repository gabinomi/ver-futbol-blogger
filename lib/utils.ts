import { ZONAS } from '@/types'

export function calcularHorarios(horaUtc: string): [string, string][] {
  const fecha = new Date(horaUtc)
  return ZONAS.map(z => {
    const hora = fecha.toLocaleTimeString('es', {
      timeZone: z.tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    return [z.pais, hora]
  })
}

export function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export async function buscarEscudo(equipo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(equipo)}`
    )
    const data = await res.json()
    return data?.teams?.[0]?.strBadge || null
  } catch {
    return null
  }
}

export async function buscarFixture(
  equipoLocal: string,
  equipoVisitante: string
): Promise<{ fixture_id: number; hora_utc: string; escudo_local: string | null; escudo_visitante: string | null } | null> {
  try {
    const headers = { 'x-apisports-key': process.env.API_FOOTBALL_KEY! }
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${encodeURIComponent(equipoLocal)}&next=10`,
      { headers }
    )
    const data = await res.json()
    const fixtures = data?.response || []

    const visitanteLower = equipoVisitante.toLowerCase().substring(0, 5)
    const fixture = fixtures.find((f: any) => {
      const home = f.teams.home.name.toLowerCase()
      const away = f.teams.away.name.toLowerCase()
      return home.includes(visitanteLower) || away.includes(visitanteLower)
    })

    if (!fixture) return null

    const [escudo_local, escudo_visitante] = await Promise.all([
      buscarEscudo(equipoLocal),
      buscarEscudo(equipoVisitante),
    ])

    return {
      fixture_id: fixture.fixture.id,
      hora_utc: fixture.fixture.date,
      escudo_local,
      escudo_visitante,
    }
  } catch {
    return null
  }
}

export const REDIR_BASE = process.env.NEXT_PUBLIC_URL || ''

export function redirUrl(url: string, titulo: string): string {
  return `/r?url=${encodeURIComponent(url)}&t=${encodeURIComponent(titulo)}`
}
