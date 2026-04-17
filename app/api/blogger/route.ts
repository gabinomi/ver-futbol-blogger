import { NextRequest, NextResponse } from 'next/server'

const BLOG_ID = '4582138764960172464'


async function getToken(req: NextRequest): Promise<string | null> {
  return req.cookies.get('blogger_access_token')?.value || null
}

function buildPostContent(data: any): string {
  const {
    equipoLocal, equipoVisitante, golLocal, golVisitante,
    estado, imgVideo, link1, link2, link3,
    canales, horaUtc, escudoLocal, escudoVisitante, sofascoreId
  } = data

  return `<div class="match-data"
  data-equipo-local="${equipoLocal || ''}"
  data-equipo-visitante="${equipoVisitante || ''}"
  data-gol-local="${golLocal ?? 0}"
  data-gol-visitante="${golVisitante ?? 0}"
  data-img-video="${imgVideo || 'https://i.imgur.com/1CeQ09b.png'}"
  data-link-video="https://www.profitablecpmratenetwork.com/cfj1qzr6f?key=1fba4a9d0f97087a4bf44f8c4dde2ba3"
  data-link1="${link1 || ''}"
  data-link2="${link2 || ''}"
  data-link3="${link3 || ''}"
  data-canales="${canales || ''}"
  data-estado="${estado || 'PRONTO'}"
  data-hora-utc="${horaUtc || ''}"
  ${sofascoreId ? `data-sofascore-id="${sofascoreId}"` : ''}
  ${escudoLocal ? `data-escudo-local="${escudoLocal}"` : ''}
  ${escudoVisitante ? `data-escudo-visitante="${escudoVisitante}"` : ''}
></div>`
}

function extractFromContent(content: string, attr: string): string {
  const match = content.match(new RegExp(`data-${attr}="([^"]*)"`, 'i'))
  return match ? match[1] : ''
}

export async function GET(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const res = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?maxResults=20&status=LIVE&status=DRAFT`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { titulo, liga, isDraft, ...postData } = body

  const fullTitle = liga ? `${liga}: ${titulo}` : titulo
  const content = buildPostContent(postData)

  const post = {
    kind: 'blogger#post',
    blog: { id: BLOG_ID },
    title: fullTitle,
    content,
    labels: liga ? [liga] : [],
  }

  const url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?isDraft=${isDraft ? 'true' : 'false'}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  })
  const data = await res.json()

  // Si tiene sofascoreId, registrar en Supabase para tracking automático
  if (res.ok && body.sofascoreId) {
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )


      await sb.from('marcadores').upsert({
        sofascore_id: body.sofascoreId,
        equipo_local: body.equipoLocal || '',
        equipo_visitante: body.equipoVisitante || '',
        liga: body.liga || '',
        gol_local: parseInt(body.golLocal) || 0,
        gol_visitante: parseInt(body.golVisitante) || 0,
        estado: body.estado || 'PRONTO',
        activo: body.estado !== 'FINALIZADO',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'sofascore_id' })

      // Devolver también el apifootball_id encontrado en la respuesta
          } catch (e) {
      console.error('Supabase register error:', e)
    }
  }

  return NextResponse.json(data, { status: res.ok ? 200 : 400 })
}

export async function PATCH(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { postId, updateScoreOnly, golLocal, golVisitante, estado } = body

  if (updateScoreOnly) {
    // Primero obtenemos el post actual para extraer sus datos
    const getRes = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const current = await getRes.json()
    if (current.error) return NextResponse.json({ error: current.error }, { status: 400 })

    // Extraer datos existentes del content y parchear solo marcador y estado
    const c = current.content || ''
    const newContent = buildPostContent({
      equipoLocal: extractFromContent(c, 'equipo-local'),
      equipoVisitante: extractFromContent(c, 'equipo-visitante'),
      golLocal,
      golVisitante,
      estado,
      imgVideo: extractFromContent(c, 'img-video'),
      link1: extractFromContent(c, 'link1'),
      link2: extractFromContent(c, 'link2'),
      link3: extractFromContent(c, 'link3'),
      canales: extractFromContent(c, 'canales'),
      horaUtc: extractFromContent(c, 'hora-utc'),
      sofascoreId: extractFromContent(c, 'sofascore-id'),
      escudoLocal: extractFromContent(c, 'escudo-local'),
      escudoVisitante: extractFromContent(c, 'escudo-visitante'),
    })

    const res = await fetch(
      `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent }),
      }
    )
    const data = await res.json()
    return NextResponse.json(data, { status: res.ok ? 200 : 400 })
  }

  // Edición completa
  const { titulo, liga, isDraft, ...postData } = body
  const fullTitle = liga ? `${liga}: ${titulo}` : titulo
  const content = buildPostContent(postData)

  const res = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: fullTitle, content }),
    }
  )
  const data = await res.json()
  return NextResponse.json(data, { status: res.ok ? 200 : 400 })
}

export async function DELETE(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { postId } = await req.json()
  const res = await fetch(
    `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
  )
  return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 400 })
}
