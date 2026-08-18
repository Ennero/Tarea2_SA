# LADO B · Portal de noticias asistidas por IA

Portal académico de noticias sobre tecnología, ciencia, cultura, ambiente, videojuegos y comunidad. La aplicación está contenerizada con Docker Compose, publicada únicamente a través de NGINX y distribuida entre dos instancias privadas de Node.js.

> **Aviso académico:** las noticias son contenido generado o asistido por inteligencia artificial para fines educativos. No deben presentarse como información periodística verificada. El equipo debe revisar fuentes, sesgos y afirmaciones antes de reutilizar cualquier texto.

## Tecnologías

- Node.js 22 sobre Alpine Linux.
- `node:http` para el servidor web y las rutas HTML/JSON.
- HTML semántico, CSS responsive y JavaScript progresivo.
- Ilustraciones SVG locales, sin depender de imágenes externas.
- Docker y Docker Compose.
- NGINX 1.27 como reverse proxy y balanceador.

### Procedencia de las imágenes

Las seis imágenes son ilustraciones SVG originales creadas para este proyecto y almacenadas en `public/images/`. No se descargaron de Internet ni dependen de una CDN. Son recursos editoriales abstractos, no fotografías documentales.

### Skills aplicadas

- `frontend-design`: dirección visual editorial, tipografías, paleta de color, composición y microinteracciones.
- `web-design-guidelines`: revisión de semántica, accesibilidad, foco visible, `alt`, dimensiones de imágenes, formularios y responsive.
- `playwright-cli`: pruebas de navegador en escritorio/móvil, capturas, validación de rutas y generación del PDF de evidencias.
- Docker/terminal: construcción, healthchecks, prueba de NGINX, balanceo y failover.

## Arquitectura

```text
Cliente → localhost:8080 → NGINX:80 → newsroom (Round Robin) → app-1:3000 / app-2:3000
```

`nginx` es el único servicio con un puerto publicado en el host. `app-1` y `app-2` comparten la imagen `portal-latido-ia:local`, tienen IDs distintos y solo exponen el puerto 3000 dentro de la red `newsroom`.

### Comunicación interna

Docker Compose crea una red virtual llamada `newsroom`. NGINX puede resolver `app-1` y `app-2` por nombre y conectarse internamente a sus puertos `3000`. El usuario solo puede entrar por `http://localhost:8080` porque únicamente NGINX tiene `ports`; las aplicaciones usan `expose`, que no publica sus puertos en el host.

Esto crea un punto de entrada único, permite balancear tráfico, facilita el failover y evita exponer directamente los backends. La explicación ampliada está en `docs/arquitectura.md` y en la bitácora `prompts/noticias.md`.

### Identidad por instancia

Las dos instancias ejecutan el mismo `server.js`, pero reciben valores diferentes de `INSTANCE_ID`. El servidor los transforma en una marca visual: `app-1` muestra **LADO A** y `app-2` muestra **LADO B**, además del distintivo `Instancia app-1/app-2`. El mismo código puede producir ambas variantes porque la configuración llega desde el entorno del contenedor.

Archivos principales:

| Archivo | Propósito |
| --- | --- |
| `server.js` | Servidor, contenido, rutas HTML/JSON y encabezado `X-App-Instance` |
| `public/assets/app.css` | Diseño editorial responsive y accesible |
| `public/assets/app.js` | Compartir noticias y mejoras progresivas |
| `public/images/*.svg` | Seis ilustraciones locales relacionadas con las categorías |
| `Dockerfile` | Imagen Node 22, usuario sin privilegios y healthcheck |
| `docker-compose.yml` | Dos instancias, NGINX, red interna y único puerto público |
| `nginx/nginx.conf` | Proxy, upstream Round Robin, headers y failover |
| `prompts/noticias.md` | Prompts principales y criterios de revisión |
| `scripts/verify.ps1` | Verificación automatizada para PowerShell |
| `scripts/verify.sh` | Verificación automatizada para Bash/Git Bash/WSL |
| `docs/guion-video.md` | Guion de video demostrativo de 3–5 minutos |

## Requisitos previos

- Docker Desktop iniciado.
- Docker Compose v2 (`docker compose version`).
- En Windows, PowerShell para ejecutar `scripts/verify.ps1`.

No es necesario instalar Node.js ni ejecutar la aplicación directamente en el host: todo el portal debe levantarse dentro de contenedores.

## Construir e iniciar

Desde la raíz del repositorio:

```bash
docker compose up --build -d
```

Comprobar el estado:

```bash
docker compose ps
```

Abrir el portal en <http://localhost:8080>.

Detener y eliminar los contenedores:

```bash
docker compose down
```

## Rutas configuradas

- `/` — portada con las seis noticias, filtros y buscador.
- `/#stories-heading` — ancla usada por el botón **Noticias** para bajar a “Historias destacadas”.
- `/noticias` — catálogo de noticias directo si se escribe la ruta.
- `/noticias/:slug` — noticia individual con contenido completo.
- `/api/noticias` — catálogo en JSON.
- `/api/noticias/:slug` — noticia individual en JSON.
- `/health` — estado de la instancia que respondió.
- `/nginx-status` — estado básico del worker de NGINX.
- `/assets/*` y `/images/*` — recursos estáticos servidos por la aplicación a través del proxy.

## Balanceo y evidencia

NGINX utiliza Round Robin en el bloque `upstream newsroom_app` de `nginx/nginx.conf`. Cada solicitud puede ser atendida por una instancia distinta. Para verlo:

### PowerShell

```powershell
.\scripts\verify.ps1
```

### Bash, Git Bash o WSL

```bash
sh scripts/verify.sh
```

El script comprueba las rutas, la atribución a ChatGPT, el aviso académico y muestra 12 respuestas consecutivas con el encabezado `X-App-Instance`.

También se puede revisar una respuesta manualmente:

```bash
curl -I http://localhost:8080/health
```

La respuesta debe incluir, entre otros:

```text
X-App-Instance: app-1
X-Load-Balancer: nginx
```

## Prueba de continuidad al detener una instancia

1. Verificar que ambas instancias estén activas:

   ```bash
   docker compose ps
   ```

2. Detener una instancia, sin detener NGINX:

   ```bash
   docker compose stop app-1
   ```

3. Repetir el script de verificación. Las rutas deben seguir respondiendo desde `app-2` gracias a `proxy_next_upstream`, `max_fails` y `fail_timeout`.

4. Recuperar la instancia:

   ```bash
   docker compose start app-1
   docker compose ps
   ```

> Nota: NGINX puede recordar temporalmente un backend fallido durante `fail_timeout` (5 segundos). Es normal que el failover se haga visible después del primer intento fallido.

## IA y responsabilidad

La herramienta declarada para el texto es **ChatGPT**. Cada noticia contiene una ficha editorial y el texto “Contenido generado con ChatGPT y revisado por el equipo del proyecto”. Los prompts están preservados en `prompts/noticias.md`.

El contenido no se presenta como información verificada. Antes de usarlo en un contexto real hay que comprobar hechos con fuentes primarias, detectar sesgos, revisar privacidad y corregir afirmaciones potencialmente falsas.

## Entregables y evidencias

El repositorio contiene el código fuente, `Dockerfile`, `docker-compose.yml`, configuración de NGINX, recursos, prompts, README, scripts de verificación, arquitectura y guion de video. El informe formal `docs/evidencias/evidencias.pdf` incluye los datos del estudiante, la evidencia visual de Docker Desktop, acceso al portal, rutas, IA, balanceo, failover y fragmentos de los archivos técnicos. También se incluyen las capturas PNG, `docker-containers.svg` y la matriz `docs/pruebas.md`. La bitácora `prompts/noticias.md` registra las solicitudes y respuestas principales del desarrollo.

Para regenerar o ampliar las evidencias, levantar el proyecto, repetir el flujo de `docs/guion-video.md` y guardar las capturas en `docs/evidencias/`. Para el video final de 3–5 minutos, grabar la secuencia del guion y añadir el enlace en la entrega académica. El guion cubre explícitamente: contenedores, rutas, balanceo, dos IDs de instancia, failover y atribución de IA.
