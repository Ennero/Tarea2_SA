# Guion para el video demostrativo (3–5 minutos)

Este guion cubre todas las evidencias exigidas y permite grabar la demostración con Docker Desktop, una terminal y el navegador.

## 0:00–0:35 · Presentación

- Mostrar la portada de LADO B.
- Explicar que es un proyecto académico de noticias generadas o asistidas por IA.
- Señalar la advertencia editorial y la atribución “ChatGPT” dentro de una noticia.

## 0:35–1:10 · Arquitectura y archivos

- Abrir `docker-compose.yml` y mostrar `app-1`, `app-2` y `nginx`.
- Mostrar que solo NGINX publica `8080:80`; las aplicaciones solo tienen `expose: 3000`.
- Abrir `nginx/nginx.conf` y señalar el `upstream newsroom_app`.
- Explicar que el Round Robin es el algoritmo predeterminado de NGINX.

## 1:10–2:00 · Arranque y rutas

- Ejecutar `docker compose up --build -d`.
- Ejecutar `docker compose ps` y mostrar los tres contenedores saludables.
- En el navegador visitar `http://localhost:8080/`, `/noticias`, una noticia individual, `/api/noticias` y `/nginx-status`.

## 2:00–3:00 · Balanceo

- Ejecutar `scripts/verify.ps1` en PowerShell o `sh scripts/verify.sh` en Git Bash/WSL.
- Mostrar las solicitudes consecutivas a `/health` y los valores alternados `app-1` / `app-2` en `X-App-Instance`.
- Mostrar la misma identificación en la insignia superior del portal.

## 3:00–4:00 · Failover

- Ejecutar `docker compose stop app-1`.
- Volver a ejecutar el script de verificación o refrescar la portada varias veces.
- Mostrar que las solicitudes siguen respondiendo desde `app-2` gracias a `proxy_next_upstream` y `max_fails`.
- Ejecutar `docker compose start app-1` y comprobar que vuelve a estar saludable.

## 4:00–4:40 · Cierre

- Mostrar `Dockerfile`, `prompts/noticias.md` y `README.md`.
- Recordar que las historias no son hechos periodísticos verificados y que deben revisarse con fuentes primarias.
- Detener el entorno con `docker compose down` si la demostración terminó.
