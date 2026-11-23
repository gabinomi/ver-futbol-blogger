import { NextRequest, NextResponse } from 'next/server'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!
const REDIRECT_URI = process.env.NEXT_PUBLIC_URL + '/api/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/admin?error=auth', req.url))
  }

  if (!code) {
    // Redirigir a Google OAuth
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/blogger',
      access_type: 'offline',
      prompt: 'consent',
    })
    return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`)
  }

  // Intercambiar code por tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (tokens.error) {
    return NextResponse.redirect(new URL('/admin?error=token', req.url))
  }

  // Guardar refresh_token en cookie segura
  const res = NextResponse.redirect(new URL('/admin/eventos', req.url))
  res.cookies.set('blogger_access_token', tokens.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 3500
  })
  if (tokens.refresh_token) {
    res.cookies.set('blogger_refresh_token', tokens.refresh_token, {
      httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365
    })
  }
  return res
}
