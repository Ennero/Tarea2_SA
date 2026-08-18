# Arquitectura de LADO B

```text
Navegador
    │ http://localhost:8080
    ▼
┌──────────────────────────┐
│ nginx:80                 │  único servicio publicado
│ reverse proxy + upstream │  Round Robin / failover
└────────────┬─────────────┘
             │ red Docker `newsroom`
       ┌─────┴─────┐
       ▼           ▼
┌────────────┐ ┌────────────┐
│ app-1:3000 │ │ app-2:3000 │  instancias privadas
└────────────┘ └────────────┘
```

## Decisiones

- **Aplicación:** Node.js 22 con el módulo `node:http`; no requiere dependencias externas de runtime.
- **Contenido:** seis noticias académicas en `server.js`, con categoría, fecha ISO, resumen, contenido, atribución de IA e ilustración SVG local.
- **Entrada pública:** NGINX expone `8080:80`. Las instancias tienen únicamente `expose: 3000`, por lo que no se pueden consultar directamente desde el host.
- **Balanceo:** el bloque `upstream newsroom_app` usa Round Robin, que es el algoritmo predeterminado de NGINX y distribuye solicitudes sucesivas entre `app-1` y `app-2`.
- **Continuidad:** `max_fails`, `fail_timeout` y `proxy_next_upstream` permiten intentar la otra instancia ante errores de conexión o respuestas 502/503/504.
- **Observabilidad:** cada aplicación responde con `X-App-Instance`; NGINX agrega `X-Load-Balancer: nginx`. La interfaz muestra también el identificador de instancia.
- **Seguridad de imagen:** el contenedor ejecuta Node como usuario sin privilegios y usa healthchecks.

## Cómo funciona la comunicación interna

Docker Compose crea una red bridge virtual llamada `newsroom`. Los tres servicios se conectan a esa red, pero solo NGINX publica un puerto al equipo anfitrión:

```yaml
nginx:
  ports:
    - "8080:80"

app-1:
  expose:
    - "3000"

app-2:
  expose:
    - "3000"
```

`ports` hace un mapeo entre el host y el contenedor. Por eso el navegador puede acceder a `localhost:8080`. `expose` deja disponible el puerto para la red interna de Docker, pero no crea un puerto público en el host. Una solicitud del navegador sigue este recorrido:

```text
localhost:8080
      │
      ▼
NGINX:80 ── newsroom ── app-1:3000
                   └── app-2:3000
```

NGINX resuelve los nombres `app-1` y `app-2` mediante el DNS interno de Docker. El navegador nunca necesita conocer esas direcciones ni puede conectarse directamente al puerto 3000 desde el host.

Este diseño produce un punto de entrada único, centraliza el balanceo, permite failover y reduce la superficie de exposición de la aplicación. También permite añadir más backends sin cambiar la dirección que utiliza el usuario.

## Por qué el mismo HTML muestra LADO A o LADO B

Las dos instancias ejecutan el mismo `server.js`. La diferencia se inyecta desde Compose:

```yaml
app-1:
  environment:
    INSTANCE_ID: app-1

app-2:
  environment:
    INSTANCE_ID: app-2
```

El servidor usa esa variable para elegir la marca visual:

```js
const INSTANCE_BRANDS = { 'app-1': 'LADO A', 'app-2': 'LADO B' };
```

Así no existen dos copias distintas del HTML. Existe una plantilla común que se renderiza con la configuración de la instancia que atendió la solicitud. El encabezado `X-App-Instance` y la insignia de la cabecera permiten comprobarlo visualmente.
