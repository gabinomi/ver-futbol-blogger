import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: true,
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: '/',
  })
  return res
}
