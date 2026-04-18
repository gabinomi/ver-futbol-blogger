import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')
  if (!query) return NextResponse.json({ images: [] })

  try {
    // Paso 1: obtener token vqd de DuckDuckGo (requerido para la búsqueda de imágenes)
    const htmlRes = await fetch(
      `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=images`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es-AR,es;q=0.9',
        }
      }
    )
    const html = await htmlRes.text()

    // Extraer vqd del HTML
    const vqdMatch = html.match(/vqd=['"]([^'"]+)['"]/) ||
                     html.match(/vqd=([0-9-]+)/)
    if (!vqdMatch) {
      return NextResponse.json({ images: [], error: 'No se pudo obtener token DDG' }, { status: 500 })
    }
    const vqd = vqdMatch[1]

    // Paso 2: buscar imágenes
    const imgRes = await fetch(
      `https://duckduckgo.com/i.js?` +
      `q=${encodeURIComponent(query)}&vqd=${vqd}&p=1&o=json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://duckduckgo.com/',
          'Accept': 'application/json',
        }
      }
    )

    if (!imgRes.ok) {
      return NextResponse.json({ images: [], error: `DDG images ${imgRes.status}` }, { status: 500 })
    }

    const imgData = await imgRes.json()
    const results = imgData.results || []

    // Extraer URLs — preferir imagen full, fallback a thumbnail
    const images = results
      .slice(0, 20)
      .map((r: any) => r.image || r.thumbnail)
      .filter((url: string) => url && url.startsWith('http'))
      .filter((url: string, i: number, arr: string[]) => arr.indexOf(url) === i) // dedup
      .slice(0, 15)

    return NextResponse.json({ images }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })

  } catch (e: any) {
    return NextResponse.json({ images: [], error: e.message }, { status: 500 })
  }
}
