import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { LayoutDashboard, Plus, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    redirect('/admin/login')
  }
  return (
    <div className='min-h-screen flex bg-[#060d1a]'>
      <aside className='w-56 bg-[#08102480] border-r border-white/7 flex flex-col'>
        <div className='px-5 py-5 border-b border-white/7'>
          <span className='font-barlow text-lg font-black uppercase tracking-widest text-white'>Admin Panel</span>
        </div>
        <nav className='flex-1 p-4 flex flex-col gap-1'>
          <Link href='/admin/partidos' className='flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/7 text-sm font-medium transition-colors'>
            <LayoutDashboard size={15} /> Partidos
          </Link>
          <Link href='/admin/partidos/new' className='flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/7 text-sm font-medium transition-colors'>
            <Plus size={15} /> Nuevo partido
          </Link>
        </nav>
        <div className='p-4 border-t border-white/7'>
          <form action='/api/admin/logout' method='POST'>
            <button className='flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors'>
              <LogOut size={14} /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>
      <main className='flex-1 p-6 overflow-auto'>{children}</main>
    </div>
  )
}
