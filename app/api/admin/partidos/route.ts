import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

function checkAuth(req: NextRequest) {
  const auth = req.cookies.get('admin_auth')
  return auth?.value === process.env.ADMIN_SECRET
}

// GET — listar
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data } = await supabaseAdmin().from('partidos').select('*').order('creado_en', { ascending: false })
  return NextResponse.json(data)
}

// POST — crear
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const slug = slugify(`${body.equipo_local}-vs-${body.equipo_visitante}-${Date.now()}`)
  const { data, error } = await supabaseAdmin()
    .from('partidos')
    .insert({ ...body, slug })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
