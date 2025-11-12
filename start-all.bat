@echo off
echo Starting Backend and Frontend...
echo.

start "Backend Server" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo Both servers starting in separate windows...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
