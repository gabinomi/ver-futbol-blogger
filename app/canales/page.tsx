const CANALES = [
  { nombre: 'ESPN 1',              stream: 'espnplus1',       grupo: 'ESPN'  },
  { nombre: 'ESPN 2',              stream: 'espnplus2',       grupo: 'ESPN'  },
  { nombre: 'ESPN 3',              stream: 'espnplus3',       grupo: 'ESPN'  },
  { nombre: 'ESPN Premium',        stream: 'espnpremium',     grupo: 'ESPN'  },
  { nombre: 'Fox Sports 1',        stream: 'foxsports1',      grupo: 'FOX'   },
  { nombre: 'Fox Sports 2',        stream: 'foxsports2',      grupo: 'FOX'   },
  { nombre: 'Fox Sports 3',        stream: 'foxsports3',      grupo: 'FOX'   },
  { nombre: 'TyC Sports',          stream: 'tycsports',       grupo: 'TYC'   },
  { nombre: 'TyC Internacional',   stream: 'tycinternacional', grupo: 'TYC'  },
  { nombre: 'TNT Sports',          stream: 'tntsports',       grupo: 'TNT'   },
]

const STREAM_BASE = 'https://streamtp10.com/global1.php?stream='

export default function CanalesPage() {
  return (
    <main className='relative z-10 max-w-[900px] mx-auto px-4 py-8'>
      <h1 className='font-barlow text-3xl font-black uppercase tracking-widest text-white mb-6 text-center'>
        Canales EN VIVO HD
      </h1>
      <div className='grid grid-cols-5 gap-3 sm:grid-cols-3 xs:grid-cols-2'>
        {CANALES.map(c => (
          <a key={c.stream} href={`/canales/${c.stream}`}
            className='flex flex-col items-center gap-2.5 bg-[#08102480] border border-white/8 rounded-xl p-4 hover:-translate-y-1 hover:border-red-600 hover:shadow-[0_8px_28px_rgba(220,38,38,0.25)] transition-all'>
            <span className='text-[8px] font-bold tracking-[1px] uppercase text-slate-600'>{c.grupo}</span>
            <div className='w-12 h-12 bg-white/6 rounded-full border border-white/8 flex items-center justify-center'>
              <span className='font-barlow font-black text-[11px] text-slate-400 text-center leading-tight'>{c.nombre.substring(0,6)}</span>
            </div>
            <span className='font-barlow font-black text-sm uppercase tracking-wide text-slate-300 text-center leading-tight'>{c.nombre}</span>
            <div className='flex items-center gap-1 text-[9px] font-bold text-emerald-400 uppercase tracking-wider'>
              <span className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-blink' />EN VIVO
            </div>
          </a>
        ))}
      </div>
    </main>
  )
}
