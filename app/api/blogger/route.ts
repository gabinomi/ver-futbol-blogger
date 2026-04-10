import { NextRequest, NextResponse } from 'next/server'

const BLOG_ID = '4582138764960172464'

async function getToken(req: NextRequest): Promise<string | null> {
  return req.cookies.get('blogger_access_token')?.value || null
}

function buildPostContent(data: any): string {
  const {
    equipoLocal, equipoVisitante, golLocal, golVisitante,
    estado, imgVideo, linkVideo, link1, link2, link3,
    canales, horaUtc, escudoLocal, escudoVisitante
  } = data

  return `<div class="match-data"
  data-equipo-local="${equipoLocal}"
  data-equipo-visitante="${equipoVisitante}"
  data-gol-local="${golLocal || 0}"
  data-gol-visitante="${golVisitante || 0}"
  data-img-video="${imgVideo || 'https://i.imgur.com/1CeQ09b.png'}"
  data-link-video="${linkVideo || ''}"
  data-link1="${link1 || ''}"
  data-link2="${link2 || ''}"
  data-link3="${link3 || ''}"
  data-canales="${canales || ''}"
  data-estado="${estado || 'PRONTO'}"
  data-hora-utc="${horaUtc || ''}"
  ${escudoLocal ? `data-escudo-local="${escudoLocal}"` : ''}
  ${escudoVisitante ? `data-escudo-visitante="${escudoVisitante}"` : ''}
></div>`
}

// GET — listar posts existentes
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

// POST — crear nuevo post
export async function POST(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { titulo, liga, isDraft, ...postData } = body

  const fullTitle = liga ? `${liga}: ${titulo}` : titulo
  const content = buildPostContent({ ...postData, equipoLocal: postData.equipoLocal, equipoVisitante: postData.equipoVisitante })

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
  return NextResponse.json(data, { status: res.ok ? 200 : 400 })
}

// PATCH — editar post existente
export async function PATCH(req: NextRequest) {
  const token = await getToken(req)
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const { postId, titulo, liga, isDraft, ...postData } = body

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

// DELETE — eliminar post
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
