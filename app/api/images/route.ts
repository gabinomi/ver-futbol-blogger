import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const CSE_KEY = process.env.GOOGLE_CSE_KEY || 'AIzaSyCWguFbLPRuYX7-2x2r5GEY38HSfoCNSr8'
const CSE_ID  = process.env.GOOGLE_CSE_ID  || '520af1f93d2cd42ea'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')

  if (!query) return NextResponse.json({ images: [] })

  try {
    // 1. Buscar en sitios deportivos (og:image scraping via CSE)
    const newsUrl = `https://www.googleapis.com/customsearch/v1?` +
      `key=${CSE_KEY}&cx=${CSE_ID}` +
      `&q=${encodeURIComponent(query)}` +
      `&num=10&fields=items(link,pagemap/metatags,pagemap/cse_image)`

    const newsRes = await fetch(newsUrl)
    const newsData = await newsRes.json()

    const images: string[] = []

    if (newsData.items) {
      for (const item of newsData.items) {
        // Extraer og:image de los metatags
        const metatags = item.pagemap?.metatags?.[0]
        if (metatags) {
          const ogImg = metatags['og:image'] || metatags['twitter:image'] || metatags['image']
          if (ogImg && ogImg.startsWith('http') && !images.includes(ogImg)) {
            images.push(ogImg)
          }
        }
        // Extraer imagen de cse_image (thumbnail de Google)
        const cseImg = item.pagemap?.cse_image?.[0]?.src
        if (cseImg && cseImg.startsWith('http') && !images.includes(cseImg)) {
          images.push(cseImg)
        }
      }
    }

    // 2. Búsqueda de imágenes directa (para escudos/logos)
    const imgUrl = `https://www.googleapis.com/customsearch/v1?` +
      `key=${CSE_KEY}&cx=${CSE_ID}` +
      `&q=${encodeURIComponent(query + ' escudo')}&searchType=image` +
      `&num=5&imgSize=large&fields=items(link)`

    const imgRes = await fetch(imgUrl)
    const imgData = await imgRes.json()

    if (imgData.items) {
      for (const item of imgData.items) {
        if (item.link && !images.includes(item.link)) {
          images.push(item.link)
        }
      }
    }

    // Filtrar imágenes inválidas o muy pequeñas
    const filtradas = images.filter(url => {
      return url && url.startsWith('http') &&
        !url.includes('logo-placeholder') &&
        !url.includes('1x1') && !url.includes('pixel')
    }).slice(0, 15)

    return NextResponse.json({ images: filtradas }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })

  } catch (e: any) {
    console.error('Image search error:', e)
    return NextResponse.json({ images: [], error: e.message }, { status: 500 })
  }
}
