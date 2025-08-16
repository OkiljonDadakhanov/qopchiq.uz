# Start Development Servers for Qopchiq.uz
Write-Host "🚀 Starting Qopchiq.uz Development Servers..." -ForegroundColor Green

# Start Backend Server
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm start" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start Frontend Server
Write-Host "🌐 Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📊 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Demo Login:" -ForegroundColor Magenta
Write-Host "   Email: demo@qopchiq.uz" -ForegroundColor White
Write-Host "   Password: demo123" -ForegroundColor White
