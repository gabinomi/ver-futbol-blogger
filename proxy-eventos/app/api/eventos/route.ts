import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://streamtpnew.com/eventos.json', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://streamtpnew.com/',
        'Accept': 'application/json',
      },
      next: { revalidate: 300 }
    })

    if (!res.ok) throw new Error('StreamTP error: ' + res.status)
    const data = await res.json()

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'No se pudo cargar la agenda', detail: e.message },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
