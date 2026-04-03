'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Partido } from '@/types'
import { Home, Play, Radio, Clock, Tv2 } from 'lucide-react'

interface Props {
  partido: Partido
  escudoLocal: string | null
  escudoVisitante: string | null
  horarios: [string, string][] | null
  links: { video: string | null; link1: string | null; link2: string | null; link3: string | null }
}

const estadoBadge = {
  'EN-VIVO': { label: 'EN VIVO', cls: 'bg-red-600 animate-pulse-red', dot: true },
  'PROXIMO': { label: 'PRÓXIMO', cls: 'bg-blue-600', dot: false },
  'FINALIZADO': { label: 'FINALIZADO', cls: 'bg-emerald-600', dot: false },
}

export default function PartidoClient({ partido, escudoLocal, escudoVisitante, horarios, links }: Props) {
  const badge = estadoBadge[partido.estado] || estadoBadge['PROXIMO']
  const imgVideo = partido.img_video || 'https://placehold.co/720x405/060d1a/1e40af?text=EN+VIVO'

  return (
    <main className='relative z-10 flex justify-center px-4 py-6 gap-5 max-w-[1400px] mx-auto'>

      {/* LATERAL IZQ */}
      <aside className='hidden xl:block w-40 flex-shrink-0 sticky top-6 self-start'>
        <div className='w-40 h-[600px] bg-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs tracking-widest'>160×600</div>
      </aside>

      {/* CONTENIDO */}
      <div className='flex-1 max-w-[500px] flex flex-col gap-4'>

        {/* CARD PRINCIPAL */}
        <div className='rounded-2xl overflow-hidden border border-white/9 bg-[#08102070] shadow-[0_30px_70px_rgba(0,0,0,0.65)] backdrop-blur-sm'>

          {/* HEADER */}
          <div className='bg-gradient-to-br from-[#0d2860] via-[#1746b8] to-[#1a3a9a] px-5 py-4 text-center relative overflow-hidden'>
            <div className='absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.1),transparent_65%)]' />
            <span className={`inline-flex items-center gap-1.5 ${badge.cls} text-white px-3 py-1 rounded-full text-[11px] font-bold tracking-[1.5px] uppercase mb-2`}>
              {badge.dot && <span className='w-1.5 h-1.5 bg-white rounded-full animate-blink' />}
              {badge.label}
            </span>
            <p className='font-barlow text-xl font-black tracking-widest uppercase text-[#dceeff]'>FÚTBOL EN VIVO</p>
          </div>

          {/* MATCH HERO */}
          <div className='relative flex items-center justify-center px-5 py-4 bg-gradient-to-b from-[#0d286088] to-transparent gap-0'>
            <div className='absolute inset-x-0 top-1/2 -translate-y-1/2 h-9 bg-[#1746b8] opacity-55 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_50%,calc(100%-14px)_100%,0_100%,14px_50%)]' />
            <div className='flex-1 text-center z-10 pr-1'>
              <span className='font-barlow text-xl font-black uppercase tracking-wide text-white drop-shadow-lg'>{partido.equipo_local}</span>
            </div>
            <div className='z-20 w-12 h-12 bg-red-600 rounded-md mx-2 flex items-center justify-center shadow-[0_4px_16px_rgba(220,38,38,0.55)] -rotate-3 flex-shrink-0'>
              <span className='font-barlow text-xl font-black text-white rotate-3'>VS</span>
            </div>
            <div className='flex-1 text-center z-10 pl-1'>
              <span className='font-barlow text-xl font-black uppercase tracking-wide text-white drop-shadow-lg'>{partido.equipo_visitante}</span>
            </div>
          </div>

          {/* SCORE BAR */}
          <div className='flex items-center justify-center gap-3 px-5 py-3 bg-black/60 border-b border-white/6'>
            <div className='w-10 h-10 rounded-full bg-white/6 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0'>
              {escudoLocal
                ? <Image src={escudoLocal} alt={partido.equipo_local} width={40} height={40} className='object-contain p-1' />
                : <span className='font-barlow text-[9px] font-bold text-white/40 text-center'>{partido.equipo_local.substring(0,3).toUpperCase()}</span>
              }
            </div>
            <div className='flex items-center gap-2 flex-1 justify-center'>
              <span className='font-barlow text-4xl font-black text-white leading-none min-w-7 text-center'>{partido.gol_local}</span>
              <span className='font-barlow text-2xl font-bold text-white/30'>-</span>
              <span className='font-barlow text-4xl font-black text-white leading-none min-w-7 text-center'>{partido.gol_visitante}</span>
            </div>
            <div className='w-10 h-10 rounded-full bg-white/6 border border-white/10 overflow-hidden flex items-center justify-center flex-shrink-0'>
              {escudoVisitante
                ? <Image src={escudoVisitante} alt={partido.equipo_visitante} width={40} height={40} className='object-contain p-1' />
                : <span className='font-barlow text-[9px] font-bold text-white/40 text-center'>{partido.equipo_visitante.substring(0,3).toUpperCase()}</span>
              }
            </div>
          </div>

          <div className='px-5 py-4 flex flex-col gap-3'>

            {/* CANALES */}
            {partido.canales && (
              <div className='flex items-center gap-2 bg-black/60 border border-dashed border-blue-500/45 rounded-lg px-3 py-2.5 text-sm'>
                <Tv2 size={15} className='text-blue-400 flex-shrink-0' />
                <span className='text-slate-300'>{partido.canales}</span>
              </div>
            )}

            {/* VIDEO THUMB */}
            <a href={links.video || '#'} target='_blank' rel='noopener'
              className='relative block rounded-xl overflow-hidden border border-white/7 aspect-video bg-black cursor-pointer group'>
              <Image src={imgVideo} alt='Ver partido' fill className='object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500' />
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='w-16 h-16 rounded-full bg-black/58 border-2 border-white/85 flex items-center justify-center group-hover:bg-blue-600 transition-colors'>
                  <Play size={20} className='text-white ml-1' />
                </div>
              </div>
              {partido.estado === 'EN-VIVO' && (
                <div className='absolute top-2.5 left-2.5 bg-red-600/88 text-white text-[10px] font-bold tracking-wide px-2 py-1 rounded flex items-center gap-1.5 uppercase'>
                  <span className='w-1.5 h-1.5 bg-white rounded-full animate-blink' /> EN VIVO
                </div>
              )}
            </a>

            {/* HORARIOS */}
            {partido.estado !== 'FINALIZADO' && horarios && (
              <div className='bg-black/60 rounded-xl px-3.5 py-3'>
                <div className='flex items-center gap-2 text-[10px] uppercase tracking-[1.5px] text-slate-500 font-semibold mb-2.5'>
                  <Clock size={12} className='text-slate-600' />
                  Horarios por país
                </div>
                <div className='grid grid-cols-2 gap-0'>
                  {horarios.map(([pais, hora]) => (
                    <div key={pais} className='flex items-center justify-between py-1.5 px-1 border-b border-slate-800/50 text-xs gap-1'>
                      <span className='text-slate-400'>{pais}</span>
                      <span className='font-barlow font-bold text-[13px] text-slate-200 tracking-wide'>{hora}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOTÓN PRINCIPAL */}
            {links.link1 && (
              <div>
                <div className='flex items-center text-[9px] uppercase tracking-[2px] text-slate-500 font-bold mb-2 gap-2'>
                  <span className='flex-1 h-px bg-white/7' />
                  Ver transmisión
                  <span className='flex-1 h-px bg-white/7' />
                </div>
                <a href={links.link1} target='_blank' rel='noopener'
                  className='relative flex items-center justify-center gap-2.5 w-full bg-gradient-to-br from-blue-600 to-blue-800 text-white py-4 rounded-xl font-barlow text-xl font-black tracking-[1.5px] uppercase overflow-hidden shadow-[0_6px_22px_rgba(37,99,235,0.45)] animate-pulse-blue animate-shine'>
                  <Radio size={18} className='flex-shrink-0' />
                  Ver Transmisión HD
                </a>
              </div>
            )}

            {/* BOTONES ALT */}
            {(links.link2 || links.link3) && (
              <div>
                <div className='flex items-center text-[9px] uppercase tracking-[2px] text-slate-500 font-bold mb-2 gap-2'>
                  <span className='flex-1 h-px bg-white/7' />
                  Enlaces alternativos
                  <span className='flex-1 h-px bg-white/7' />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  {links.link2 && (
                    <a href={links.link2} target='_blank' rel='noopener'
                      className='flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-blue-600/15 hover:border-blue-600/45 hover:text-white py-3 rounded-xl font-barlow text-sm font-bold tracking-wide uppercase transition-all'>
                      <Radio size={13} /> Opción 2
                    </a>
                  )}
                  {links.link3 && (
                    <a href={links.link3} target='_blank' rel='noopener'
                      className='flex items-center justify-center gap-2 bg-slate-800 border border-slate-700 text-slate-400 hover:bg-blue-600/15 hover:border-blue-600/45 hover:text-white py-3 rounded-xl font-barlow text-sm font-bold tracking-wide uppercase transition-all'>
                      <Radio size={13} /> Opción 3
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* BOTÓN VER CANALES */}
            <a href='/canales' target='_blank' rel='noopener'
              className='relative flex items-center justify-center gap-2 w-full bg-gradient-to-br from-red-600 to-red-800 text-white py-3.5 rounded-xl font-barlow text-[1.1rem] font-black tracking-[1.5px] uppercase overflow-hidden shadow-[0_6px_24px_rgba(220,38,38,0.45)] animate-pulse-red animate-shine'>
              <span className='w-1.5 h-1.5 bg-white rounded-full animate-blink flex-shrink-0' />
              <Play size={14} />
              <span className='hidden sm:inline'>Ver Canales EN VIVO</span>
              <span className='sm:hidden'>Ver Canales</span>
            </a>

            {/* BOTÓN INICIO */}
            <div className='flex justify-center'>
              <Link href='/' className='inline-flex items-center gap-2 text-white/45 hover:text-white/85 text-xs font-semibold tracking-wide px-3 py-2 rounded-lg border border-white/8 bg-white/4 transition-colors'>
                <Home size={11} /> Inicio
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* LATERAL DER */}
      <aside className='hidden xl:block w-40 flex-shrink-0 sticky top-6 self-start'>
        <div className='w-40 h-[600px] bg-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs tracking-widest'>160×600</div>
      </aside>

    </main>
  )
}
