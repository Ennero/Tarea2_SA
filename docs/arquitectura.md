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
