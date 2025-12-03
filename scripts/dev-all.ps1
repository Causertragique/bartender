param(
  [int]$ApiPort = 4000,
  [string]$ApiUrl = $env:VITE_API_URL
)

Write-Host "Starting API and Web in parallel (PowerShell)..." -ForegroundColor Green

# Prefer concurrently if available for better output
$hasConcurrently = (pnpm exec concurrently --version) 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "concurrently detected; delegating to pnpm dev:all" -ForegroundColor Yellow
  pnpm dev:all
  exit $LASTEXITCODE
}

Write-Host "concurrently not found. Falling back to Start-Job." -ForegroundColor Yellow

$env:PORT = $ApiPort

$apiJob = Start-Job -Name "api" -ScriptBlock {
  pnpm dev:api
}
$webJob = Start-Job -Name "web" -ScriptBlock {
  pnpm dev
}

try {
  Write-Host "Jobs started: api=$($apiJob.Id), web=$($webJob.Id)" -ForegroundColor Cyan
  Write-Host "Press Ctrl+C to stop both." -ForegroundColor Yellow

  # Stream output from both jobs
  while ($true) {
    Receive-Job -Id $apiJob.Id -Keep | ForEach-Object { Write-Host "[api] $_" -ForegroundColor Yellow }
    Receive-Job -Id $webJob.Id -Keep | ForEach-Object { Write-Host "[web] $_" -ForegroundColor Cyan }
    Start-Sleep -Milliseconds 250
    if ((Get-Job -Id $apiJob.Id).State -eq 'Completed' -or (Get-Job -Id $webJob.Id).State -eq 'Completed') {
      break
    }
  }
}
finally {
  Get-Job -Id $apiJob.Id,$webJob.Id -ErrorAction SilentlyContinue | Stop-Job -Force -ErrorAction SilentlyContinue | Out-Null
  Get-Job -Id $apiJob.Id,$webJob.Id -ErrorAction SilentlyContinue | Remove-Job -Force -ErrorAction SilentlyContinue | Out-Null
}
