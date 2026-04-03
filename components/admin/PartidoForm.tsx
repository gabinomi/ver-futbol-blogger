'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Partido, Estado } from '@/types'
import { Search, Save, Loader2 } from 'lucide-react'

interface Props {
  partido?: Partial<Partido>
  modo: 'nuevo' | 'editar'
}

const estadoOpts: Estado[] = ['PROXIMO', 'EN-VIVO', 'FINALIZADO']

export default function PartidoForm({ partido, modo }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState<Partial<Partido>>({
    equipo_local: '',
    equipo_visitante: '',
    gol_local: 0,
    gol_visitante: 0,
    estado: 'PROXIMO',
    hora_utc: '',
    canales: '',
    link_video: '',
    link1: '',
    link2: '',
    link3: '',
    img_video: '',
    img_og: '',
    escudo_local: '',
    escudo_visitante: '',
    ...partido,
  })

  function set(key: keyof Partido, val: any) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function buscarPartido() {
    if (!form.equipo_local || !form.equipo_visitante) {
      setMsg('Ingresá los nombres de los equipos primero')
      return
    }
    setBuscando(true)
    setMsg('')
    const res = await fetch('/api/admin/buscar-fixture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ local: form.equipo_local, visitante: form.equipo_visitante }),
    })
    const data = await res.json()
    if (data.hora_utc) {
      setForm(f => ({
        ...f,
        hora_utc: data.hora_utc,
        escudo_local: data.escudo_local || f.escudo_local,
        escudo_visitante: data.escudo_visitante || f.escudo_visitante,
        fixture_id: data.fixture_id,
      }))
      setMsg('✓ Datos encontrados y cargados automáticamente')
    } else {
      setMsg('No se encontró el partido en API-Football. Ingresá la hora UTC manualmente.')
    }
    setBuscando(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    const url = modo === 'nuevo' ? '/api/admin/partidos' : `/api/admin/partidos/${partido?.id}`
    const method = modo === 'nuevo' ? 'POST' : 'PUT'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      router.push('/admin/partidos')
      router.refresh()
    } else {
      setMsg(data.error || 'Error al guardar')
      setLoading(false)
    }
  }

  const inputCls = 'w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors text-sm'
  const labelCls = 'text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1 block'

  return (
    <form onSubmit={handleSubmit} className='max-w-2xl'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='font-barlow text-2xl font-black uppercase tracking-widest text-white'>
          {modo === 'nuevo' ? 'Nuevo partido' : 'Editar partido'}
        </h1>
        <button type='submit' disabled={loading}
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-barlow font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50'>
          {loading ? <Loader2 size={15} className='animate-spin' /> : <Save size={15} />}
          Guardar
        </button>
      </div>

      <div className='bg-[#08102480] border border-white/7 rounded-2xl p-5 flex flex-col gap-5'>

        {/* Equipos */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className={labelCls}>Equipo local</label>
            <input className={inputCls} value={form.equipo_local} onChange={e => set('equipo_local', e.target.value)} placeholder='Ej: River Plate' required />
          </div>
          <div>
            <label className={labelCls}>Equipo visitante</label>
            <input className={inputCls} value={form.equipo_visitante} onChange={e => set('equipo_visitante', e.target.value)} placeholder='Ej: Boca Juniors' required />
          </div>
        </div>

        {/* Buscar automático */}
        <div>
          <button type='button' onClick={buscarPartido} disabled={buscando}
            className='flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-barlow font-bold uppercase tracking-wide text-sm transition-colors disabled:opacity-50 w-full justify-center'>
            {buscando ? <Loader2 size={15} className='animate-spin' /> : <Search size={15} />}
            Buscar en API-Football (automático)
          </button>
          {msg && <p className={`text-xs mt-2 text-center ${msg.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>{msg}</p>}
        </div>

        {/* Estado y marcador */}
        <div className='grid grid-cols-3 gap-4'>
          <div>
            <label className={labelCls}>Estado</label>
            <select className={inputCls} value={form.estado} onChange={e => set('estado', e.target.value as Estado)}>
              {estadoOpts.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Gol local</label>
            <input type='number' min={0} className={inputCls} value={form.gol_local} onChange={e => set('gol_local', +e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Gol visitante</label>
            <input type='number' min={0} className={inputCls} value={form.gol_visitante} onChange={e => set('gol_visitante', +e.target.value)} />
          </div>
        </div>

        {/* Hora UTC */}
        <div>
          <label className={labelCls}>Hora UTC (ej: 2026-03-20T20:00:00Z)</label>
          <input className={inputCls} value={form.hora_utc || ''} onChange={e => set('hora_utc', e.target.value)} placeholder='2026-03-20T20:00:00Z' />
        </div>

        {/* Canales */}
        <div>
          <label className={labelCls}>Canales</label>
          <input className={inputCls} value={form.canales || ''} onChange={e => set('canales', e.target.value)} placeholder='ESPN · Star+ · DSports' />
        </div>

        {/* Links */}
        <div className='flex flex-col gap-3'>
          <div>
            <label className={labelCls}>SmartLink (botón principal)</label>
            <input className={inputCls} value={form.link_video || ''} onChange={e => set('link_video', e.target.value)} placeholder='https://...' />
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {(['link1','link2','link3'] as const).map((k, i) => (
              <div key={k}>
                <label className={labelCls}>Opción {i+1}</label>
                <input className={inputCls} value={(form[k] as string) || ''} onChange={e => set(k, e.target.value)} placeholder='https://...' />
              </div>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className={labelCls}>Imagen reproductor</label>
            <input className={inputCls} value={form.img_video || ''} onChange={e => set('img_video', e.target.value)} placeholder='https://i.imgur.com/...' />
          </div>
          <div>
            <label className={labelCls}>Imagen OG (redes)</label>
            <input className={inputCls} value={form.img_og || ''} onChange={e => set('img_og', e.target.value)} placeholder='https://i.imgur.com/...' />
          </div>
        </div>

        {/* Escudos */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className={labelCls}>Escudo local (URL)</label>
            <input className={inputCls} value={form.escudo_local || ''} onChange={e => set('escudo_local', e.target.value)} placeholder='Auto desde TheSportsDB' />
          </div>
          <div>
            <label className={labelCls}>Escudo visitante (URL)</label>
            <input className={inputCls} value={form.escudo_visitante || ''} onChange={e => set('escudo_visitante', e.target.value)} placeholder='Auto desde TheSportsDB' />
          </div>
        </div>

      </div>
    </form>
  )
}
