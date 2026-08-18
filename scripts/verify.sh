#!/usr/bin/env sh
set -eu

BASE_URL="${BASE_URL:-http://localhost:8080}"

printf '%s\n' '== Estado de contenedores =='
docker compose ps

printf '%s\n' '\n== Rutas principales =='
curl --fail --silent --show-error --output /dev/null "$BASE_URL/"
printf '%s\n' 'GET /                         OK'
curl --fail --silent --show-error --output /dev/null "$BASE_URL/noticias"
printf '%s\n' 'GET /noticias                 OK'
curl --fail --silent --show-error --output /dev/null "$BASE_URL/noticias/la-computacion-local-cambia-el-pulso-del-campus"
printf '%s\n' 'GET /noticias/:slug           OK'
curl --fail --silent --show-error --output /dev/null "$BASE_URL/api/noticias"
printf '%s\n' 'GET /api/noticias             OK'
curl --fail --silent --show-error --output /dev/null "$BASE_URL/nginx-status"
printf '%s\n' 'GET /nginx-status             OK'

printf '%s\n' '\n== Balanceo: 12 solicitudes consecutivas =='
for request in 1 2 3 4 5 6 7 8 9 10 11 12; do
  instance=$(curl --fail --silent --show-error -D - -o /dev/null "$BASE_URL/health" | awk -F': ' 'tolower($1) == "x-app-instance" { gsub("\\r", "", $2); print $2 }')
  printf 'Solicitud %02d -> %s\n' "$request" "${instance:-encabezado ausente}"
done

printf '%s\n' '\n== Prueba de contenido =='
curl --fail --silent --show-error "$BASE_URL/api/noticias" | grep -q 'ChatGPT'
printf '%s\n' 'Atribución de IA              OK'
curl --fail --silent --show-error "$BASE_URL/noticias" | grep -q 'Proyecto académico'
printf '%s\n' 'Aviso académico               OK'

printf '%s\n' '\n== Fin =='
printf '%s\n' 'Para probar failover: docker compose stop app-1; vuelve a ejecutar este script; luego docker compose start app-1.'
