# Start Backend and Frontend Servers
Write-Host "🚀 Starting Backend and Frontend..." -ForegroundColor Cyan
Write-Host ""

# Start Backend in new window
Write-Host "📦 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm start"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend in new window
Write-Host "⚛️  Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm start"

Write-Host ""
Write-Host "✅ Both servers starting in separate windows..." -ForegroundColor Green
Write-Host "📡 Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
