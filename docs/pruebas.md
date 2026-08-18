# Matriz de pruebas

| Prueba | Comando/acción | Resultado esperado |
| --- | --- | --- |
| Construcción | `docker compose build` | Imagen `portal-latido-ia:local` construida sin errores |
| Contenedores | `docker compose ps` | `app-1`, `app-2` y `nginx` activos; app saludables |
| Portada | `GET http://localhost:8080/` | HTML con seis historias y aviso académico |
| Catálogo | `GET /noticias` | Listado accesible por la ruta explícita |
| Detalle | `GET /noticias/:slug` | Título, fecha, categoría, imagen, resumen, contenido y atribución |
| API | `GET /api/noticias` | JSON con seis elementos y `generatedWith: ChatGPT` |
| NGINX | `GET /nginx-status` | Estado del worker disponible |
| Headers | `curl -I /health` | `X-App-Instance` y `X-Load-Balancer` presentes |
| Balanceo | 12 `GET /health` consecutivos | Aparición de `app-1` y `app-2` |
| Failover | `docker compose stop app-1` + script | El portal sigue respondiendo desde `app-2` |
| Recuperación | `docker compose start app-1` | Ambas instancias regresan a estado saludable |
| Responsive | Navegador a 390px y 1440px | Layout legible sin scroll horizontal |
