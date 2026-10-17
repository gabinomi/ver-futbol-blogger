export const FLAGS: Record<string, string> = {
  AR:  'https://flagcdn.com/w40/ar.png',
  ES:  'https://flagcdn.com/w40/es.png',
  BR:  'https://flagcdn.com/w40/br.png',
  EN:  'https://flagcdn.com/w40/gb.png',
  IT:  'https://flagcdn.com/w40/it.png',
  DE:  'https://flagcdn.com/w40/de.png',
  FR:  'https://flagcdn.com/w40/fr.png',
  PT:  'https://flagcdn.com/w40/pt.png',
  COL: 'https://flagcdn.com/w40/co.png',
  CH:  'https://flagcdn.com/w40/cl.png',
  URU: 'https://flagcdn.com/w40/uy.png',
  PE:  'https://flagcdn.com/w40/pe.png',
  MEX: 'https://flagcdn.com/w40/mx.png',
  PY:  'https://flagcdn.com/w40/py.png',
  BOL: 'https://flagcdn.com/w40/bo.png',
  VEN: 'https://flagcdn.com/w40/ve.png',
  ECU: 'https://flagcdn.com/w40/ec.png',
  USA: 'https://flagcdn.com/w40/us.png',
  HOL: 'https://flagcdn.com/w40/nl.png',
  BEL: 'https://flagcdn.com/w40/be.png',
  TUR: 'https://flagcdn.com/w40/tr.png',
  LIB: 'https://a.espncdn.com/i/leaguelogos/soccer/500/58.png',
  SUD: 'https://a.espncdn.com/i/leaguelogos/soccer/500/1208.png',
  CONCACAF: 'https://a.espncdn.com/i/leaguelogos/soccer/500/32.png',
  FIFA: 'https://a.espncdn.com/i/leaguelogos/soccer/500/53.png',
  MUNDIAL: 'https://i.imgur.com/YYN77mq.png',
  CHA: 'https://a.espncdn.com/i/leaguelogos/soccer/500/2.png',
  UE:  'https://a.espncdn.com/i/leaguelogos/soccer/500/2310.png',
  F1:  'https://futbollibreenhd.net/flags/f1.png',
  F2:  'https://futbollibreenhd.net/flags/f2.png',
  NBA: 'https://a.espncdn.com/i/teamlogos/leagues/500/nba.png',
  FUT: 'https://static.futbolenlatv.com/img/32/20130618113222-futbol.png'
}

export const COUNTRY_DICT: Record<string, string> = {
  'escocia': 'scotland',
  'marruecos': 'morocco',
  'inglaterra': 'england',
  'francia': 'france',
  'alemania': 'germany',
  'italia': 'italy',
  'españa': 'spain',
  'brasil': 'brazil',
  'uruguay': 'uruguay',
  'colombia': 'colombia',
  'chile': 'chile',
  'peru': 'peru',
  'perú': 'peru',
  'ecuador': 'ecuador',
  'paraguay': 'paraguay',
  'venezuela': 'venezuela',
  'bolivia': 'bolivia',
  'mexico': 'mexico',
  'méxico': 'mexico',
  'estados unidos': 'usa',
  'ee. uu.': 'usa',
  'ee uu': 'usa',
  'canada': 'canada',
  'canadá': 'canada',
  'japon': 'japan',
  'japón': 'japan',
  'corea del sur': 'south korea',
  'australia': 'australia',
  'paises bajos': 'netherlands',
  'países bajos': 'netherlands',
  'holanda': 'netherlands',
  'portugal': 'portugal',
  'belgica': 'belgium',
  'bélgica': 'belgium',
  'suecia': 'sweden',
  'suiza': 'switzerland',
  'croacia': 'croatia',
  'dinamarca': 'denmark',
  'polonia': 'poland',
  'gales': 'wales',
  'ucrania': 'ukraine',
  'rusia': 'russia',
  'turquia': 'turkey',
  'turquía': 'turkey',
  'grecia': 'greece',
  'rumania': 'romania',
  'hungria': 'hungary',
  'hungría': 'hungary',
  'austria': 'austria',
  'serbia': 'serbia',
  'republica checa': 'czech republic',
  'república checa': 'czech republic',
  'eslovaquia': 'slovakia',
  'eslovenia': 'slovenia',
  'islandia': 'iceland',
  'irlanda': 'ireland',
  'irlanda del norte': 'northern ireland',
  'arabia saudita': 'saudi arabia',
  'iran': 'iran',
  'irán': 'iran',
  'mali': 'mali',
  'senegal': 'senegal',
  'camerun': 'cameroon',
  'camerún': 'cameroon',
  'nigeria': 'nigeria',
  'ghana': 'ghana',
  'costa de marfil': 'ivory coast',
  'egipto': 'egypt',
  'argelia': 'algeria',
  'tunez': 'tunisia',
  'túnez': 'tunisia',
  'sudafrica': 'south africa',
  'sudáfrica': 'south africa',
  'nueva zelanda': 'new zealand',
  'jamaica': 'jamaica',
  'costa rica': 'costa rica',
  'panama': 'panama',
  'panamá': 'panama',
  'honduras': 'honduras',
  'el salvador': 'el salvador',
  'guatemala': 'guatemala',
  'qatar': 'qatar',
  'china': 'china',
  'india': 'india',
  'indonesia': 'indonesia',
  'malasia': 'malaysia',
  'tailandia': 'thailand',
  'vietnam': 'vietnam',
  'filipinas': 'philippines',
  'siria': 'syria',
  'irak': 'iraq',
  'emiratos arabes unidos': 'uae',
  'oman': 'oman',
  'omán': 'oman',
  'bahrein': 'bahrain',
  'jordania': 'jordan',
  'libano': 'lebanon',
  'líbano': 'lebanon',
  'palestina': 'palestine',
  'koweit': 'kuwait',
  'georgia': 'georgia',
  'armenia': 'armenia',
  'azerbaiyan': 'azerbaijan',
  'kazajistan': 'kazakhstan',
  'uzbekistan': 'uzbekistan',
  'nueva caledonia': 'new caledonia',
  'tahiti': 'tahiti',
  'tahití': 'tahiti',
  'fiyi': 'fiji',
  'islas salomon': 'solomon islands'
}

export function traducirEquipos(titulo: string): string {
  let lower = titulo.toLowerCase()
  for (const [es, en] of Object.entries(COUNTRY_DICT)) {
    // Usamos reemplazo global para cada coincidencia del nombre del país
    lower = lower.split(es).join(en)
  }
  return lower
}

function inc(t: string, words: string[]): boolean {
  return words.some(w => t.includes(w))
}

export function classificarCategoriaFútbol(cat: string): boolean {
  const c = (cat || '').toLowerCase()
  return c.includes('f') && (c.includes('tbol') || c.includes('tbol'))
}

export function esFutbolReal(t: string): boolean {
  const c = (t || '').toLowerCase()
  return inc(c, ['liga profesional','copa argentina','primera nacional','laliga','la liga','liga 2:','hypermotion','copa del rey','supercopa','brasileirao','brasileirão','premier league','fa cup','serie a','coppa italia','bundesliga','dfb','ligue 1','liga portugal','liga betplay','liga mx','primera division','copa de primera','liga 1:','copa libertadores','copa sudamericana','champions league','europa league','conference league','copa del mundo','mundial','eliminatorias','concacaf','gold cup','copa america','nations league','futbol','fútbol', 'amistoso', 'amistosos', 'international friendly'])
}

export function parsearTitulo(titulo: string) {
  const idx = titulo.indexOf(':')
  if (idx !== -1) {
    return {
      liga: titulo.substring(0, idx).trim(),
      partido: titulo.substring(idx + 1).trim()
    }
  }
  return { liga: '', partido: titulo }
}

export function detectarBandera(titulo: string): string {
  const t = (titulo || '').toLowerCase()
  const { liga } = parsearTitulo(t)
  const context = liga ? liga : t // Usamos la liga para matchear torneos, o todo el titulo si no hay separador
  
  // 1. PRIORIDAD: MATCH POR LIGA / CAMPEONATO
  if (inc(context, ['nba'])) return FLAGS.NBA;
  if (inc(context, ['formula 1', 'f1'])) return FLAGS.F1;
  if (inc(context, ['formula 2', 'f2'])) return FLAGS.F2;
  
  // Torneos Internacionales
  if (inc(context, ['copa libertadores'])) return FLAGS.LIB;
  if (inc(context, ['copa sudamericana', 'recopa sudamericana'])) return FLAGS.SUD;
  if (inc(context, ['concacaf', 'gold cup', 'liga de naciones concacaf'])) return FLAGS.CONCACAF;
  
  // FIFA Oficial vs Amistosos
  if (inc(context, ['fifa', 'copa del mundo', 'mundial', 'eliminatorias'])) return FLAGS.MUNDIAL;
  if (inc(context, ['amistoso', 'amistosos', 'fecha fifa', 'international friendly'])) return FLAGS.FIFA;
  if (inc(context, ['champions league', 'uefa champions'])) return FLAGS.CHA;
  if (inc(context, ['europa league', 'conference league'])) return FLAGS.UE;
  
  // Ligas específicas (priorizando las solicitadas)
  if (inc(context, ['serie a', 'coppa italia'])) return FLAGS.IT;
  if (inc(context, ['ligue 1', 'ligue1'])) return FLAGS.FR;
  if (inc(context, ['liga betplay', 'copa colombia', 'copa de colombia'])) return FLAGS.COL;
  
  // Conflicto de Copa de la Liga: Chile vs Argentina
  // Si explícitamente dice 'copa de la liga: c' -> Chile. Si dice 'copa de la liga' -> Argentina
  if (inc(context, ['copa de la liga: c', 'primera division: c', 'primera division: o'])) return FLAGS.CH;
  if (inc(context, ['copa de la liga'])) return FLAGS.AR;
  if (inc(context, ['liga profesional', 'copa argentina', 'primera nacional', 'nacional b', 'b metropolitana', 'federal a'])) return FLAGS.AR;
  if (inc(context, ['brasileirao', 'brasileirão'])) return FLAGS.BR;
  if (inc(context, ['copa de primera'])) return FLAGS.PY;
  
  // Validar 'liga 1' sin coincidir con 'laliga'
  if (context.includes('liga 1') && !context.includes('laliga')) return FLAGS.PE;
  
  if (inc(context, ['mls', 'usa soccer', 'usmnt'])) return FLAGS.USA;
  if (inc(context, ['laliga', 'la liga', 'liga 2', 'hypermotion', 'copa del rey', 'supercopa espa'])) return FLAGS.ES;
  if (inc(context, ['premier league', 'fa cup'])) return FLAGS.EN;
  if (inc(context, ['bundesliga', 'dfb pokal'])) return FLAGS.DE;
  if (inc(context, ['liga portugal', 'primeira liga'])) return FLAGS.PT;
  if (inc(context, ['liga mx', 'liga mex'])) return FLAGS.MEX;
  if (inc(context, ['primera division: nacional', 'primera division: pe'])) return FLAGS.URU;
  if (inc(context, ['liga pro ecuador', 'liga betecuador'])) return FLAGS.ECU;
  if (inc(context, ['eredivisie'])) return FLAGS.HOL;
  if (inc(context, ['jupiler'])) return FLAGS.BEL;
  if (inc(context, ['super lig'])) return FLAGS.TUR;
  
  // 2. FALLBACK: MATCH POR EQUIPOS O EN EL TITULO COMPLETO
  if (inc(t,['defensa y justicia','chaco for ever','san lorenzo','estudiantes lp','banfield','talleres','atletico tucuman','lanus','platense','tigre','instituto','velez','independiente','huracan','river plate','boca juniors','san martin'])) return FLAGS.AR;
  if (inc(t,['atletico madrid','real madrid','barcelona','sevilla','valencia fc','villarreal','athletic bilbao','real betis','osasuna','celta','getafe','girona','mallorca','racing santander','sporting gij'])) return FLAGS.ES;
  if (inc(t,['botafogo','fluminense','corinthians','palmeiras','flamengo','gremio','bahia','cruzeiro','atletico mineiro','vasco da gama','coritiba','mirassol','vitoria','athletico-pr','sao paulo','atletico go'])) return FLAGS.BR;
  if (inc(t,['atletico nacional','santa fe','deportivo pasto','cucuta','llaneros','rionegro','tolima','junior fc','deportivo cali','fortaleza ceif','inter bogota','millonarios','america de cali'])) return FLAGS.COL;
  if (inc(t,['colo-colo','huachipato','everton de','deportes limache','u de chile','o higgins','audax italiano','cobresal','coquimbo'])) return FLAGS.CH;
  if (inc(t,['olimpia','guarani','rubio nu','trinidense','libertad','cerro porteno'])) return FLAGS.PY;
  if (inc(t,['central espanol','defensor sp','danubio','nacional vs','penarol'])) return FLAGS.URU;
  if (inc(t,['alianza lima','universitario','sporting cristal','cienciano','sport huancayo','adt '])) return FLAGS.PE;
  if (inc(t,['puebla fc','juarez','tijuana','tigres uanl','chivas','america fc','cruz azul','pumas','monterrey','tudn','necaxa','mazatlan','atlas','leon fc','toluca','santos laguna','pachuca'])) return FLAGS.MEX;
  if (inc(t,['arsenal','chelsea','manchester','liverpool','tottenham','west ham','newcastle','brighton'])) return FLAGS.EN;
  if (inc(t,['juventus','ac milan','inter milan','as roma','napoli','lazio','fiorentina','atalanta'])) return FLAGS.IT;
  if (inc(t,['bayern','dortmund','leverkusen','leipzig'])) return FLAGS.DE;
  if (inc(t,['paris saint','olympique','as monaco'])) return FLAGS.FR;
  if (inc(t,['benfica','sporting cp','fc porto'])) return FLAGS.PT;
  if (inc(t,['barcelona sc','emelec','liga de quito','independiente del valle'])) return FLAGS.ECU;
  if (inc(t,['ajax','psv','feyenoord','az alkmaar'])) return FLAGS.HOL;
  if (inc(t,['anderlecht','club brugge','gent'])) return FLAGS.BEL;
  if (inc(t,['galatasaray','fenerbahce','besiktas'])) return FLAGS.TUR;
  
  return FLAGS.FUT;
}

export function utcToArg(timeStr: string): string {
  const parts = timeStr.split(':')
  let h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  h = h + 2
  if (h >= 24) h -= 24
  
  const hd = h < 10 ? `0${h}` : `${h}`
  const md = m < 10 ? `0${m}` : `${m}`
  return `${hd}:${md}`
}
