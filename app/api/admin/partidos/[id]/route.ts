import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function checkAuth(req: NextRequest) {
  return req.cookies.get('admin_auth')?.value === process.env.ADMIN_SECRET
}

// PUT — editar
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { data, error } = await supabaseAdmin()
    .from('partidos')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// DELETE — eliminar
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await supabaseAdmin().from('partidos').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// POST con _method=DELETE (para forms HTML)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.formData()
  if (body.get('_method') === 'DELETE') return DELETE(req, { params })
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
