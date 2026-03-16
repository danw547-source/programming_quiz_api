param(
    [string]$PythonExe = "c:/Users/RETRO/Python/programming_quiz_api/venv/Scripts/python.exe",
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 5173
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"

$backendCommand = "Set-Location '$repoRoot'; & '$PythonExe' -m uvicorn app.main:app --reload --port $BackendPort"
$frontendCommand = "Set-Location '$frontendRoot'; npm run dev -- --host 127.0.0.1 --port $FrontendPort"

Write-Host "Starting backend on http://127.0.0.1:$BackendPort" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null

Write-Host "Starting frontend on http://127.0.0.1:$FrontendPort" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null

Write-Host "Both services started in separate terminals." -ForegroundColor Green
