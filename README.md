# Ver Fútbol EN VIVO — Next.js + Supabase + Vercel

## Setup paso a paso

### 1. Supabase
1. Crear cuenta en https://supabase.com
2. Nuevo proyecto
3. Ir a SQL Editor y ejecutar el contenido de `supabase_schema.sql`
4. Copiar URL y keys desde Project Settings → API

### 2. Variables de entorno
Crear archivo `.env.local` en la raíz con:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=TU-SERVICE-ROLE-KEY
API_FOOTBALL_KEY=1b47a3e3aca7950a2acb160ea7f21482
ADMIN_SECRET=TU-PASSWORD-ADMIN
CRON_SECRET=TU-CRON-SECRET
```

### 3. Subir a GitHub
1. Crear repo nuevo en github.com
2. Subir todos los archivos (drag & drop o GitHub Desktop)

### 4. Deploy en Vercel
1. Ir a https://vercel.com → New Project
2. Importar el repo de GitHub
3. En Environment Variables agregar las mismas del .env.local
4. Deploy

### 5. Panel admin
Acceder a: `https://tu-sitio.vercel.app/admin/login`
Password: el que definiste en ADMIN_SECRET

### 6. Cron job (marcadores automáticos)
En vercel.json ya está configurado para correr cada 5 minutos.
Reemplazar `TU-CRON-SECRET` con el mismo valor de CRON_SECRET.

## Estructura
```
app/
  page.tsx              → Home con grid de partidos
  partido/[slug]/       → Post individual
  r/                    → Redirector (reemplaza blog 2)
  canales/              → Canales (oculto)
  admin/                → Panel de administración
  api/                  → API routes
components/
  public/               → Componentes del sitio público
  admin/                → Componentes del panel
lib/
  supabase.ts           → Cliente Supabase
  utils.ts              → Horarios, slugify, APIs
types/
  index.ts              → TypeScript types
```
