'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Partido } from '@/types'

const estadoConfig = {
  'EN-VIVO': {
    label: 'EN VIVO',
    dot: true,
    cardClass: 'card-en-vivo',
    labelClass: 'bg-red-600/15 border border-red-600 text-red-400',
    thumbClass: 'opacity-95',
  },
  'PROXIMO': {
    label: 'PRÓXIMO',
    dot: false,
    cardClass: 'border-blue-600/40',
    labelClass: 'bg-blue-600/12 border border-blue-600 text-blue-400',
    thumbClass: 'brightness-50 saturate-50',
  },
  'FINALIZADO': {
    label: 'FINALIZADO',
    dot: false,
    cardClass: 'border-emerald-600/30',
    labelClass: 'bg-emerald-600/12 border border-emerald-600 text-emerald-400',
    thumbClass: 'grayscale-[55%] brightness-[0.38]',
  },
}

export default function PostCard({ partido }: { partido: Partido }) {
  const cfg = estadoConfig[partido.estado] || estadoConfig['PROXIMO']
  const thumb = partido.img_og || partido.img_video || 'https://placehold.co/400x225/060d1a/1e40af?text=EN+VIVO'

  return (
    <Link
      href={`/partido/${partido.slug}`}
      className={`flex flex-col rounded-xl overflow-hidden border border-white/8 bg-[#08102480] hover:-translate-y-1 hover:shadow-2xl transition-all duration-250 ${cfg.cardClass}`}
    >
      {/* Estado */}
      <div className='text-center py-2 px-2 border-b border-white/5'>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-[1.5px] uppercase ${cfg.labelClass}`}>
          {cfg.dot && <span className='w-1.5 h-1.5 bg-red-600 rounded-full animate-blink' />}
          {cfg.label}
        </span>
      </div>

      {/* Thumbnail */}
      <div className='relative aspect-video overflow-hidden'>
        <Image
          src={thumb}
          alt={`${partido.equipo_local} vs ${partido.equipo_visitante}`}
          fill
          className={`object-cover ${cfg.thumbClass}`}
          loading='lazy'
        />
        {partido.estado === 'FINALIZADO' && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/48'>
            <span className='font-barlow text-sm font-black text-white/65 tracking-[3px] uppercase'>Finalizado</span>
          </div>
        )}
      </div>

      {/* Título */}
      <div className='px-2.5 py-2 border-t border-white/5'>
        <p className='font-barlow font-black text-[13px] uppercase tracking-wide text-white/80 text-center truncate'>
          {partido.equipo_local} vs {partido.equipo_visitante}
        </p>
      </div>
    </Link>
  )
}
