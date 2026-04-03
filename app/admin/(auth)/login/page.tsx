'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/admin/partidos')
    } else {
      setError('Contraseña incorrecta')
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[#060d1a]'>
      <div className='w-full max-w-sm bg-[#08102480] border border-white/9 rounded-2xl p-8 shadow-2xl'>
        <div className='text-center mb-8'>
          <div className='w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
            <Lock size={22} className='text-white' />
          </div>
          <h1 className='font-barlow text-2xl font-black uppercase tracking-widest text-white'>Admin</h1>
          <p className='text-slate-500 text-sm mt-1'>Ver Fútbol EN VIVO</p>
        </div>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder='Contraseña'
            className='w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors'
          />
          {error && <p className='text-red-400 text-sm text-center'>{error}</p>}
          <button type='submit' disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-barlow font-black uppercase tracking-widest py-3 rounded-xl transition-colors disabled:opacity-50'>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
