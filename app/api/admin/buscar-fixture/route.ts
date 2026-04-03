import { NextRequest, NextResponse } from 'next/server'
import { buscarFixture } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const { local, visitante } = await req.json()
  if (!local || !visitante) {
    return NextResponse.json({ error: 'Faltan equipos' }, { status: 400 })
  }
  const resultado = await buscarFixture(local, visitante)
  return NextResponse.json(resultado || {})
}
