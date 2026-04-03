import { supabaseAdmin } from '@/lib/supabase'
import { Partido } from '@/types'
import PartidoForm from '@/components/admin/PartidoForm'
import { notFound } from 'next/navigation'

export default async function EditarPartidoPage({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin()
    .from('partidos')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  return <PartidoForm modo='editar' partido={data as Partido} />
}
