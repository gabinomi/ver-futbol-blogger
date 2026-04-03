import { supabaseAdmin } from '@/lib/supabase'
import { Partido } from '@/types'
import Link from 'next/link'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export const revalidate = 0

const estadoColor = {
  'EN-VIVO': 'bg-red-600/20 text-red-400 border-red-600/40',
  'PROXIMO': 'bg-blue-600/20 text-blue-400 border-blue-600/40',
  'FINALIZADO': 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40',
}

export default async function AdminPartidosPage() {
  const { data } = await supabaseAdmin()
    .from('partidos')
    .select('*')
    .order('creado_en', { ascending: false })

  const partidos = (data as Partido[]) || []

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='font-barlow text-2xl font-black uppercase tracking-widest text-white'>Partidos</h1>
        <Link href='/admin/partidos/new'
          className='flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-barlow font-bold uppercase tracking-wide text-sm transition-colors'>
          <Plus size={15} /> Nuevo partido
        </Link>
      </div>

      <div className='bg-[#08102480] border border-white/7 rounded-2xl overflow-hidden'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-b border-white/7 text-slate-500 text-xs uppercase tracking-widest'>
              <th className='text-left px-4 py-3 font-semibold'>Partido</th>
              <th className='text-left px-4 py-3 font-semibold'>Estado</th>
              <th className='text-left px-4 py-3 font-semibold'>Marcador</th>
              <th className='text-left px-4 py-3 font-semibold'>Hora UTC</th>
              <th className='text-right px-4 py-3 font-semibold'>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {partidos.map((p, i) => (
              <tr key={p.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/2'}`}>
                <td className='px-4 py-3'>
                  <span className='font-barlow font-black uppercase tracking-wide text-white text-sm'>
                    {p.equipo_local} <span className='text-slate-500'>vs</span> {p.equipo_visitante}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <span className={`text-[10px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-full border ${estadoColor[p.estado]}`}>
                    {p.estado}
                  </span>
                </td>
                <td className='px-4 py-3 font-barlow font-black text-white'>
                  {p.gol_local} - {p.gol_visitante}
                </td>
                <td className='px-4 py-3 text-slate-400 text-xs'>
                  {p.hora_utc ? new Date(p.hora_utc).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }) : '—'}
                </td>
                <td className='px-4 py-3'>
                  <div className='flex items-center justify-end gap-2'>
                    <Link href={`/admin/partidos/${p.id}`}
                      className='p-1.5 text-slate-400 hover:text-white hover:bg-white/7 rounded-lg transition-colors'>
                      <Pencil size={13} />
                    </Link>
                    <form action={`/api/admin/partidos/${p.id}`} method='POST'>
                      <input type='hidden' name='_method' value='DELETE' />
                      <button type='submit' className='p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors'>
                        <Trash2 size={13} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {partidos.length === 0 && (
              <tr>
                <td colSpan={5} className='px-4 py-12 text-center text-slate-600 font-barlow uppercase tracking-widest'>
                  No hay partidos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
