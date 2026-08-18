$ErrorActionPreference = 'Stop'
$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:8080' }

Write-Host '== Estado de contenedores ==' -ForegroundColor Cyan
docker compose ps

Write-Host "`n== Rutas principales ==" -ForegroundColor Cyan
Invoke-WebRequest "$BaseUrl/" -UseBasicParsing | Out-Null
Write-Host 'GET /                         OK'
Invoke-WebRequest "$BaseUrl/noticias" -UseBasicParsing | Out-Null
Write-Host 'GET /noticias                 OK'
Invoke-WebRequest "$BaseUrl/noticias/la-computacion-local-cambia-el-pulso-del-campus" -UseBasicParsing | Out-Null
Write-Host 'GET /noticias/:slug           OK'
Invoke-WebRequest "$BaseUrl/api/noticias" -UseBasicParsing | Out-Null
Write-Host 'GET /api/noticias             OK'
Invoke-WebRequest "$BaseUrl/nginx-status" -UseBasicParsing | Out-Null
Write-Host 'GET /nginx-status             OK'

Write-Host "`n== Balanceo: 12 solicitudes consecutivas ==" -ForegroundColor Cyan
for ($request = 1; $request -le 12; $request++) {
  $response = Invoke-WebRequest "$BaseUrl/health" -UseBasicParsing
  $instance = $response.Headers['X-App-Instance']
  Write-Host ('Solicitud {0:D2} -> {1}' -f $request, $instance)
}

Write-Host "`n== Prueba de contenido ==" -ForegroundColor Cyan
$api = (Invoke-WebRequest "$BaseUrl/api/noticias" -UseBasicParsing).Content
if ($api -notmatch 'ChatGPT') { throw 'No se encontró la atribución a ChatGPT.' }
Write-Host 'Atribución de IA              OK'
$homeContent = (Invoke-WebRequest "$BaseUrl/noticias" -UseBasicParsing).Content
if ($homeContent -notmatch 'Proyecto acad') { throw 'No se encontro el aviso academico.' }
Write-Host 'Aviso académico               OK'

Write-Host "`nFin. Para probar failover: docker compose stop app-1; vuelve a ejecutar este script; luego docker compose start app-1." -ForegroundColor Green
