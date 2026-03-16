param(
    [string]$PythonExe = "c:/Users/RETRO/Python/programming_quiz_api/venv/Scripts/python.exe"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"

Set-Location $repoRoot
& $PythonExe -m pytest tests/ -q
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

Set-Location $frontendRoot
npm run lint
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

npm run test:run
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}

npm run build
exit $LASTEXITCODE
