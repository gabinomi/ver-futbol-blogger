-- Ejecutar en Supabase SQL Editor

create table partidos (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  equipo_local text not null,
  equipo_visitante text not null,
  gol_local int default 0,
  gol_visitante int default 0,
  estado text default 'PROXIMO' check (estado in ('PROXIMO','EN-VIVO','FINALIZADO')),
  hora_utc timestamptz,
  canales text,
  link_video text,
  link1 text,
  link2 text,
  link3 text,
  img_video text,
  img_og text,
  escudo_local text,
  escudo_visitante text,
  fixture_id int,
  creado_en timestamptz default now()
);

-- Índices
create index on partidos(estado);
create index on partidos(creado_en desc);

-- RLS: solo lectura pública
alter table partidos enable row level security;
create policy "Lectura pública" on partidos for select using (true);
create policy "Admin full access" on partidos using (auth.role() = 'service_role');
