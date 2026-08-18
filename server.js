import { createServer } from 'node:http';
import { stat, createReadStream } from 'node:fs';
import { join, resolve, sep, extname } from 'node:path';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 3000);
const INSTANCE_ID = process.env.INSTANCE_ID || process.env.HOSTNAME || 'local-app';
const PUBLIC_DIR = join(__dirname, 'public');
const SITE_NAME = 'LADO B';
const AI_NOTICE = 'Contenido generado con ChatGPT y revisado por el equipo del proyecto.';

const news = [
  {
    slug: 'la-computacion-local-cambia-el-pulso-del-campus',
    title: 'La computación local cambia el pulso del campus',
    dek: 'Nuevas herramientas acercan modelos de IA a los laboratorios sin depender siempre de la nube.',
    category: 'Tecnología',
    publishedAt: '2026-08-14',
    image: '/images/tecnologia.svg',
    imageAlt: 'Ilustración abstracta de un circuito azul y naranja',
    aiTool: AI_NOTICE,
    readTime: '4 min de lectura',
    content: [
      'En los laboratorios universitarios, la conversación sobre inteligencia artificial dejó de centrarse únicamente en la potencia de los grandes centros de datos. Una nueva generación de equipos con aceleradores integrados permite ejecutar modelos más pequeños directamente en el dispositivo.',
      'El cambio tiene una consecuencia práctica: los equipos pueden experimentar con datos de clase, prototipos y automatizaciones sin enviar cada consulta a un servicio externo. Eso reduce la latencia y abre una discusión importante sobre privacidad, costos y sostenibilidad.',
      'La computación local no sustituye a la nube. La complementa. Para un proyecto académico, la decisión depende del tamaño del modelo, la sensibilidad de la información y la capacidad de mantenimiento del equipo. El criterio central sigue siendo diseñar con intención, no usar IA por inercia.'
    ]
  },
  {
    slug: 'el-mapa-invisible-de-los-microplasticos-urbanos',
    title: 'El mapa invisible de los microplásticos urbanos',
    dek: 'Sensores de bajo costo y ciencia ciudadana ayudan a identificar cómo se mueve el residuo en la ciudad.',
    category: 'Ciencia',
    publishedAt: '2026-08-12',
    image: '/images/ciencia.svg',
    imageAlt: 'Ilustración de partículas y una lupa sobre un mapa',
    aiTool: AI_NOTICE,
    readTime: '5 min de lectura',
    content: [
      'El estudio de los microplásticos ya no ocurre solamente en costas y océanos. En distintos barrios, grupos universitarios están probando filtros y protocolos de muestreo para observar cómo las partículas llegan al agua de lluvia y a los canales de drenaje.',
      'La herramienta más valiosa no es un sensor aislado, sino la posibilidad de comparar mediciones tomadas con el mismo método. Con mapas abiertos y bitácoras compartidas, los estudiantes pueden encontrar patrones y formular nuevas preguntas para los laboratorios.',
      'Los primeros resultados deben leerse con cautela: detectar una partícula no equivale a medir un riesgo para la salud. La comunicación clara sobre límites, márgenes de error y revisión científica es tan importante como el dato mismo.'
    ]
  },
  {
    slug: 'cuando-la-ciudad-se-vuelve-un-lienzo-sonoro',
    title: 'Cuando la ciudad se vuelve un lienzo sonoro',
    dek: 'Artistas y colectivos están convirtiendo los paisajes cotidianos en archivos vivos de memoria urbana.',
    category: 'Cultura',
    publishedAt: '2026-08-09',
    image: '/images/cultura.svg',
    imageAlt: 'Ilustración de ondas sonoras sobre una escena urbana',
    aiTool: AI_NOTICE,
    readTime: '3 min de lectura',
    content: [
      'Una avenida tiene más de una historia. El sonido de un mercado al abrir, una cancha que se llena por la tarde o el silencio de una biblioteca forman una memoria que rara vez aparece en los archivos oficiales.',
      'Los proyectos de cartografía sonora están llevando grabadoras y entrevistas breves a espacios públicos. Después, las piezas se organizan en mapas digitales donde cada punto abre una escena, una voz o una pregunta sobre la manera en que habitamos el territorio.',
      'El reto no es coleccionar sonidos sin contexto. Es devolverlos a la comunidad con consentimiento, créditos y una lectura que respete a quienes prestaron su voz. En esa tensión, el arte documental encuentra su potencia.'
    ]
  },
  {
    slug: 'la-energia-del-sol-entra-en-la-agenda-del-barrio',
    title: 'La energía del sol entra en la agenda del barrio',
    dek: 'Cooperativas locales exploran modelos de generación compartida para reducir costos y aprender juntas.',
    category: 'Ambiente',
    publishedAt: '2026-08-06',
    image: '/images/ambiente.svg',
    imageAlt: 'Ilustración de un sol sobre paneles y hojas verdes',
    aiTool: AI_NOTICE,
    readTime: '4 min de lectura',
    content: [
      'La conversación sobre paneles solares está pasando de la compra individual a la organización colectiva. En algunos barrios, vecinos y comercios están calculando qué espacios tienen mejor exposición y cómo compartir la energía producida.',
      'Antes de instalar un solo panel, los grupos deben resolver preguntas menos visibles: quién administra el fondo común, cómo se reparte el mantenimiento y qué sucede cuando una familia deja de participar. El componente social pesa tanto como el técnico.',
      'Para las universidades, estos pilotos representan un aula abierta. Permiten que estudiantes de ingeniería, economía y comunicación trabajen sobre un mismo problema y documenten decisiones que otras comunidades puedan adaptar.'
    ]
  },
  {
    slug: 'los-videojuegos-tambien-se-ensayan-con-lapiz',
    title: 'Los videojuegos también se ensayan con lápiz',
    dek: 'El prototipado en papel vuelve a las aulas para probar reglas antes de escribir una línea de código.',
    category: 'Videojuegos',
    publishedAt: '2026-08-03',
    image: '/images/videojuegos.svg',
    imageAlt: 'Ilustración de un control, píxeles y una libreta',
    aiTool: AI_NOTICE,
    readTime: '3 min de lectura',
    content: [
      'En un taller de diseño de juegos, las pantallas permanecen apagadas durante la primera sesión. El grupo trabaja con fichas, dados y hojas cuadriculadas para probar el ritmo, las reglas y las decisiones que debería provocar una experiencia interactiva.',
      'La técnica parece sencilla, pero hace visible lo que un prototipo digital puede esconder: una regla confusa, una espera demasiado larga o una recompensa que no tiene sentido. Corregir en papel cuesta minutos y no horas de programación.',
      'El resultado no busca reemplazar la tecnología. Busca darle una dirección. Cuando el equipo llega al motor de juego con una idea probada, puede dedicar más tiempo a la expresión visual, el sonido y la accesibilidad.'
    ]
  },
  {
    slug: 'la-universidad-que-aprende-a-escuchar-sus-datos',
    title: 'La universidad que aprende a escuchar sus datos',
    dek: 'Un tablero abierto reúne señales de movilidad, bienestar y uso de espacios sin convertir a las personas en números.',
    category: 'Comunidad',
    publishedAt: '2026-07-30',
    image: '/images/comunidad.svg',
    imageAlt: 'Ilustración de personas conectadas alrededor de un tablero',
    aiTool: AI_NOTICE,
    readTime: '6 min de lectura',
    content: [
      'Un tablero institucional puede contar mucho sobre un campus: qué rutas se congestionan, qué salas permanecen vacías o en qué momentos se solicita más acompañamiento. Pero un dato útil empieza por una pregunta legítima y un acuerdo claro sobre su uso.',
      'El equipo detrás del proyecto decidió publicar únicamente tendencias agregadas. No hay nombres ni trayectorias individuales. Además, cada visualización explica de dónde viene la señal, qué periodo cubre y qué no puede concluirse a partir de ella.',
      'La apuesta es convertir la analítica en una herramienta de conversación. Si una gráfica no ayuda a tomar una decisión o a formular una mejor pregunta, pierde su propósito. La transparencia es parte del producto, no una nota al pie.'
    ]
  }
];

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  return new Intl.DateTimeFormat('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${value}T00:00:00Z`));
}

function normalize(value) {
  return String(value || '').trim().toLocaleLowerCase('es');
}

function findNews(slug) {
  return news.find((item) => item.slug === slug);
}

function makeQueryUrl(category = '', query = '') {
  const params = new URLSearchParams();
  if (category) params.set('categoria', category);
  if (query) params.set('q', query);
  const queryString = params.toString();
  return queryString ? `/?${queryString}` : '/';
}

function renderNewsCard(item, featured = false) {
  return `
    <article class="news-card${featured ? ' news-card--featured' : ''}">
      <a class="news-card__image-link" href="/noticias/${escapeHtml(item.slug)}" aria-label="Leer: ${escapeHtml(item.title)}">
        <img class="news-card__image" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="1200" height="720" ${featured ? 'fetchpriority="high"' : 'loading="lazy"'}>
      </a>
      <div class="news-card__body">
        <div class="eyebrow"><span>${escapeHtml(item.category)}</span><span aria-hidden="true">·</span><span>${escapeHtml(item.readTime)}</span></div>
        <h2 class="news-card__title"><a href="/noticias/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></h2>
        <p class="news-card__dek">${escapeHtml(item.dek)}</p>
        <div class="news-card__footer">
          <time datetime="${escapeHtml(item.publishedAt)}">${escapeHtml(formatDate(item.publishedAt))}</time>
          <a class="text-link" href="/noticias/${escapeHtml(item.slug)}">Abrir noticia <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>`;
}

function renderHeader(currentPath) {
  const homeActive = currentPath === '/' ? ' aria-current="page"' : '';
  const newsActive = currentPath.startsWith('/noticias') ? ' aria-current="page"' : '';
  return `
    <header class="site-header">
      <div class="shell site-header__inner">
        <a class="wordmark" href="/" aria-label="${SITE_NAME}, volver al inicio">
          <span class="wordmark__mark" aria-hidden="true">LB</span>
          <span><strong>${SITE_NAME}</strong><small>actualidad asistida</small></span>
        </a>
        <nav class="main-nav" aria-label="Navegación principal">
          <a href="/"${homeActive}>Portada</a>
          <a href="/noticias"${newsActive}>Noticias</a>
          <a href="/#metodo">Nuestro método</a>
        </nav>
        <div class="instance-chip" title="Identificador de la instancia que respondió">
          <span class="status-dot" aria-hidden="true"></span>
          <span>Instancia <strong>${escapeHtml(INSTANCE_ID)}</strong></span>
        </div>
      </div>
    </header>`;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="shell site-footer__grid">
        <div>
          <a class="wordmark wordmark--footer" href="/" aria-label="${SITE_NAME}, volver al inicio">
            <span class="wordmark__mark" aria-hidden="true">LB</span>
            <span><strong>${SITE_NAME}</strong><small>actualidad asistida</small></span>
          </a>
          <p class="footer-note">Un laboratorio editorial para aprender a contar el presente con criterio, contexto y herramientas de IA.</p>
        </div>
        <div>
          <p class="footer-label">Proyecto académico</p>
          <p class="footer-note">Las noticias son piezas de práctica generadas o asistidas por inteligencia artificial. No representan información periodística verificada.</p>
        </div>
        <div>
          <p class="footer-label">Respuesta distribuida</p>
          <p class="footer-note">NGINX · Round Robin<br><span class="mono">X-App-Instance: ${escapeHtml(INSTANCE_ID)}</span></p>
        </div>
      </div>
      <div class="shell site-footer__bottom">
        <span>© <span data-year>2026</span> LADO B</span>
        <span>Hecho para aprender, revisar y volver a preguntar.</span>
      </div>
    </footer>`;
}

function renderLayout({ title, description, body, currentPath = '/' }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#f4efe6">
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Newsreader:opsz,wght@6..72,500;6..72,600;6..72,700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/app.css">
    <title>${escapeHtml(title)} · ${SITE_NAME}</title>
  </head>
  <body>
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    ${renderHeader(currentPath)}
    <main id="contenido">${body}</main>
    ${renderFooter()}
    <script src="/assets/app.js" defer></script>
  </body>
</html>`;
}

function renderHome({ category = '', query = '' } = {}) {
  const normalizedCategory = normalize(category);
  const normalizedQuery = normalize(query);
  const filtered = news.filter((item) => {
    const matchesCategory = !normalizedCategory || normalize(item.category) === normalizedCategory;
    const searchable = normalize(`${item.title} ${item.dek} ${item.category}`);
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
  const categories = [...new Set(news.map((item) => item.category))];
  const hasFilters = Boolean(category || query);
  const title = hasFilters ? 'Resultados de la portada' : 'Historias para mirar dos veces';
  const resultLabel = filtered.length === 1 ? '1 historia encontrada' : `${filtered.length} historias encontradas`;

  const categoryLinks = [
    `<a class="filter-pill${!category ? ' is-active' : ''}" href="${makeQueryUrl('', query)}"${!category ? ' aria-current="page"' : ''}>Todas</a>`,
    ...categories.map((item) => `<a class="filter-pill${normalize(item) === normalizedCategory ? ' is-active' : ''}" href="${makeQueryUrl(item, query)}"${normalize(item) === normalizedCategory ? ' aria-current="page"' : ''}>${escapeHtml(item)}</a>`)
  ].join('');

  let storiesMarkup;
  if (filtered.length === 0) {
    storiesMarkup = `<div class="empty-state"><span class="empty-state__number">00</span><h2>No encontramos esa combinación.</h2><p>Prueba con otro término o vuelve a ver todas las historias.</p><a class="button button-primary" href="/">Limpiar búsqueda</a></div>`;
  } else {
    const [featured, ...rest] = filtered;
    storiesMarkup = `<div class="feature-grid">${renderNewsCard(featured, true)}<div class="feature-grid__aside"><p class="section-kicker">En esta edición</p><p class="feature-grid__aside-copy">Seis miradas breves sobre tecnología, comunidad, cultura y el mundo que estamos construyendo.</p><div class="rule"></div><p class="feature-grid__aside-meta">${escapeHtml(resultLabel)}<br>Actualizado el <time datetime="2026-08-17">17 de agosto de 2026</time></p></div></div>${rest.length ? `<div class="news-grid">${rest.map((item) => renderNewsCard(item)).join('')}</div>` : ''}`;
  }

  const body = `
    <section class="hero shell">
      <div class="hero__issue"><span class="issue-line"></span><span>Edición 01 · Agosto 2026</span><span class="issue-line"></span></div>
      <div class="hero__content">
        <p class="kicker">Un portal de noticias de laboratorio</p>
        <h1>El presente<br><em>no viene</em> en línea recta.</h1>
        <p class="hero__intro">Historias, señales y preguntas para entender lo que se mueve alrededor. Texto generado o asistido por IA, revisado con mirada humana.</p>
      </div>
      <div class="hero__stamp" aria-hidden="true"><span>IA</span><span>+ criterio</span><span>+ contexto</span></div>
    </section>

    <section class="shell editorial-notice" aria-label="Aviso académico">
      <div class="editorial-notice__icon" aria-hidden="true">!</div>
      <div><strong>Proyecto académico · lectura crítica activada</strong><p>Estas piezas no son información periodística verificada. Revisa fuentes, posibles sesgos y afirmaciones antes de reutilizarlas.</p></div>
      <a class="text-link" href="/#metodo">Conoce el método <span aria-hidden="true">↓</span></a>
    </section>

    <section class="shell stories-section" aria-labelledby="stories-heading">
      <div class="section-heading">
        <div><p class="kicker">La selección</p><h2 id="stories-heading">Historias destacadas</h2></div>
        <p class="section-heading__count">${escapeHtml(resultLabel)}</p>
      </div>
      <div class="toolbar">
        <nav class="filters" aria-label="Filtrar noticias por categoría">${categoryLinks}</nav>
        <form class="search-form" action="/" method="get">
          <label class="sr-only" for="search">Buscar noticias</label>
          <input id="search" name="q" type="search" value="${escapeHtml(query)}" placeholder="Buscar por titular…" autocomplete="off">
          <button class="search-button" type="submit" aria-label="Buscar noticias"><span aria-hidden="true">⌕</span></button>
        </form>
      </div>
      ${storiesMarkup}
    </section>

    <section class="method-section" id="metodo" aria-labelledby="method-heading">
      <div class="shell method-section__grid">
        <div><p class="kicker">Detrás de la portada</p><h2 id="method-heading">La IA acelera.<br><em>El criterio decide.</em></h2></div>
        <div class="method-copy"><p>Este portal simula una redacción experimental: cada texto nace de un prompt, pasa por una revisión humana y conserva la atribución de la herramienta utilizada.</p><p>La interfaz también deja una pista técnica visible. El identificador de instancia en la esquina superior y en la respuesta HTTP permite comprobar el balanceo de NGINX.</p><a class="button button-dark" href="/api/noticias">Ver datos en JSON <span aria-hidden="true">↗</span></a></div>
      </div>
    </section>`;

  return renderLayout({
    title: title,
    description: 'Portal académico de noticias asistidas por inteligencia artificial.',
    body,
    currentPath: '/'
  });
}

function renderArticle(item) {
  const body = `
    <article class="article-page shell">
      <a class="back-link" href="/">← Volver a la portada</a>
      <div class="article-page__header">
        <div class="eyebrow"><span>${escapeHtml(item.category)}</span><span aria-hidden="true">·</span><span>${escapeHtml(item.readTime)}</span></div>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="article-page__dek">${escapeHtml(item.dek)}</p>
        <div class="article-page__meta">
          <time datetime="${escapeHtml(item.publishedAt)}">Publicado el ${escapeHtml(formatDate(item.publishedAt))}</time>
          <span class="meta-divider" aria-hidden="true"></span>
          <span>Proyecto LADO B</span>
        </div>
      </div>
      <figure class="article-hero">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.imageAlt)}" width="1200" height="720" fetchpriority="high">
        <figcaption>Ilustración editorial original · ${escapeHtml(item.category)}</figcaption>
      </figure>
      <div class="article-layout">
        <aside class="article-aside">
          <p class="footer-label">Ficha editorial</p>
          <dl>
            <div><dt>Herramienta</dt><dd>ChatGPT</dd></div>
            <div><dt>Revisión</dt><dd>Equipo del proyecto</dd></div>
            <div><dt>Estado</dt><dd>Ejercicio académico</dd></div>
          </dl>
          <button class="button button-secondary" type="button" data-share aria-describedby="share-status">Compartir</button>
          <span class="sr-only" id="share-status" aria-live="polite"></span>
        </aside>
        <div class="article-copy">
          <p class="article-lead">${escapeHtml(item.dek)}</p>
          ${item.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
          <div class="ai-credit"><span class="ai-credit__mark" aria-hidden="true">✦</span><div><strong>Fuente del texto</strong><p>${escapeHtml(item.aiTool)}</p></div></div>
          <p class="article-disclaimer"><strong>Nota de responsabilidad.</strong> Este contenido fue creado para fines académicos. Las afirmaciones son plausibles, pero no deben presentarse como hechos verificados sin consultar fuentes primarias y especializadas.</p>
        </div>
      </div>
    </article>`;

  return renderLayout({
    title: item.title,
    description: item.dek,
    body,
    currentPath: `/noticias/${item.slug}`
  });
}

function renderNotFound() {
  return renderLayout({
    title: 'Página no encontrada',
    description: 'La página que buscas no existe.',
    body: `<section class="shell not-found"><span class="empty-state__number">404</span><h1>Esta historia todavía no existe.</h1><p>Vuelve a la portada para explorar la edición disponible.</p><a class="button button-primary" href="/">Ir a la portada</a></section>`
  });
}

function setCommonHeaders(response) {
  response.setHeader('X-App-Instance', INSTANCE_ID);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'self'");
}

function sendHtml(response, statusCode, html) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  if (response.req?.method !== 'HEAD') response.end(html);
  else response.end();
}

function sendJson(response, statusCode, data) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(data, null, 2));
}

function serveStatic(response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: 'Ruta inválida' });
    return true;
  }

  const candidate = resolve(PUBLIC_DIR, `.${decodedPath}`);
  if (!candidate.startsWith(`${PUBLIC_DIR}${sep}`)) {
    sendJson(response, 403, { error: 'Acceso denegado' });
    return true;
  }

  const contentTypes = {
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };
  const extension = extname(candidate).toLowerCase();

  stat(candidate, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJson(response, 404, { error: 'Recurso no encontrado' });
      return;
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', contentTypes[extension] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'public, max-age=3600');
    if (response.req?.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(candidate).pipe(response);
  });
  return true;
}

const server = createServer((request, response) => {
  setCommonHeaders(response);
  response.req = request;

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    sendJson(response, 405, { error: 'Método no permitido' });
    return;
  }

  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const { pathname } = requestUrl;
  const startedAt = Date.now();

  response.on('finish', () => {
    process.stdout.write(JSON.stringify({
      event: 'request',
      method: request.method,
      path: pathname,
      status: response.statusCode,
      instance: INSTANCE_ID,
      durationMs: Date.now() - startedAt
    }) + '\n');
  });

  if (pathname === '/health') {
    sendJson(response, 200, { status: 'ok', instance: INSTANCE_ID, service: 'portal-latido-ia' });
    return;
  }

  if (pathname === '/api/noticias' || pathname === '/api/noticias/') {
    sendJson(response, 200, {
      count: news.length,
      generatedWith: 'ChatGPT',
      academicNotice: true,
      instance: INSTANCE_ID,
      items: news.map(({ content, ...item }) => ({ ...item, url: `/noticias/${item.slug}` }))
    });
    return;
  }

  if (pathname.startsWith('/api/noticias/')) {
    const item = findNews(pathname.slice('/api/noticias/'.length));
    if (!item) {
      sendJson(response, 404, { error: 'Noticia no encontrada', instance: INSTANCE_ID });
      return;
    }
    sendJson(response, 200, { ...item, url: `/noticias/${item.slug}`, instance: INSTANCE_ID });
    return;
  }

  if (pathname.startsWith('/assets/') || pathname.startsWith('/images/')) {
    serveStatic(response, pathname);
    return;
  }

  if (pathname === '/' || pathname === '/noticias' || pathname === '/noticias/') {
    sendHtml(response, 200, renderHome({
      category: requestUrl.searchParams.get('categoria') || '',
      query: requestUrl.searchParams.get('q') || ''
    }));
    return;
  }

  if (pathname.startsWith('/noticias/')) {
    const item = findNews(pathname.slice('/noticias/'.length));
    if (!item) {
      sendHtml(response, 404, renderNotFound());
      return;
    }
    sendHtml(response, 200, renderArticle(item));
    return;
  }

  sendHtml(response, 404, renderNotFound());
});

server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`LADO B escuchando en http://0.0.0.0:${PORT} · instancia ${INSTANCE_ID}\n`);
});

function shutdown(signal) {
  process.stdout.write(`${signal}: cerrando instancia ${INSTANCE_ID}\n`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
