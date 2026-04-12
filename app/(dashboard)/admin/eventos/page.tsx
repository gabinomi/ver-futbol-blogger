'use client'
import { useState, useEffect } from 'react'

interface Evento {
  title: string
  time: string
  category: string
  status: string
  link: string
  links?: string[]
}

interface FormData {
  equipoLocal: string
  equipoVisitante: string
  liga: string
  horaUtc: string
  imgVideo: string
  link1: string
  link2: string
  link3: string
  canales: string
  estado: string
  escudoLocal: string
  escudoVisitante: string
  golLocal: string
  golVisitante: string
  sofascoreId: string
  isDraft: boolean
}

interface BlogPost {
  id: string
  title: string
  url: string
  status: string
  published: string
}

interface ScoreData {
  homeScore: number
  awayScore: number
  status: string
  statusDescription: string
  minute: number | null
  period: number | null
}

const DEFAULT_IMG = 'https://i.imgur.com/1CeQ09b.png'
const BASE_URL = 'https://ver-futbol-blogger.vercel.app'

function parseTitulo(titulo: string) {
  const idx = titulo.indexOf(':')
  if (idx !== -1) return { liga: titulo.substring(0, idx).trim(), partido: titulo.substring(idx + 1).trim() }
  return { liga: '', partido: titulo }
}

function timeToHoraUtc(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const utcH = (h + 5) % 24
  const now = new Date()
  const y = now.getUTCFullYear()
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0')
  const d = String(now.getUTCDate()).padStart(2, '0')
  return `${y}-${mo}-${d}T${String(utcH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`
}

function horaArg(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  const arg = (h + 2) % 24
  return `${String(arg).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loadingEventos, setLoadingEventos] = useState(true)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [selected, setSelected] = useState<Evento | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [fetchingScore, setFetchingScore] = useState(false)
  const [msg, setMsg] = useState('')
  const [authed, setAuthed] = useState(false)
  const [tab, setTab] = useState<'nuevos' | 'publicados'>('nuevos')

  useEffect(() => { checkAuth(); loadEventos() }, [])
  useEffect(() => { if (tab === 'publicados') loadPosts() }, [tab])

  async function checkAuth() {
    const res = await fetch('/api/blogger')
    setAuthed(res.status !== 401)
  }

  async function loadEventos() {
    setLoadingEventos(true)
    try {
      const res = await fetch('/api/eventos?t=' + Date.now())
      const data = await res.json()
      const grupos: Record<string, Evento> = {}
      data.forEach((e: any) => {
        const key = e.title + '|' + e.time
        if (!grupos[key]) grupos[key] = { ...e, links: [e.link] }
        else grupos[key].links!.push(e.link)
      })
      const futbol = Object.values(grupos).filter((e) => {
        const cat = e.category || ''
        return cat === 'Fútbol' || cat === 'Fútbol_cup' || cat === 'Futbol'
      })
      setEventos(futbol)
    } catch { setMsg('Error cargando eventos') }
    setLoadingEventos(false)
  }

  async function loadPosts() {
    setLoadingPosts(true)
    try {
      const res = await fetch('/api/blogger')
      const data = await res.json()
      setPosts(data.items || [])
    } catch { setMsg('Error cargando posts') }
    setLoadingPosts(false)
  }

  function seleccionarEvento(ev: Evento) {
    setSelected(ev)
    const parsed = parseTitulo(ev.title)
    const equipos = parsed.partido.split(' vs ')
    const links = ev.links || [ev.link]
    setForm({
      equipoLocal: equipos[0]?.trim() || '',
      equipoVisitante: equipos[1]?.trim() || '',
      liga: parsed.liga,
      horaUtc: timeToHoraUtc(ev.time),
      imgVideo: DEFAULT_IMG,
      link1: links[0] || '',
      link2: links[1] || '',
      link3: links[2] || '',
      canales: '',
      estado: ev.status === 'en vivo' ? 'EN-VIVO' : 'PRONTO',
      escudoLocal: '',
      escudoVisitante: '',
      golLocal: '0',
      golVisitante: '0',
      sofascoreId: '',
      isDraft: false,
    })
    setMsg('')
  }

  function upd(key: keyof FormData, val: string | boolean) {
    setForm(prev => prev ? { ...prev, [key]: val } : null)
  }

  async function fetchScore() {
    if (!form?.sofascoreId) return
    setFetchingScore(true)
    setMsg('')
    try {
      const res = await fetch(`/api/score?id=${form.sofascoreId}`)
      const data: ScoreData = await res.json()
      if ((data as any).error) {
        setMsg('Error SofaScore: ' + (data as any).error)
      } else {
        upd('golLocal', String(data.homeScore))
        upd('golVisitante', String(data.awayScore))
        // Actualizar estado según SofaScore
        if (data.status === 'finished') upd('estado', 'FINALIZADO')
        else if (data.status === 'inprogress') upd('estado', 'EN-VIVO')
        else if (data.status === 'notstarted') upd('estado', 'PRONTO')
        setMsg(`✅ Marcador: ${data.homeScore} - ${data.awayScore} (${data.statusDescription || data.status})`)
      }
    } catch { setMsg('Error al consultar SofaScore') }
    setFetchingScore(false)
  }

  async function actualizarMarcadorPost(postId: string, sofaId: string, titulo: string) {
    if (!sofaId) { setMsg('Este post no tiene ID de SofaScore'); return }
    setFetchingScore(true)
    try {
      const res = await fetch(`/api/score?id=${sofaId}`)
      const data: ScoreData = await res.json()
      if ((data as any).error) { setMsg('Error: ' + (data as any).error); return }

      const estado = data.status === 'finished' ? 'FINALIZADO' : data.status === 'inprogress' ? 'EN-VIVO' : 'PRONTO'
      // Extraer datos del post actual y parchear con nuevo marcador
      const patchRes = await fetch('/api/blogger', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          updateScoreOnly: true,
          golLocal: data.homeScore,
          golVisitante: data.awayScore,
          estado,
        }),
      })
      const patchData = await patchRes.json()
      if (patchData.error) setMsg('Error actualizando: ' + patchData.error)
      else setMsg(`✅ ${titulo}: ${data.homeScore}-${data.awayScore} actualizado`)
    } catch { setMsg('Error de red') }
    setFetchingScore(false)
  }

  async function publicar() {
    if (!form) return
    setSaving(true); setMsg('')
    try {
      const titulo = `${form.equipoLocal} vs ${form.equipoVisitante}`
      const res = await fetch('/api/blogger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, ...form }),
      })
      const data = await res.json()
      if (data.error) {
        setMsg(data.error === 'unauthorized' ? '⚠️ Reconectá con Google' : 'Error: ' + JSON.stringify(data.error))
        if (data.error === 'unauthorized') setAuthed(false)
      } else {
        setMsg(`✅ Publicado: ${data.title}`)
        setSelected(null); setForm(null)
      }
    } catch { setMsg('Error de red') }
    setSaving(false)
  }

  const inp = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
  const lbl = "block text-xs text-gray-400 mb-1 uppercase tracking-wide"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">Panel Partidos</h1>
            <p className="text-gray-500 text-sm">StreamTP + Blogger API</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!authed
              ? <a href="/api/auth" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold">🔗 Conectar Google</a>
              : <span className="bg-green-900 text-green-400 px-3 py-2 rounded-lg text-xs font-bold">✓ Conectado</span>
            }
            <button onClick={loadEventos} className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg text-sm font-bold">🔄 Actualizar</button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-4">
          {(['nuevos', 'publicados'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {t === 'nuevos' ? '📋 Publicar nuevos' : '📝 Publicados'}
            </button>
          ))}
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {msg}
          </div>
        )}

        {/* TAB: NUEVOS */}
        {tab === 'nuevos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* LISTA EVENTOS */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-xs font-bold uppercase text-gray-400 mb-3">Eventos hoy ({eventos.length})</h2>
              {loadingEventos ? (
                <div className="text-center py-8 text-gray-500">Cargando...</div>
              ) : eventos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No hay eventos de fútbol hoy</div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {eventos.map((ev, i) => {
                    const parsed = parseTitulo(ev.title)
                    const isSel = selected?.title === ev.title && selected?.time === ev.time
                    return (
                      <div key={i} onClick={() => seleccionarEvento(ev)}
                        className={`p-3 rounded-lg cursor-pointer border transition-all ${isSel ? 'border-blue-500 bg-blue-950' : 'border-gray-800 hover:border-gray-600 bg-gray-800'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">{parsed.liga}</span>
                          <div className="flex gap-2 items-center">
                            <span className="text-xs text-blue-400 font-bold">{horaArg(ev.time)} ARG</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${ev.status === 'en vivo' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'}`}>
                              {ev.status === 'en vivo' ? '⚡ VIVO' : 'PRONTO'}
                            </span>
                          </div>
                        </div>
                        <div className="font-bold text-sm">{parsed.partido}</div>
                        <div className="text-xs text-gray-600 mt-0.5">{ev.links?.length || 1} stream(s)</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* FORMULARIO */}
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-xs font-bold uppercase text-gray-400 mb-3">
                {form ? `Editando partido` : 'Seleccioná un evento'}
              </h2>
              {!form ? (
                <div className="text-center py-16 text-gray-600">← Hacé click en un evento</div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Local</label><input className={inp} value={form.equipoLocal} onChange={e => upd('equipoLocal', e.target.value)} /></div>
                    <div><label className={lbl}>Visitante</label><input className={inp} value={form.equipoVisitante} onChange={e => upd('equipoVisitante', e.target.value)} /></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Liga</label><input className={inp} value={form.liga} onChange={e => upd('liga', e.target.value)} /></div>
                    <div>
                      <label className={lbl}>Estado</label>
                      <select className={inp} value={form.estado} onChange={e => upd('estado', e.target.value)}>
                        <option value="PRONTO">PRONTO</option>
                        <option value="EN-VIVO">EN VIVO</option>
                        <option value="FINALIZADO">FINALIZADO</option>
                      </select>
                    </div>
                  </div>

                  {/* MARCADOR */}
                  <div className="bg-gray-800 rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-gray-400">Marcador <span className="text-gray-600 normal-case font-normal">(opcional)</span></span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 items-center">
                      <div><label className={lbl}>Goles Local</label><input className={inp} type="number" min="0" value={form.golLocal} onChange={e => upd('golLocal', e.target.value)} /></div>
                      <div className="text-center text-gray-500 text-xl font-black mt-4">-</div>
                      <div><label className={lbl}>Goles Visit.</label><input className={inp} type="number" min="0" value={form.golVisitante} onChange={e => upd('golVisitante', e.target.value)} /></div>
                    </div>

                    <div className="border-t border-gray-700 pt-3">
                      <p className="text-xs text-gray-500 mb-2">
                        IDs para actualización automática — todos opcionales. Pegá la URL y copiá solo el número.
                      </p>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className={lbl}>SofaScore ID</label>
                          <input className={inp} value={form.sofascoreId} onChange={e => upd('sofascoreId', e.target.value)}
                            placeholder="ej: 15239012  (sofascore.com/...#id:15239012)" />
                        </div>
                        <button onClick={fetchScore} disabled={!form.sofascoreId || fetchingScore}
                          className="mt-5 px-3 py-2 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-xs font-bold whitespace-nowrap">
                          {fetchingScore ? '...' : '⚡ Test'}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <label className={lbl}>API-Football ID <span className="text-gray-600 normal-case font-normal">opcional</span></label>
                          <input className={inp} value={form.apifootballId || ''} onChange={e => upd('apifootballId', e.target.value)}
                            placeholder="ej: 867421" />
                        </div>
                        <div>
                          <label className={lbl}>SportMonks ID <span className="text-gray-600 normal-case font-normal">opcional</span></label>
                          <input className={inp} value={form.sportmonksId || ''} onChange={e => upd('sportmonksId', e.target.value)}
                            placeholder="ej: 19234567" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div><label className={lbl}>Imagen del partido</label>
                    <input className={inp} value={form.imgVideo} onChange={e => upd('imgVideo', e.target.value)} />
                    {form.imgVideo && <img src={form.imgVideo} className="mt-1 rounded h-16 w-full object-cover" onError={e => (e.currentTarget.style.display='none')} />}
                  </div>

                  <div><label className={lbl}>Stream 1 (principal)</label><input className={inp} value={form.link1} onChange={e => upd('link1', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Stream 2</label><input className={inp} value={form.link2} onChange={e => upd('link2', e.target.value)} /></div>
                    <div><label className={lbl}>Stream 3</label><input className={inp} value={form.link3} onChange={e => upd('link3', e.target.value)} /></div>
                  </div>

                  <div><label className={lbl}>Canales TV</label><input className={inp} value={form.canales} onChange={e => upd('canales', e.target.value)} placeholder="ESPN · TyC Sports" /></div>

                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={lbl}>Escudo Local (URL)</label><input className={inp} value={form.escudoLocal} onChange={e => upd('escudoLocal', e.target.value)} placeholder="Opcional" /></div>
                    <div><label className={lbl}>Escudo Visitante (URL)</label><input className={inp} value={form.escudoVisitante} onChange={e => upd('escudoVisitante', e.target.value)} placeholder="Opcional" /></div>
                  </div>

                  <div><label className={lbl}>Hora UTC</label><input className={inp} value={form.horaUtc} onChange={e => upd('horaUtc', e.target.value)} /></div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isDraft} onChange={e => upd('isDraft', e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-gray-400">Guardar como borrador</span>
                  </label>

                  <div className="flex gap-2 pt-1">
                    <button onClick={publicar} disabled={saving || !authed}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 py-3 rounded-lg font-bold text-sm">
                      {saving ? 'Publicando...' : form.isDraft ? '💾 Borrador' : '🚀 Publicar'}
                    </button>
                    <button onClick={() => { setSelected(null); setForm(null) }}
                      className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PUBLICADOS */}
        {tab === 'publicados' && (
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-xs font-bold uppercase text-gray-400 mb-3">
              Posts en Blogger ({posts.length})
            </h2>
            {loadingPosts ? (
              <div className="text-center py-8 text-gray-500">Cargando posts...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay posts publicados</div>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3 gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{post.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(post.published).toLocaleDateString('es-AR')} · {post.status}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={post.url} target="_blank"
                        className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs font-bold">
                        Ver →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
