import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const refresh_token = req.cookies.get('blogger_refresh_token')?.value
  if (!refresh_token) return NextResponse.json({ error: 'no_refresh_token' }, { status: 401 })

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (data.error) return NextResponse.json({ error: data.error }, { status: 401 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('blogger_access_token', data.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3500
  })
  return response
}
