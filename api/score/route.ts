'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import GlobalNav from '@/components/public/GlobalNav'
import Image from 'next/image'
import { RefreshCw, CalendarDays, MapPin } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Configuracion de Ligas
const LIGAS = [
  { slug: 'fifa.world', nombre: 'Copa Mundial', bandera: 'https://bestleague.world/img/fifa.png' },
  { slug: 'fifa.friendly', nombre: 'Amistosos Int.', bandera: 'https://bestleague.world/img/fifa.png' },
  { slug: 'arg.1', nombre: 'Liga Profesional', bandera: 'https://bestleague.world/jr/55.png' },
  { slug: 'arg.copa', nombre: 'Copa Argentina', bandera: 'https://bestleague.world/jr/55.png' },
  { slug: 'conmebol.libertadores', nombre: 'Copa Libertadores', bandera: 'https://bestleague.world/jr/76.png' },
  { slug: 'conmebol.sudamericana', nombre: 'Copa Sudamericana', bandera: 'https://pelotalibre24.com/flags/sud.png' },
  { slug: 'esp.1', nombre: 'LaLiga', bandera: 'https://bestleague.world/jr/34.png' },
  { slug: 'esp.2', nombre: 'LaLiga 2', bandera: 'https://bestleague.world/jr/34.png' },
  { slug: 'uefa.champions', nombre: 'Champions League', bandera: 'https://bestleague.world/jr/5.png' },
  { slug: 'uefa.europa', nombre: 'Europa League', bandera: 'https://bestleague.world/jr/7.png' },
  { slug: 'bra.1', nombre: 'Brasileirão', bandera: 'https://bestleague.world/jr/79.png' },
  { slug: 'col.1', nombre: 'Liga BetPlay', bandera: 'https://bestleague.world/jr/118.png' },
  { slug: 'mex.1', nombre: 'Liga MX', bandera: 'https://bestleague.world/jr/69.png' },
  { slug: 'eng.1', nombre: 'Premier League', bandera: 'https://bestleague.world/jr/61.png' },
  { slug: 'ita.1', nombre: 'Serie A', bandera: 'https://bestleague.world/jr/37.png' },
  { slug: 'ger.1', nombre: 'Bundesliga', bandera: 'https://bestleague.world/jr/96.png' }
]

const BASE_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/'

export default function MarcadoresPage() {
  const [resultados, setResultados] = useState<Record<string, any[]>>({})
  const [partidosDb, setPartidosDb] = useState<any[]>([])
  const [ligaActiva, setLigaActiva] = useState<string>('todas')
  const [cargando, setCargando] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('-')

  const cargarTodo = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setCargando(true)

    const nuevosResultados: Record<string, any[]> = {}

    await Promise.all(
      LIGAS.map(async (liga) => {
        try {
          const res = await fetch(`${BASE_URL}${liga.slug}/scoreboard?limit=50`, { cache: 'no-store' })
          if (res.ok) {
            const data = await res.json()
            nuevosResultados[liga.slug] = data.events || []
          } else {
            nuevosResultados[liga.slug] = []
          }
        } catch (e) {
          nuevosResultados[liga.slug] = []
        }
      })
    )

    setResultados(nuevosResultados)
    
    // Fetch local matches that might be playing today
    const { data: locales } = await supabase
      .from('partidos')
      .select('slug, equipo_local, equipo_visitante, metadata')
      .neq('estado', 'FINALIZADO')
    
    if (locales) {
      setPartidosDb(locales)
    }

    setCargando(false)
    setRefreshing(false)
    setLastUpdated(new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }))
  }, [])

  useEffect(() => {
    cargarTodo()
    const intervalId = setInterval(() => cargarTodo(true), 30000)
    return () => clearInterval(intervalId)
  }, [cargarTodo])

  // Fecha header
  const fechaStr = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires'
  })

  const totalPartidosLive = useMemo(() => {
    return Object.values(resultados).flat().filter(e => e.status?.type?.state === 'in').length
  }, [resultados])

  // Filter ligas
  const ligasARender = ligaActiva === 'todas'
    ? LIGAS.filter(l => (resultados[l.slug] || []).length > 0)
    : LIGAS.filter(l => l.slug === ligaActiva && (resultados[l.slug] || []).length > 0)

  return (
    <div className='relative z-10 flex flex-col min-h-screen'>
      <GlobalNav />
      <main className='max-w-[900px] w-full mx-auto px-4 py-6 flex flex-col flex-1'>
        
        {/* Header Section */}
        <div className='flex items-center justify-between bg-[#0d1221] border border-white/10 rounded-2xl p-4 md:p-5 mb-5 shadow-2xl'>
          <div className='flex items-center gap-3'>
            <div className='w-2 h-2 bg-red-600 rounded-full animate-blink' />
            <h1 className='font-barlow text-xl md:text-2xl font-black uppercase tracking-[2px] text-white m-0'>Live Scores</h1>
          </div>
          <button 
            onClick={() => cargarTodo(true)} 
            disabled={refreshing || cargando}
            className='flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-barlow text-sm font-bold uppercase tracking-widest disabled:opacity-50'
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-400' : ''} />
            <span className='hidden sm:inline'>Actualizar</span>
          </button>
        </div>

        <div className='text-center mb-6'>
          <p className='font-barlow text-sm font-bold tracking-[2px] uppercase text-slate-500'>
            {fechaStr}
          </p>
        </div>

        {cargando ? (
          <div className='flex flex-col items-center justify-center py-24 gap-4'>
            <RefreshCw size={32} className='text-blue-500 animate-spin' />
            <span className='text-xs font-black uppercase tracking-[2px] text-slate-500'>Cargando agenda...</span>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className='flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/10'>
              <button
                onClick={() => setLigaActiva('todas')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-barlow text-xs border transition-all uppercase tracking-widest font-bold ${
                  ligaActiva === 'todas'
                    ? (totalPartidosLive > 0 ? 'bg-red-600/10 border-red-500/40 text-red-400' : 'bg-blue-600/15 border-blue-500 text-blue-400')
                    : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {totalPartidosLive > 0 && ligaActiva !== 'todas' && <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-blink' />}
                Todos
              </button>

              {LIGAS.map(liga => {
                const evs = resultados[liga.slug] || []
                if (evs.length === 0) return null
                const liveCount = evs.filter(e => e.status?.type?.state === 'in').length
                const isActive = ligaActiva === liga.slug

                return (
                  <button
                    key={liga.slug}
                    onClick={() => setLigaActiva(liga.slug)}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-barlow text-xs border transition-all uppercase tracking-widest font-bold ${
                      isActive 
                        ? 'bg-blue-600/15 border-blue-500 text-blue-400' 
                        : (liveCount > 0 ? 'bg-red-600/5 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white')
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={liga.bandera} alt={liga.nombre} className='w-4 h-3 object-contain rounded-[1px]' loading='lazy' />
                    {liga.nombre}
                    {liveCount > 0 && (
                      <span className='bg-red-600 text-white leading-none px-1.5 py-0.5 rounded-full text-[9px] ml-1'>
                        {liveCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* List */}
            {ligasARender.length === 0 ? (
              <div className='text-center py-16 text-slate-500 text-sm font-bold'>
                No hay partidos para mostrar hoy en esta liga
              </div>
            ) : (
              <div className='flex flex-col gap-6 animate-fade-in'>
                {ligasARender.map(liga => {
                  const evs = [...(resultados[liga.slug] || [])]
                  
                  // Ordenar: En Vivo primero, luego por fecha ascendente
                  evs.sort((a, b) => {
                    const aLive = a.status?.type?.state === 'in' ? 0 : 1
                    const bLive = b.status?.type?.state === 'in' ? 0 : 1
                    if (aLive !== bLive) return aLive - bLive
                    return (a.date || '').localeCompare(b.date || '')
                  })

                  const liveTotal = evs.filter(e => e.status?.type?.state === 'in').length

                  return (
                    <div key={liga.slug} className='flex flex-col gap-3'>
                      {/* Cabecera de Liga */}
                      <div className='flex items-center gap-2 px-3 py-2 bg-white/[0.02] rounded-lg border border-white/[0.05]'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={liga.bandera} alt={liga.nombre} className='w-[18px] h-[12px] object-contain rounded-sm' loading='lazy' />
                        <span className='font-barlow text-[13px] font-black tracking-widest uppercase text-slate-400'>{liga.nombre}</span>
                        {liveTotal > 0 && (
                          <div className='ml-auto inline-flex items-center gap-1.5 bg-red-600/10 border border-red-500/30 text-red-500 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase'>
                            <span className='w-1 h-1 bg-red-500 rounded-full animate-blink' />
                            {liveTotal} en vivo
                          </div>
                        )}
                      </div>

                      {/* Partidos */}
                      <div className='flex flex-col gap-2'>
                        {evs.map(ev => {
                          const comp = ev.competitions?.[0]
                          if (!comp) return null
                          const home = comp.competitors?.find((c: any) => c.homeAway === 'home') || {}
                          const away = comp.competitors?.find((c: any) => c.homeAway === 'away') || {}
                          const state = ev.status?.type?.state || 'pre'
                          const detail = ev.status?.type?.shortDetail || ''
                          const period = ev.status?.period || 0
                          const isLive = state === 'in'
                          
                          const homeLogo = home.team?.logo || ''
                          const awayLogo = away.team?.logo || ''
                          const homeName = home.team?.shortDisplayName || home.team?.displayName || 'Local'
                          const awayName = away.team?.shortDisplayName || away.team?.displayName || 'Visitante'
                          const homeScore = home.score ?? '-'
                          const awayScore = away.score ?? '-'

                          const dateStr = ev.date ? new Date(ev.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }) : ''
                          const timeStr = ev.date ? new Date(ev.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }) : '--:--'

                          const venueFull = comp.venue?.fullName || ''
                          const venueCity = comp.venue?.address?.city || ''
                          const venueName = (venueFull && venueCity) ? `${venueFull}, ${venueCity}` : (venueFull || venueCity || '')

                          // Cruce ESTRICTO con nuestra base de datos
                          // Usamos coincidencia más estricta que coincide() para evitar falsos positivos
                          // (ej: "Real Madrid" no debe matchear con "Real Sociedad")
                          const strictNorm = (s: string) => s.toLowerCase()
                            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                            .replace(/[^a-z0-9 ]/g, '').replace(/  +/g, ' ').trim()

                          const dbMatch = partidosDb.find(p => {
                            // Match por ESPN ID (100% confiable)
                            if (p.metadata?.espn_id && String(p.metadata.espn_id) === String(ev.id)) return true
                            // Match estricto: ambos nombres normalizados deben incluirse mutuamente
                            const dbLocal = strictNorm(p.equipo_local)
                            const dbVisit = strictNorm(p.equipo_visitante)
                            const espnHome = strictNorm(homeName)
                            const espnAway = strictNorm(awayName)
                            if (dbLocal.length < 3 || dbVisit.length < 3 || espnHome.length < 3 || espnAway.length < 3) return false
                            const localOk = espnHome.includes(dbLocal) || dbLocal.includes(espnHome)
                            const visitOk = espnAway.includes(dbVisit) || dbVisit.includes(espnAway)
                            return localOk && visitOk
                          })

                          return (
                            <div key={ev.id} className={`flex flex-col bg-[#081024] border rounded-xl overflow-hidden transition-colors ${isLive ? 'border-red-600/40 shadow-[0_0_15px_-3px_rgba(220,38,38,0.2)]' : 'border-white/5 hover:border-white/10'}`}>
                              
                              {/* Meta Info */}
                              <div className='flex items-center justify-between px-3 py-1.5 bg-black/30 border-b border-white-[0.03] text-[10px] uppercase font-bold text-slate-500'>
                                <div className='flex items-center gap-1.5'>
                                  <CalendarDays size={10} className='text-blue-500' />
                                  <span>{dateStr}</span>
                                </div>
                                {venueName && (
                                  <div className='flex items-center gap-1.5 max-w-[50%] overflow-hidden'>
                                    <MapPin size={10} className='text-slate-500 flex-shrink-0' />
                                    <span className='truncate'>{venueName}</span>
                                  </div>
                                )}
                              </div>

                              {/* Equipos y Marcador */}
                              <div className='flex items-center justify-center p-3 sm:px-5 gap-3 sm:gap-6'>
                                {/* Local */}
                                <div className='flex items-center justify-end flex-1 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl gap-2 sm:gap-3 min-w-0'>
                                  <span className='font-barlow text-sm sm:text-base font-bold text-slate-200 truncate'>{homeName}</span>
                                  <div className='relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0'>
                                    {homeLogo && <img src={homeLogo} alt={homeName} className='w-full h-full object-contain drop-shadow-md' />}
                                  </div>
                                </div>

                                {/* Centro */}
                                <div className='flex flex-col items-center justify-center min-w-[100px] sm:min-w-[130px] flex-shrink-0'>
                                  {isLive ? (
                                    <div className='bg-red-600/10 border border-red-500 text-red-500 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase flex items-center gap-1 mb-2 shadow-sm whitespace-nowrap'>
                                      <span className='w-1.5 h-1.5 bg-red-500 rounded-full animate-blink' />
                                      {detail || (period === 1 ? '1er T' : period === 2 ? '2do T' : 'EN VIVO')}
                                    </div>
                                  ) : state === 'post' ? (
                                    <div className='bg-slate-800/60 border border-slate-600 text-slate-400 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2 whitespace-nowrap'>
                                      Finalizado
                                    </div>
                                  ) : (
                                    <div className='bg-blue-600/10 border border-blue-500 text-blue-400 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black tracking-widest uppercase mb-2 whitespace-nowrap'>
                                      {timeStr} ARG
                                    </div>
                                  )}

                                  <div className='bg-black px-4 py-1.5 rounded-2xl flex items-center gap-2 border border-white/5'>
                                    {state === 'pre' ? (
                                      <span className='font-barlow text-sm font-bold text-slate-500 tracking-widest uppercase'>VS</span>
                                    ) : (
                                      <>
                                        <span className='font-barlow text-xl sm:text-2xl font-black text-white'>{homeScore}</span>
                                        <span className='text-white/30 text-sm'>-</span>
                                        <span className='font-barlow text-xl sm:text-2xl font-black text-white'>{awayScore}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                {/* Visitante */}
                                <div className='flex items-center justify-start flex-1 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl gap-2 sm:gap-3 min-w-0'>
                                  <div className='relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0'>
                                    {awayLogo && <img src={awayLogo} alt={awayName} className='w-full h-full object-contain drop-shadow-md' />}
                                  </div>
                                  <span className='font-barlow text-sm sm:text-base font-bold text-slate-200 truncate'>{awayName}</span>
                                </div>
                              </div>

                              {/* Botón Ver Partido si existe en DB local */}
                              {dbMatch && (
                                <div className='px-4 pb-4 flex justify-center'>
                                  <a href={`/partido/${dbMatch.slug}`} className='flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-barlow text-xs sm:text-sm font-black tracking-widest uppercase px-6 py-2 rounded-lg shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all w-full max-w-sm'>
                                    ▶ Ver Partido
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        <div className='text-center mt-6 text-[10px] font-bold text-slate-600 tracking-[1px] uppercase pb-8'>
          Última actualización: {lastUpdated}
        </div>
      </main>
    </div>
  )
}
