import { supabase } from '@/lib/supabase'
import { Partido } from '@/types'
import { calcularHorarios, redirUrl, buscarEscudo } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import PartidoClient from '@/components/public/PartidoClient'

export const revalidate = 120

async function getPartido(slug: string): Promise<Partido | null> {
  const { data } = await supabase
    .from('partidos')
    .select('*')
    .eq('slug', slug)
    .single()
  return data as Partido | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPartido(params.slug)
  if (!p) return {}
  const title = `${p.equipo_local} vs ${p.equipo_visitante} | Ver EN VIVO Gratis`
  return {
    title,
    description: `${p.equipo_local} vs ${p.equipo_visitante} EN VIVO - Links de streaming gratis con horarios para Latinoamérica y España.`,
    openGraph: {
      title,
      images: p.img_og ? [p.img_og] : [],
    },
  }
}

export default async function PartidoPage({ params }: { params: { slug: string } }) {
  const partido = await getPartido(params.slug)
  if (!partido) notFound()

  // Escudos — si no están en DB, buscar en TheSportsDB
  const [escudoLocal, escudoVisitante] = await Promise.all([
    partido.escudo_local || buscarEscudo(partido.equipo_local),
    partido.escudo_visitante || buscarEscudo(partido.equipo_visitante),
  ])

  // Horarios
  const horarios = partido.hora_utc ? calcularHorarios(partido.hora_utc) : null

  // Links pasados por redirector
  const titulo = `${partido.equipo_local} vs ${partido.equipo_visitante}`
  const links = {
    video: partido.link_video || null,
    link1: partido.link1 ? redirUrl(partido.link1, titulo) : null,
    link2: partido.link2 ? redirUrl(partido.link2, titulo) : null,
    link3: partido.link3 ? redirUrl(partido.link3, titulo) : null,
  }

  return (
    <PartidoClient
      partido={partido}
      escudoLocal={escudoLocal}
      escudoVisitante={escudoVisitante}
      horarios={horarios}
      links={links}
    />
  )
}
