import { supabase } from '@/lib/supabase'
import { Partido } from '@/types'
import PostCard from '@/components/public/PostCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ver Fútbol EN VIVO Gratis | Partidos de Hoy',
  description: 'Ver fútbol EN VIVO gratis. Partidos de hoy con links de streaming, horarios por país y marcadores en tiempo real.',
}

export const revalidate = 60

async function getPartidos(): Promise<Partido[]> {
  const { data } = await supabase
    .from('partidos')
    .select('*')
    .order('creado_en', { ascending: false })
    .limit(8)
  return (data as Partido[]) || []
}

export default async function HomePage() {
  const partidos = await getPartidos()

  return (
    <main className='relative z-10 max-w-[1400px] mx-auto px-4 py-8'>
      {/* Banner top */}
      <div className='flex justify-center mb-6'>
        <div className='w-full max-w-[728px] h-[90px] bg-white/5 rounded-lg flex items-center justify-center text-white/20 text-xs tracking-widest uppercase'>
          Banner 728×90
        </div>
      </div>

      {/* Grid */}
      <div className='grid grid-cols-4 gap-3 md:grid-cols-2 sm:grid-cols-1'>
        {partidos.map(p => (
          <PostCard key={p.id} partido={p} />
        ))}
        {partidos.length === 0 && (
          <div className='col-span-4 text-center py-20 text-white/30 font-barlow text-xl tracking-widest uppercase'>
            No hay partidos disponibles
          </div>
        )}
      </div>

      {/* Banner bottom */}
      <div className='flex justify-center mt-6'>
        <div className='w-full max-w-[728px] h-[90px] bg-white/5 rounded-lg flex items-center justify-center text-white/20 text-xs tracking-widest uppercase'>
          Banner 728×90
        </div>
      </div>
    </main>
  )
}
