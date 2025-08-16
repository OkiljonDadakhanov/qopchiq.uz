@echo off
echo 🚀 Starting Qopchiq.uz Development Servers...
echo.

echo 📡 Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm start"

echo 🌐 Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 📊 Health Check: http://localhost:5000/health
echo.
echo 🎯 Demo Login:
echo    Email: demo@qopchiq.uz
echo    Password: demo123
echo.
pause
