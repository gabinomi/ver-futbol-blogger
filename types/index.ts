export type Estado = 'PROXIMO' | 'EN-VIVO' | 'FINALIZADO'

export interface Partido {
  id: string
  slug: string
  equipo_local: string
  equipo_visitante: string
  gol_local: number
  gol_visitante: number
  estado: Estado
  hora_utc: string | null
  canales: string | null
  link_video: string | null
  link1: string | null
  link2: string | null
  link3: string | null
  img_video: string | null
  img_og: string | null
  escudo_local: string | null
  escudo_visitante: string | null
  fixture_id: number | null
  creado_en: string
}

export interface ZonaHoraria {
  pais: string
  tz: string
}

export const ZONAS: ZonaHoraria[] = [
  { pais: 'MÉXICO',          tz: 'America/Mexico_City'            },
  { pais: 'COL / ECU / PER', tz: 'America/Bogota'                 },
  { pais: 'BOL / VEN',       tz: 'America/Caracas'                },
  { pais: 'ARG / URU',       tz: 'America/Argentina/Buenos_Aires' },
  { pais: 'PARAGUAY',        tz: 'America/Asuncion'               },
  { pais: 'BRASIL',          tz: 'America/Sao_Paulo'              },
  { pais: 'ESPAÑA',          tz: 'Europe/Madrid'                  },
]
