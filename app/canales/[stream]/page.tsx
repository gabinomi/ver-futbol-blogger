'use client'
import { useState } from 'react'
import { RotateCw, Signal } from 'lucide-react'

const CANALES: Record<string, { nombre: string; stream1: string; stream2: string }> = {
  espnplus1:        { nombre: 'ESPN 1',            stream1: 'espnplus1',       stream2: 'espnplus1'       },
  espnplus2:        { nombre: 'ESPN 2',            stream1: 'espnplus2',       stream2: 'espnplus2'       },
  espnplus3:        { nombre: 'ESPN 3',            stream1: 'espnplus3',       stream2: 'espnplus3'       },
  espnpremium:      { nombre: 'ESPN Premium',      stream1: 'espnpremium',     stream2: 'espnpremium'     },
  foxsports1:       { nombre: 'Fox Sports 1',      stream1: 'foxsports1',      stream2: 'foxsports1'      },
  foxsports2:       { nombre: 'Fox Sports 2',      stream1: 'foxsports2',      stream2: 'foxsports2'      },
  foxsports3:       { nombre: 'Fox Sports 3',      stream1: 'foxsports3',      stream2: 'foxsports3'      },
  tycsports:        { nombre: 'TyC Sports',        stream1: 'tycsports',       stream2: 'tycsports'       },
  tycinternacional: { nombre: 'TyC Internacional', stream1: 'tycinternacional', stream2: 'tycinternacional'},
  tntsports:        { nombre: 'TNT Sports',        stream1: 'tntsports',       stream2: 'tntsports'       },
}

const BASE1 = 'https://streamtp10.com/global1.php?stream='
const BASE2 = 'https://streamtp10.com/global2.php?stream='

export default function CanalPage({ params }: { params: { stream: string } }) {
  const canal = CANALES[params.stream]
  const [src, setSrc] = useState(canal ? BASE1 + canal.stream1 : '')
  const [active, setActive] = useState(1)

  if (!canal) return <div className='text-center py-20 text-white/30 font-barlow text-xl uppercase tracking-widest'>Canal no encontrado</div>

  function reload() {
    const current = src
    setSrc('')
    setTimeout(() => setSrc(current), 100)
  }

  return (
    <main className='relative z-10 max-w-[900px] mx-auto px-4 py-6'>
      <div className='bg-[#08102480] border border-white/9 rounded-2xl overflow-hidden'>

        {/* Header */}
        <div className='bg-gradient-to-br from-[#0d2860] via-[#1746b8] to-[#1a3a9a] px-5 py-4 flex items-center justify-between'>
          <h1 className='font-barlow text-xl font-black uppercase tracking-widest text-white'>{canal.nombre}</h1>
          <span className='flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase'>
            <span className='w-1.5 h-1.5 bg-white rounded-full animate-blink' />EN VIVO
          </span>
        </div>

        {/* Iframe */}
        <div className='relative w-full' style={{ paddingTop: '56.25%' }}>
          {src && (
            <iframe src={src} className='absolute inset-0 w-full h-full border-none'
              allow='encrypted-media' allowFullScreen scrolling='no' />
          )}
        </div>

        {/* Controles */}
        <div className='px-4 py-3 bg-black/60 border-t border-white/6 flex items-center gap-3 flex-wrap'>
          <span className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>Opciones:</span>
          {[1, 2].map(n => (
            <button key={n} onClick={() => { setSrc(n === 1 ? BASE1 + canal.stream1 : BASE2 + canal.stream2); setActive(n) }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-barlow font-bold text-xs uppercase tracking-wide transition-all ${
                active === n
                  ? 'bg-blue-600/35 border border-blue-600 text-white'
                  : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
              }`}>
              <Signal size={11} /> Opción {n}
            </button>
          ))}
          <button onClick={reload}
            className='flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600/12 border border-red-600/30 text-red-400 hover:text-white font-barlow font-bold text-xs uppercase tracking-wide transition-colors'>
            <RotateCw size={11} /> Recargar
          </button>
        </div>
      </div>
    </main>
  )
}
