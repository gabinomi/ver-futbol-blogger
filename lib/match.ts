// lib/match.ts
// Empareja los eventos de la agenda (nombres libres, en español) con los partidos de ESPN
// para obtener escudos, colores, logo de liga y marcador. Todo es "best effort":
// si algo falla, el evento sale tal cual venía de la agenda.
import { COUNTRY_DICT } from './flags'

// ───────────────────────── Tipos ─────────────────────────
export interface EspnTeam { name: string; short: string; logo: string; color: string; altColor: string; score: string }
export interface EspnEvent {
  id: string; date: string; ms: number
  sport: string; slug: string
  leagueName: string; leagueLogo: string
  state: string; detail: string
  home: EspnTeam; away: EspnTeam
}
export interface Candidate { ev: EspnEvent; swapped: boolean; nameScore: number; maxTeam: number; diffMin: number; score: number }

// ───────────────────────── Normalización ─────────────────────────
const strip = (s: string) =>
  (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()

// palabras que no ayudan a distinguir equipos
const STOP = new Set(['fc', 'cf', 'afc', 'sc', 'cd', 'ca', 'cs', 'sd', 'ud', 'rc', 'fk', 'sk', 'ss', 'ssc', 'club', 'de', 'del', 'la', 'el', 'los', 'las', 'the', 'of', 'and', 'y', 'e', 'cp', 'ac', 'as'])

// diccionario de países español→inglés (ya normalizado) + alias frecuentes
const DICT: Record<string, string> = {}
Object.keys(COUNTRY_DICT).forEach(k => { DICT[strip(k)] = strip((COUNTRY_DICT as Record<string, string>)[k]) })
const ALIAS: Record<string, string> = {
  'usa': 'united states', 'eeuu': 'united states', 'ee uu': 'united states',
  'man city': 'manchester city', 'man utd': 'manchester united', 'man united': 'manchester united',
  'psg': 'paris saint germain', 'paris sg': 'paris saint germain',
  'inter': 'inter milan', 'internazionale': 'inter milan', 'milan': 'ac milan',
  'bayern': 'bayern munich', 'bayern munchen': 'bayern munich', 'spurs': 'tottenham hotspur',
  'tottenham': 'tottenham hotspur', 'wolves': 'wolverhampton wanderers',
  'river': 'river plate', 'boca': 'boca juniors', 'velez': 'velez sarsfield',
  'atletico madrid': 'atletico madrid', 'atl madrid': 'atletico madrid', 'atleti': 'atletico madrid',
  'estudiantes lp': 'estudiantes de la plata', 'gimnasia lp': 'gimnasia la plata', 'sj earthquakes': 'san jose earthquakes',
  'corea del sur': 'south korea', 'costa de marfil': 'ivory coast', 'paises bajos': 'netherlands',
}

export function tokens(name: string): string[] {
  let n = strip(name)
  if (DICT[n]) n = DICT[n]
  if (ALIAS[n]) n = ALIAS[n]
  return n.split(' ').filter(t => t && !STOP.has(t))
}

const tokMatch = (x: string, y: string) =>
  x === y || (x.length >= 3 && y.startsWith(x)) || (y.length >= 3 && x.startsWith(y))

function bigrams(s: string): string[] {
  const t = s.replace(/ /g, '')
  const out: string[] = []
  for (let i = 0; i < t.length - 1; i++) out.push(t.substr(i, 2))
  return out
}
function dice(a: string, b: string): number {
  const A = bigrams(a), B = bigrams(b)
  if (!A.length || !B.length) return 0
  const used: boolean[] = []
  let hit = 0
  A.forEach(x => {
    for (let j = 0; j < B.length; j++) if (!used[j] && B[j] === x) { used[j] = true; hit++; break }
  })
  return (2 * hit) / (A.length + B.length)
}

/** Parecido entre dos nombres de equipo, de 0 a 1 */
export function similarity(a: string, b: string): number {
  const ta = tokens(a), tb = tokens(b)
  if (!ta.length || !tb.length) return 0
  if (ta.join(' ') === tb.join(' ')) return 1
  const [small, big] = ta.length <= tb.length ? [ta, tb] : [tb, ta]
  const used: boolean[] = []
  let matched = 0
  small.forEach(x => {
    for (let j = 0; j < big.length; j++) if (!used[j] && tokMatch(x, big[j])) { used[j] = true; matched++; break }
  })
  let tok = matched / big.length
  if (matched === small.length) tok = Math.max(tok, 0.85)        // un nombre contenido en el otro
  return Math.max(tok, dice(ta.join(' '), tb.join(' ')))
}

// ───────────────────────── Título del evento ─────────────────────────
export function parseTitulo(title: string): { league: string; home: string; away: string } | null {
  if (!title) return null
  const i = title.indexOf(':')
  const league = i !== -1 ? title.slice(0, i).trim() : ''
  const rest = i !== -1 ? title.slice(i + 1).trim() : title.trim()
  const parts = rest.split(/\s+vs\.?\s+|\s+v\s+|\s+@\s+/i)
  if (parts.length < 2) return null
  // "Palmeiras vs Estudiantes LP - Final" → se descarta el sufijo " - Final"
  const limpio = (x: string) => x.replace(/\s+-\s+.*$/, '').trim()
  return { league, home: limpio(parts[0]), away: limpio(parts.slice(1).join(' ')) }
}

// ───────────────────────── Liga → códigos de ESPN ─────────────────────────
// Los códigos de ESPN no están documentados; los que no existan simplemente devuelven error y se ignoran.
interface Lg { sport: string; slug: string }
const S = (slug: string, sport = 'soccer'): Lg => ({ sport, slug })
const LIGAS: Array<[RegExp, Lg[]]> = [
  [/saudi|arabia|ksa/, [S('ksa.1')]],
  [/\bnba\b/, [S('nba', 'basketball')]],
  [/concacaf.*(naciones|nations)|nations.*concacaf/, [S('concacaf.nations.league')]],
  [/concacaf.*(eliminat|qualif)/, [S('fifa.worldq.concacaf')]],
  [/gold cup/, [S('concacaf.gold')]],
  [/champions.*concacaf|concacaf.*champions/, [S('concacaf.champions')]],
  [/naciones|nations league/, [S('uefa.nations')]],
  [/libertadores/, [S('conmebol.libertadores')]],
  [/sudamericana/, [S('conmebol.sudamericana')]],
  [/recopa/, [S('conmebol.recopa')]],
  [/eliminatorias.*(conmebol|sudamerica)|conmebol.*eliminat/, [S('fifa.worldq.conmebol')]],
  [/eliminatorias.*(uefa|europa)/, [S('fifa.worldq.uefa')]],
  [/eliminatorias|clasificacion|qualif/, [S('fifa.worldq.conmebol'), S('fifa.worldq.uefa'), S('fifa.worldq.concacaf'), S('fifa.worldq.afc'), S('fifa.worldq.caf')]],
  [/amistoso|friendly|fecha fifa/, [S('fifa.friendly'), S('fifa.friendly.w')]],
  [/mundial|copa del mundo|world cup/, [S('fifa.world')]],
  [/championship/, [S('eng.2')]],
  [/\bchampions\b/, [S('uefa.champions')]],
  [/conference/, [S('uefa.europa.conf')]],
  [/europa/, [S('uefa.europa')]],
  [/copa argentina/, [S('arg.copa')]],
  [/primera nacional|nacional b/, [S('arg.2')]],
  [/copa de la liga|trofeo de campeones|supercopa argentina/, [S('arg.1'), S('arg.copa')]],
  [/liga profesional/, [S('arg.1')]],
  [/laliga 2|la liga 2|hypermotion|segunda/, [S('esp.2')]],
  [/copa del rey/, [S('esp.copa_del_rey')]],
  [/laliga|la liga|primera division.*espana|supercopa de espana/, [S('esp.1')]],
  [/premier/, [S('eng.1')]],
  [/fa cup/, [S('eng.fa')]],
  [/carabao|efl cup|league cup/, [S('eng.league_cup')]],
  [/coppa italia/, [S('ita.coppa_italia')]],
  [/serie b/, [S('ita.2')]],
  [/serie a/, [S('ita.1')]],
  [/dfb/, [S('ger.dfb_pokal')]],
  [/2\. ?bundesliga|bundesliga 2/, [S('ger.2')]],
  [/bundesliga/, [S('ger.1')]],
  [/ligue 1|ligue1/, [S('fra.1')]],
  [/liga portugal|primeira liga/, [S('por.1')]],
  [/eredivisie/, [S('ned.1')]],
  [/copa do brasil/, [S('bra.copa_do_brazil')]],
  [/brasileirao|serie a brasil/, [S('bra.1')]],
  [/torneo betplay|primera b colombia/, [S('col.2')]],
  [/copa colombia/, [S('col.copa')]],
  [/betplay|liga colombiana/, [S('col.1')]],
  [/liga mx|liga mexicana/, [S('mex.1')]],
  [/\bmls\b/, [S('usa.1')]],
  [/liga 1|liga peruana/, [S('per.1')]],
  [/copa de primera|primera division.*paraguay/, [S('par.1')]],
  [/ecuador|liga pro/, [S('ecu.1')]],
  [/chile|primera division.*chi/, [S('chi.1')]],
  [/uruguay|primera division.*uru/, [S('uru.1')]],
  [/super lig/, [S('tur.1')]],
  // Nombres genéricos que usan muchos países: se descargan varias ligas y se decide por equipos + hora
  [/^(primera division|primera|segunda division|liga|liga nacional|division profesional)$/,
    [S('uru.1'), S('chi.1'), S('par.1'), S('ecu.1'), S('per.1'), S('bol.1'), S('ven.1'), S('col.1'), S('arg.1')]],
]
export const NO_FUTBOL = /\bf1\b|formula|gran premio|grand prix|motogp|tenis|tennis|atp|wta|ufc|mma|nfl|mlb|nhl|boxeo|wwe|rugby|golf/
// Si la liga no se reconoce en absoluto, se prueba contra estas (Sudamérica) antes de rendirse
export const RESPALDO: Lg[] = [S('uru.1'), S('chi.1'), S('par.1'), S('ecu.1'), S('per.1'), S('bol.1'), S('ven.1'), S('col.1')]
export function slugsDeLiga(league: string): Lg[] {
  const l = strip(league)
  if (!l) return []
  for (const [rx, lg] of LIGAS) if (rx.test(l)) return lg
  return []
}

// ───────────────────────── Hora del evento ─────────────────────────
// La agenda trae HH:MM en UTC-5 y no trae fecha: se prueban ayer / hoy / mañana
function candidatosMs(time: string, nowMs: number): number[] {
  const p = String(time || '').split(':')
  const h = parseInt(p[0], 10), m = parseInt(p[1], 10)
  if (isNaN(h) || isNaN(m)) return []
  const loc = new Date(nowMs - 5 * 3600 * 1000)
  const base = Date.UTC(loc.getUTCFullYear(), loc.getUTCMonth(), loc.getUTCDate())
  return [-1, 0, 1].map(d => base + d * 86400000 + (h + 5) * 3600000 + m * 60000)
}

// ───────────────────────── Emparejamiento ─────────────────────────
export function mejorCandidato(title: string, time: string, pool: EspnEvent[], nowMs: number): { best: Candidate | null; top: Candidate | null } {
  const t = parseTitulo(title)
  if (!t || !pool.length) return { best: null, top: null }
  const cands = candidatosMs(time, nowMs)
  let top: Candidate | null = null
  for (const ev of pool) {
    const direct = (similarity(t.home, ev.home.name) + similarity(t.away, ev.away.name)) / 2
    const inverse = (similarity(t.home, ev.away.name) + similarity(t.away, ev.home.name)) / 2
    const swapped = inverse > direct
    const nameScore = Math.max(direct, inverse)
    const sh = swapped ? [similarity(t.home, ev.away.name), similarity(t.away, ev.home.name)] : [similarity(t.home, ev.home.name), similarity(t.away, ev.away.name)]
    const maxTeam = Math.max(sh[0], sh[1])
    const diffMin = cands.length ? Math.min(...cands.map(c => Math.abs(ev.ms - c))) / 60000 : 9999
    const timeScore = diffMin <= 30 ? 1 : diffMin <= 90 ? 0.6 : diffMin <= 180 ? 0.25 : 0
    const score = 0.7 * nameScore + 0.3 * timeScore
    const c: Candidate = { ev, swapped, nameScore, maxTeam, diffMin, score }
    if (!top || c.score > top.score) top = c
  }
  if (!top) return { best: null, top: null }
  // Aceptar: nombres razonablemente parecidos y hora cercana, o un equipo casi idéntico con hora muy cercana
  const ok = (top.nameScore >= 0.55 && top.diffMin <= 180 && top.score >= 0.5) || (top.maxTeam >= 0.85 && top.diffMin <= 60)
  return { best: ok ? top : null, top }
}

export interface Enriquecimiento {
  id: string; slug: string
  home: { name: string; logo: string; color: string; altColor: string }
  away: { name: string; logo: string; color: string; altColor: string }
  homeLogo: string; awayLogo: string
  homeColor: string; awayColor: string
  homeScore: string; awayScore: string
  league: { name: string; logo: string }
  state: string; detail: string; date: string
}
const hex = (c: string) => (c ? '#' + String(c).replace('#', '') : '')
export function armarEnriquecimiento(c: Candidate): Enriquecimiento {
  // 'home' = primer equipo del título de la agenda (aunque en ESPN sea el visitante)
  const a = c.swapped ? c.ev.away : c.ev.home
  const b = c.swapped ? c.ev.home : c.ev.away
  const T = (x: EspnTeam) => ({ name: x.name, logo: x.logo, color: hex(x.color), altColor: hex(x.altColor) })
  return {
    id: c.ev.id, slug: c.ev.slug,
    home: T(a), away: T(b),
    homeLogo: a.logo, awayLogo: b.logo,
    homeColor: hex(a.color), awayColor: hex(b.color),
    homeScore: a.score, awayScore: b.score,
    league: { name: c.ev.leagueName, logo: c.ev.leagueLogo },
    state: c.ev.state, detail: c.ev.detail, date: c.ev.date,
  }
}

// ───────────────────────── Consulta a ESPN (con caché) ─────────────────────────
const TTL = 60 * 1000
const cache = new Map<string, { t: number; data: EspnEvent[] }>()
const ymd = (ms: number) => new Date(ms - 5 * 3600 * 1000).toISOString().slice(0, 10).replace(/-/g, '')

function parseEspn(json: any, sport: string, slug: string): EspnEvent[] {
  const league = (json && json.leagues && json.leagues[0]) || {}
  const logos: any[] = league.logos || []
  const dark = logos.find(l => l && l.rel && (String(l.rel).indexOf('dark') !== -1 || String(l.rel).indexOf('scoreboard') !== -1))
  const leagueLogo = ((dark || logos[0]) && (dark || logos[0]).href) || ''
  const out: EspnEvent[] = []
  ;((json && json.events) || []).forEach((ev: any) => {
    const comp = ev.competitions && ev.competitions[0]
    const cs: any[] = (comp && comp.competitors) || []
    const h = cs.find(c => c.homeAway === 'home'), a = cs.find(c => c.homeAway === 'away')
    if (!h || !a || !h.team || !a.team) return
    const T = (c: any): EspnTeam => ({
      name: c.team.displayName || c.team.name || '', short: c.team.shortDisplayName || '',
      logo: c.team.logo || (c.team.logos && c.team.logos[0] && c.team.logos[0].href) || '',
      color: c.team.color || '', altColor: c.team.alternateColor || '',
      score: c.score !== undefined ? String(c.score) : '',
    })
    const ms = Date.parse(ev.date)
    if (isNaN(ms)) return
    out.push({
      id: String(ev.id), date: ev.date, ms, sport, slug,
      leagueName: league.name || league.abbreviation || '', leagueLogo,
      state: (ev.status && ev.status.type && ev.status.type.state) || 'pre',
      detail: (ev.status && ev.status.type && ev.status.type.shortDetail) || '',
      home: T(h), away: T(a),
    })
  })
  return out
}

async function getJson(url: string): Promise<any | null> {
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal: AbortSignal.timeout(4000) })
    return r.ok ? await r.json() : null
  } catch { return null }
}

export async function cargarLiga(lg: Lg, nowMs: number): Promise<EspnEvent[]> {
  const key = lg.sport + '/' + lg.slug
  const hit = cache.get(key)
  if (hit && nowMs - hit.t < TTL) return hit.data
  const base = `https://site.api.espn.com/apis/site/v2/sports/${lg.sport}/${lg.slug}/scoreboard?limit=100`
  let json = await getJson(`${base}&dates=${ymd(nowMs - 86400000)}-${ymd(nowMs + 86400000)}`)
  if (!json) json = await getJson(base)
  const data = json ? parseEspn(json, lg.sport, lg.slug) : []
  cache.set(key, { t: nowMs, data })
  return data
}

// ───────────────────────── API pública del módulo ─────────────────────────
export interface InformeItem { title: string; league: string; slugs: string[]; estado: 'ok' | 'sin-liga' | 'sin-titulo' | 'no-futbol' | 'liga-sin-partidos' | 'sin-match'; mejor?: { espn: string; nameScore: number; diffMin: number }; usado?: string }
export interface LigaInfo { slug: string; partidos: number }
const MAX_LIGAS = 45

export async function enriquecerEventos(events: any[], debug = false): Promise<{ events: any[]; informe: InformeItem[]; ligas: LigaInfo[] }> {
  const informe: InformeItem[] = []
  try {
    const nowMs = Date.now()
    // 1) eventos únicos (varias filas = mismo partido con distintos links)
    const uniq = new Map<string, { title: string; time: string }>()
    events.forEach(e => { if (e && e.title) uniq.set(e.title + '|' + e.time, { title: e.title, time: e.time }) })

    // 2) ligas necesarias. Primero las que se reconocen por nombre; después las de respaldo (liga genérica o desconocida).
    const need = new Map<string, Lg>()
    const respaldo: Lg[] = []
    uniq.forEach(u => {
      const t = parseTitulo(u.title)
      if (!t || NO_FUTBOL.test(strip(t.league))) return
      const lg = slugsDeLiga(t.league)
      if (lg.length) lg.forEach(l => need.set(l.sport + '/' + l.slug, l)); else RESPALDO.forEach(l => respaldo.push(l))
    })
    respaldo.forEach(l => { if (!need.has(l.sport + '/' + l.slug)) need.set(l.sport + '/' + l.slug, l) })
    const lista = Array.from(need.values()).slice(0, MAX_LIGAS)
    const cargadas = await Promise.all(lista.map(l => cargarLiga(l, nowMs)))
    const porClave = new Map<string, EspnEvent[]>()
    lista.forEach((l, i) => porClave.set(l.sport + '/' + l.slug, cargadas[i]))
    const todos: EspnEvent[] = ([] as EspnEvent[]).concat(...cargadas)
    const ligas: LigaInfo[] = lista.map((l, i) => ({ slug: l.slug, partidos: cargadas[i].length }))

    // 3) emparejar
    const resultado = new Map<string, Enriquecimiento>()
    uniq.forEach((u, k) => {
      const t = parseTitulo(u.title)
      const item: InformeItem = { title: u.title, league: t ? t.league : '', slugs: [], estado: 'sin-titulo' }
      if (t && NO_FUTBOL.test(strip(t.league))) item.estado = 'no-futbol'
      else if (t) {
        const lgs0 = slugsDeLiga(t.league)
        const lgs = lgs0.length ? lgs0 : RESPALDO
        item.slugs = lgs.map(l => l.slug)
        let pool: EspnEvent[] = []
        lgs.forEach(l => { pool = pool.concat(porClave.get(l.sport + '/' + l.slug) || []) })
        let r = mejorCandidato(u.title, u.time, pool, nowMs)
        // sin coincidencia en su liga: probar contra todo lo descargado
        if (!r.best && todos.length) r = mejorCandidato(u.title, u.time, todos, nowMs)
        item.estado = !lgs0.length ? 'sin-liga' : (!pool.length ? 'liga-sin-partidos' : 'sin-match')
        if (r.top) item.mejor = { espn: r.top.ev.home.name + ' vs ' + r.top.ev.away.name, nameScore: +r.top.nameScore.toFixed(2), diffMin: Math.round(r.top.diffMin) }
        if (r.best) { resultado.set(k, armarEnriquecimiento(r.best)); item.estado = 'ok'; item.usado = r.best.ev.slug }
      }
      informe.push(item)
    })

    // 4) adjuntar sin quitar ningún campo existente. El campo "espn" va solo en la primera fila de cada partido
    //    (la plantilla lo toma de cualquiera de las filas del grupo): así el JSON pesa mucho menos.
    const yaPuesto = new Set<string>()
    const out = events.map(e => {
      const k = e && e.title + '|' + e.time
      const en = e && resultado.get(k)
      if (!en || yaPuesto.has(k)) return e
      yaPuesto.add(k)
      return { ...e, espn: en }
    })
    return { events: out, informe: debug ? informe : [], ligas: debug ? ligas : [] }
  } catch {
    return { events, informe: [], ligas: [] }
  }
}
