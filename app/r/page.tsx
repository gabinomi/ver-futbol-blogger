'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { Play, Link2 } from 'lucide-react'

const DURACION = 15
const MSGS = [
  'Preparando el enlace de transmisión...',
  'Verificando disponibilidad...',
  'Conectando con el servidor...',
  '¡Listo para reproducir!',
]

function RedirContent() {
  const params = useSearchParams()
  const destUrl = params.get('url')
  const titulo = params.get('t') || 'Transmisión en vivo'
  const [remaining, setRemaining] = useState(DURACION)
  const [done, setDone] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const start = () => {
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current!)
          setDone(true)
          if (destUrl) setTimeout(() => { window.location.href = destUrl }, 500)
          return 0
        }
        return r - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (!destUrl) return
    start()
    const onVisibility = () => {
      if (document.hidden) clearInterval(intervalRef.current!)
      else start()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearInterval(intervalRef.current!)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [destUrl])

  const pct = remaining / DURACION
  const circumference = 226
  const offset = circumference * (1 - pct)
  const msgIdx = Math.min(Math.floor((1 - pct) * MSGS.length), MSGS.length - 1)

  return (
    <main className='relative z-10 flex flex-col min-h-screen'>
      {/* Banner top */}
      <div className='flex justify-center py-3 px-4 bg-black/70 border-b border-white/5'>
        <div className='w-full max-w-[728px] h-[90px] bg-white/5 rounded flex items-center justify-center text-white/20 text-xs tracking-widest'>Banner 728×90</div>
      </div>

      <div className='flex flex-1 gap-5 max-w-[1400px] mx-auto w-full px-4 py-6 items-start justify-center'>

        {/* LATERAL IZQ */}
        <aside className='hidden xl:block w-40 flex-shrink-0 sticky top-6'>
          <div className='w-40 h-[600px] bg-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs tracking-widest'>160×600</div>
        </aside>

        {/* CARD */}
        <div className='flex-1 max-w-[520px]'>
          <div className='rounded-2xl overflow-hidden border border-white/9 bg-[#08102080] shadow-[0_30px_70px_rgba(0,0,0,0.65)]'>

            {/* HEADER */}
            <div className='bg-gradient-to-br from-[#0d2860] via-[#1746b8] to-[#1a3a9a] px-5 py-5 text-center relative overflow-hidden'>
              <div className='absolute inset-x-0 top-0 h-32 bg-[radial-gradient(ellipse_at_50%_0%,rgba(255,255,255,0.1),transparent_65%)]' />
              <p className='font-barlow text-[11px] font-bold tracking-[3px] uppercase text-white/50 mb-1 relative z-10'>Ver Fútbol EN VIVO Gratis</p>
              <h1 className='font-barlow text-2xl font-black uppercase tracking-wide text-white relative z-10'>{decodeURIComponent(titulo)}</h1>
            </div>

            <div className='px-5 py-6 flex flex-col items-center gap-5'>

              {/* URL blur */}
              <div className='flex items-center gap-2 w-full bg-black/60 border border-white/7 rounded-xl px-3 py-2.5'>
                <Link2 size={14} className='text-blue-400 flex-shrink-0' />
                <span className='text-[11px] text-slate-500 truncate flex-1 blur-sm select-none pointer-events-none'>
                  {destUrl || 'No se recibió enlace'}
                </span>
              </div>

              {/* Contador */}
              <div className='flex flex-col items-center gap-3'>
                <span className='text-[11px] font-semibold tracking-[2px] uppercase text-slate-500'>Redirigiendo en</span>
                <div className='relative w-24 h-24'>
                  <svg className='w-24 h-24 -rotate-90' viewBox='0 0 90 90'>
                    <circle cx='45' cy='45' r='36' fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='4' />
                    <circle cx='45' cy='45' r='36' fill='none'
                      stroke={remaining <= 3 ? '#2563eb' : '#dc2626'}
                      strokeWidth='4' strokeLinecap='round'
                      strokeDasharray={circumference}
                      strokeDashoffset={offset}
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                    />
                  </svg>
                  <div className='absolute inset-0 flex items-center justify-center font-barlow text-4xl font-black text-white'>
                    {done ? '✓' : remaining}
                  </div>
                </div>
                <p className='text-[11px] text-slate-500 text-center'>{done ? '¡Listo! Abriendo transmisión...' : MSGS[msgIdx]}</p>
              </div>

              {/* Barra progreso */}
              <div className='w-full h-1 bg-white/5 rounded-full overflow-hidden'>
                <div className='h-full bg-gradient-to-r from-red-600 to-blue-600 rounded-full origin-left transition-transform duration-1000 linear'
                  style={{ transform: `scaleX(${pct})` }} />
              </div>

              {/* Banner 300x250 */}
              <div className='flex justify-center w-full'>
                <div className='w-[300px] h-[250px] bg-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs tracking-widest'>300×250</div>
              </div>

              {/* Botón continuar */}
              <a href={destUrl || '#'} target='_blank' rel='noopener'
                className={`relative flex items-center justify-center gap-2.5 w-full py-4 rounded-xl font-barlow text-xl font-black tracking-[1.5px] uppercase overflow-hidden transition-all duration-400 ${
                  done
                    ? 'bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-[0_6px_22px_rgba(37,99,235,0.45)] animate-pulse-blue cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed pointer-events-none filter brightness-50 saturate-0'
                }`}>
                <Play size={18} className='flex-shrink-0' />
                Ver transmisión
              </a>

            </div>

            <div className='px-5 py-3 border-t border-white/5 text-center text-[11px] text-slate-600'>
              Serás redirigido automáticamente. Si no funciona, usá el botón.
            </div>
          </div>
        </div>

        {/* LATERAL DER */}
        <aside className='hidden xl:block w-40 flex-shrink-0 sticky top-6'>
          <div className='w-40 h-[600px] bg-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs tracking-widest'>160×600</div>
        </aside>
      </div>

      {/* Banner bottom */}
      <div className='flex justify-center py-3 px-4 bg-black/70 border-t border-white/5'>
        <div className='w-full max-w-[728px] h-[90px] bg-white/5 rounded flex items-center justify-center text-white/20 text-xs tracking-widest'>Banner 728×90</div>
      </div>
    </main>
  )
}

export default function RedirPage() {
  return (
    <Suspense>
      <RedirContent />
    </Suspense>
  )
}
