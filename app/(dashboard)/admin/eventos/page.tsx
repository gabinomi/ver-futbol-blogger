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
  isDraft: boolean
}

const DEFAULT_IMG = 'https://i.imgur.com/1CeQ09b.png'

function parseTitulo(titulo: string) {
  const idx = titulo.indexOf(':')
  if (idx !== -1) {
    return { liga: titulo.substring(0, idx).trim(), partido: titulo.substring(idx + 1).trim() }
  }
  return { liga: '', partido: titulo }
}

function timeToHoraUtc(timeStr: string): string {
  // JSON en UTC-5 (Panama) → convertir a UTC sumando 5hs
  const [h, m] = timeStr.split(':').map(Number)
  const utcH = (h + 5) % 24
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}T${String(utcH).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`
}

export default function EventosPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Evento | null>(null)
  const [form, setForm] = useState<FormData | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    checkAuth()
    loadEventos()
  }, [])

  async function checkAuth() {
    try {
      const res = await fetch('/api/blogger')
      if (res.status === 401) setAuthed(false)
      else setAuthed(true)
    } catch { setAuthed(false) }
  }

  async function loadEventos() {
    setLoading(true)
    try {
      const res = await fetch('/api/eventos?t=' + Date.now())
      const data = await res.json()
      // Agrupar por título+hora
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
    } catch (err) {
      setMsg('Error cargando eventos de StreamTP')
    }
    setLoading(false)
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
      isDraft: false,
    })
    setMsg('')
  }

  function updateForm(key: keyof FormData, val: string | boolean) {
    setForm(prev => prev ? { ...prev, [key]: val } : null)
  }

  async function publicar() {
    if (!form) return
    setSaving(true)
    setMsg('')
    try {
      const titulo = `${form.equipoLocal} vs ${form.equipoVisitante}`
      const res = await fetch('/api/blogger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, ...form }),
      })
      const data = await res.json()
      if (data.error) {
        if (data.error === 'unauthorized') {
          setMsg('⚠️ Sesión expirada. Reconectá con Google.')
          setAuthed(false)
        } else {
          setMsg('Error: ' + JSON.stringify(data.error))
        }
      } else {
        setMsg(`✅ Publicado: ${data.title}`)
        setSelected(null)
        setForm(null)
      }
    } catch (e) {
      setMsg('Error de red')
    }
    setSaving(false)
  }

  const inputCls = "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
  const labelCls = "block text-xs text-gray-400 mb-1 uppercase tracking-wide"

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider">Publicar Partidos</h1>
            <p className="text-gray-500 text-sm mt-1">Eventos del día desde StreamTP</p>
          </div>
          <div className="flex gap-3">
            {!authed ? (
              <a href="/api/auth" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                🔗 Conectar con Google
              </a>
            ) : (
              <span className="bg-green-900 text-green-400 px-3 py-2 rounded-lg text-xs font-bold">✓ Conectado</span>
            )}
            <button onClick={loadEventos} className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold">
              🔄 Actualizar
            </button>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LISTA EVENTOS */}
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              Eventos Disponibles ({eventos.length})
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando eventos...</div>
            ) : eventos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No hay eventos de fútbol hoy</div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {eventos.map((ev, i) => {
                  const parsed = parseTitulo(ev.title)
                  const isSelected = selected?.title === ev.title && selected?.time === ev.time
                  return (
                    <div
                      key={i}
                      onClick={() => seleccionarEvento(ev)}
                      className={`p-3 rounded-lg cursor-pointer border transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950'
                          : 'border-gray-800 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 font-medium">{parsed.liga}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-blue-400 font-bold">
                            {/* Hora Argentina (+2 desde Panama) */}
                            {(() => {
                              const [h, m] = ev.time.split(':').map(Number)
                              const arg = (h + 2) % 24
                              return `${String(arg).padStart(2,'0')}:${String(m).padStart(2,'0')} ARG`
                            })()}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            ev.status === 'en vivo' ? 'bg-red-900 text-red-300' : 'bg-gray-700 text-gray-400'
                          }`}>
                            {ev.status === 'en vivo' ? '⚡ VIVO' : 'PRONTO'}
                          </span>
                        </div>
                      </div>
                      <div className="font-bold text-sm">{parsed.partido}</div>
                      <div className="text-xs text-gray-500 mt-1">{ev.links?.length || 1} stream(s)</div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* FORMULARIO */}
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
              {selected ? `Editando: ${parseTitulo(selected.title).partido}` : 'Seleccioná un evento'}
            </h2>

            {!form ? (
              <div className="text-center py-16 text-gray-600">
                ← Hacé click en un evento para editarlo
              </div>
            ) : (
              <div className="space-y-4">

                {/* Equipos */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Equipo Local</label>
                    <input className={inputCls} value={form.equipoLocal} onChange={e => updateForm('equipoLocal', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Equipo Visitante</label>
                    <input className={inputCls} value={form.equipoVisitante} onChange={e => updateForm('equipoVisitante', e.target.value)} />
                  </div>
                </div>

                {/* Liga y Estado */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Liga / Torneo</label>
                    <input className={inputCls} value={form.liga} onChange={e => updateForm('liga', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Estado</label>
                    <select className={inputCls} value={form.estado} onChange={e => updateForm('estado', e.target.value)}>
                      <option value="PRONTO">PRONTO</option>
                      <option value="EN-VIVO">EN VIVO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                    </select>
                  </div>
                </div>

                {/* Hora UTC */}
                <div>
                  <label className={labelCls}>Hora UTC (ISO)</label>
                  <input className={inputCls} value={form.horaUtc} onChange={e => updateForm('horaUtc', e.target.value)} />
                </div>

                {/* Imagen */}
                <div>
                  <label className={labelCls}>URL Imagen del Partido</label>
                  <input className={inputCls} value={form.imgVideo} onChange={e => updateForm('imgVideo', e.target.value)} placeholder="https://i.imgur.com/..." />
                  {form.imgVideo && <img src={form.imgVideo} className="mt-2 rounded-lg h-20 object-cover w-full" onError={e => (e.currentTarget.style.display='none')} />}
                </div>

                {/* Links */}
                <div>
                  <label className={labelCls}>Link Principal (Stream 1)</label>
                  <input className={inputCls} value={form.link1} onChange={e => updateForm('link1', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Stream 2</label>
                    <input className={inputCls} value={form.link2} onChange={e => updateForm('link2', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Stream 3</label>
                    <input className={inputCls} value={form.link3} onChange={e => updateForm('link3', e.target.value)} />
                  </div>
                </div>

                {/* Canales TV */}
                <div>
                  <label className={labelCls}>Canales TV (ej: ESPN · TyC Sports)</label>
                  <input className={inputCls} value={form.canales} onChange={e => updateForm('canales', e.target.value)} placeholder="ESPN · TyC Sports · Star+" />
                </div>

                {/* Escudos */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>URL Escudo Local</label>
                    <input className={inputCls} value={form.escudoLocal} onChange={e => updateForm('escudoLocal', e.target.value)} placeholder="Opcional" />
                  </div>
                  <div>
                    <label className={labelCls}>URL Escudo Visitante</label>
                    <input className={inputCls} value={form.escudoVisitante} onChange={e => updateForm('escudoVisitante', e.target.value)} placeholder="Opcional" />
                  </div>
                </div>

                {/* Opciones publicación */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isDraft} onChange={e => updateForm('isDraft', e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm text-gray-400">Guardar como borrador</span>
                  </label>
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={publicar}
                    disabled={saving || !authed}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 py-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    {saving ? 'Publicando...' : form.isDraft ? '💾 Guardar Borrador' : '🚀 Publicar Entrada'}
                  </button>
                  <button
                    onClick={() => { setSelected(null); setForm(null) }}
                    className="px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                </div>

                {!authed && (
                  <p className="text-xs text-yellow-500 text-center">
                    Necesitás conectar tu cuenta de Google para publicar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
