# Bitácora de prompts · Proyecto LADO B

> Registro académico de las instrucciones utilizadas para diseñar, construir, revisar y documentar el portal. Las solicitudes de cambio se agregan al final en orden cronológico para conservar la trazabilidad del proyecto.

## Índice

1. [Solicitud inicial del portal](#1-solicitud-inicial-del-portal)
2. [Navegación hacia Historias destacadas](#2-navegación-hacia-historias-destacadas)
3. [Identidad visual por instancia](#3-identidad-visual-por-instancia)
4. [Transparencia sobre imágenes y herramientas](#4-transparencia-sobre-imágenes-y-herramientas)
5. [Explicación de la red interna](#5-explicación-de-la-red-interna)
6. [Prompts editoriales de las noticias](#6-prompts-editoriales-de-las-noticias)
7. [Criterios de revisión](#7-criterios-de-revisión)
8. [Regla para continuar la bitácora](#8-regla-para-continuar-la-bitácora)

---

## 1. Solicitud inicial del portal

### Prompt del estudiante

> Usando como referencia el video `https://www.youtube.com/watch?v=o7DSHPji1m0` y la rúbrica proporcionada, desarrolla de la mejor forma posible un portal de noticias con IA. Debe incluir mínimo seis noticias, páginas de listado y detalle, atribución visible de la herramienta de IA, advertencia académica, diseño responsive, Dockerfile, Docker Compose, dos instancias funcionales, NGINX como único punto de entrada, enrutamiento, balanceo Round Robin, prueba de failover, README, prompts conservados, evidencias en PDF y guion para el video demostrativo. Usa buenas prácticas, prueba la solución y utiliza las skills de diseño web, accesibilidad y Playwright cuando sean pertinentes.

### Respuesta aplicada

- Se creó el portal **LADO B** con Node.js 22 y HTML/CSS/JavaScript.
- Se agregaron seis noticias con categorías, fechas, resúmenes, contenido completo e ilustraciones SVG.
- Se configuraron `app-1`, `app-2` y `nginx` en Docker Compose.
- NGINX quedó como único servicio con puerto publicado: `localhost:8080`.
- Se implementó Round Robin, encabezado `X-App-Instance` y failover.
- Se agregaron README, matriz de pruebas, PDF de evidencias y guion de video.

### Archivos relacionados

- `server.js`
- `Dockerfile`
- `docker-compose.yml`
- `nginx/nginx.conf`
- `README.md`
- `docs/evidencias/evidencias.pdf`

---

## 2. Navegación hacia Historias destacadas

### Solicitud del estudiante

> Quiero que cuando se pulse el botón **Noticias**, la página baje automáticamente hacia la sección donde aparece **Historias destacadas**.

### Respuesta aplicada

- El enlace del botón ahora apunta a `/#stories-heading`.
- El encabezado `Historias destacadas` funciona como destino del ancla.
- Se agregó `scroll-margin-top` para que el título no quede pegado al borde superior.
- Se conserva la ruta `/noticias` para poder consultar directamente el catálogo si se escribe la URL.

### Archivos relacionados

- `server.js`
- `public/assets/app.css`

---

## 3. Identidad visual por instancia

### Solicitud del estudiante

> Además de mostrar `Instancia APP-1` o `Instancia APP-2`, quiero que el nombre de la cabecera cambie: para `app-1` debe decir **LADO A** y para `app-2` debe decir **LADO B**, aunque ambas instancias utilicen el mismo HTML.

### Respuesta aplicada

La aplicación utiliza el mismo código en ambos contenedores, pero cada servicio recibe una variable de entorno distinta:

```yaml
app-1:
  environment:
    INSTANCE_ID: app-1

app-2:
  environment:
    INSTANCE_ID: app-2
```

En `server.js`, el servidor transforma ese identificador en una marca visual:

```js
const INSTANCE_BRANDS = { 'app-1': 'LADO A', 'app-2': 'LADO B' };
const SITE_NAME = INSTANCE_BRANDS[INSTANCE_ID] || 'LADO B';
```

Por eso:

- `app-1` muestra `LADO A` y el distintivo `LA`.
- `app-2` muestra `LADO B` y el distintivo `LB`.
- El encabezado `X-App-Instance` continúa indicando el contenedor que respondió.

Esto demuestra que el HTML se genera dinámicamente a partir de la configuración de cada instancia; no es necesario mantener dos aplicaciones distintas.

### Archivos relacionados

- `docker-compose.yml`
- `server.js`
- `public/assets/app.css`

---

## 4. Transparencia sobre imágenes y herramientas

### Pregunta del estudiante

> ¿De dónde salieron las imágenes? ¿Fueron descargadas o creadas? ¿Qué skills se utilizaron y cómo se utilizaron?

### Respuesta documentada

Las seis ilustraciones no fueron descargadas de Internet. Fueron creadas para este proyecto como archivos SVG locales:

- `public/images/tecnologia.svg`
- `public/images/ciencia.svg`
- `public/images/cultura.svg`
- `public/images/ambiente.svg`
- `public/images/videojuegos.svg`
- `public/images/comunidad.svg`

Esto evita depender de una CDN, reduce problemas de derechos de autor y hace que el portal continúe funcionando sin conexión externa para las imágenes. Son ilustraciones editoriales abstractas; no deben interpretarse como fotografías ni como evidencia documental.

### Skills utilizadas

| Skill | Uso en el proyecto |
| --- | --- |
| `frontend-design` | Definió la dirección editorial: composición de revista, tipografía Newsreader/Manrope, paleta crema/coral/azul/verde y tarjetas con jerarquía visual. |
| `web-design-guidelines` | Sirvió para revisar semántica HTML, `alt` en imágenes, dimensiones explícitas, foco visible, `prefers-reduced-motion`, formularios etiquetados, navegación con enlaces y ausencia de `transition: all`. |
| `playwright-cli` | Permitió probar el portal en escritorio y móvil, comprobar seis tarjetas, verificar la noticia individual, detectar overflow horizontal, tomar capturas y generar el PDF de evidencias. |
| Herramientas Docker/terminal | Permitieron construir imágenes, levantar servicios, revisar healthchecks, probar NGINX y detener una instancia para comprobar failover. |

La fuente técnica `docs/informe-evidencias.source` es únicamente el informe que reúne las capturas de prueba. No es el HTML que genera el portal. El HTML de la aplicación se produce desde `server.js` y se adapta mediante `INSTANCE_ID`.

---

## 5. Explicación de la red interna

### Pregunta del estudiante

> ¿Cómo es que solo NGINX es accesible por el usuario y las demás páginas o instancias tienen comunicación interna? ¿En qué resulta esto?

### Respuesta documentada

En realidad, no son “páginas” separadas: son contenedores y servicios independientes.

Docker Compose crea una red virtual llamada `newsroom`. Los tres contenedores se conectan a ella:

```text
Navegador
    │ localhost:8080
    ▼
  NGINX
    │ red Docker newsroom
    ├── app-1:3000
    └── app-2:3000
```

En `docker-compose.yml`, NGINX tiene:

```yaml
ports:
  - "8080:80"
```

Eso publica el puerto 80 del contenedor NGINX como el puerto 8080 del equipo anfitrión.

Las aplicaciones tienen únicamente:

```yaml
expose:
  - "3000"
```

`expose` permite que otros contenedores de la misma red las contacten, pero no publica el puerto en el equipo anfitrión. Por eso el usuario entra por `http://localhost:8080`, mientras NGINX se comunica internamente usando los nombres DNS `app-1:3000` y `app-2:3000`.

### ¿Qué beneficios produce?

1. **Punto de entrada único:** el usuario no necesita conocer cuántas instancias existen.
2. **Balanceo centralizado:** NGINX reparte las solicitudes entre los backends.
3. **Failover:** si una instancia deja de funcionar, NGINX intenta la otra.
4. **Menor exposición:** las aplicaciones no quedan directamente publicadas en el host.
5. **Escalabilidad:** se pueden agregar más backends detrás de NGINX.
6. **Separación de responsabilidades:** NGINX maneja entrada y tráfico; Node procesa la aplicación.
7. **Observabilidad:** los encabezados `X-App-Instance` y `X-Load-Balancer` permiten verificar el recorrido.

En esta práctica, la red interna simula una arquitectura pequeña de producción: un reverse proxy delante de varias réplicas de aplicación.

### Archivos relacionados

- `docker-compose.yml`
- `nginx/nginx.conf`
- `docs/arquitectura.md`

---

## 6. Prompts editoriales de las noticias

Estos son los prompts usados para crear el contenido de las seis noticias del portal.

### Generación del borrador

> Actúa como editor de un portal universitario experimental. Redacta una noticia breve, legible y contextualizada sobre **[tema]** para estudiantes y lectores curiosos. Incluye un título informativo sin sensacionalismo, un resumen de una o dos frases y tres párrafos de desarrollo. No inventes nombres, cifras, citas, instituciones ni resultados verificables. Si el tema necesita datos actuales, marca las afirmaciones que deben comprobarse con fuentes primarias. Usa un tono claro, evita prometer certezas y no presentes el texto como periodismo publicado. Devuelve también una categoría, una fecha sugerida y una idea de ilustración editorial.

### Revisión de responsabilidad

> Revisa el siguiente borrador como editor responsable. Señala afirmaciones potencialmente falsas, datos que necesitarían una fuente, sesgos, generalizaciones, riesgos de privacidad y frases que suenen demasiado concluyentes. Después propone una versión más clara que mantenga la incertidumbre cuando corresponda. No agregues hechos nuevos ni inventes referencias. Conserva la indicación de que el texto fue generado o asistido por IA.

---

## 7. Criterios de revisión

- Cada historia identifica la herramienta: ChatGPT.
- El portal advierte que se trata de contenido académico no verificado.
- No se incluyen datos personales, citas atribuidas o cifras sin fuente.
- Se revisaron redacción, coherencia, tono y legibilidad.
- Las ilustraciones son recursos originales del proyecto.
- Las afirmaciones deben contrastarse con fuentes primarias antes de reutilizarse.

---

## 8. Regla para continuar la bitácora

Cada nuevo cambio solicitado debe registrarse al final de este archivo con esta estructura:

```markdown
## N. Título breve del cambio

### Solicitud del estudiante

> Descripción limpia de la solicitud.

### Respuesta aplicada

- Qué se modificó.
- Qué comportamiento resulta.
- Qué archivos se tocaron.
```

Así se conserva una historia clara de las decisiones del proyecto sin mezclar prompts editoriales, solicitudes de interfaz y explicaciones técnicas.
