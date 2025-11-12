@echo off
echo ========================================
echo   Sign Language Backend - Node.js
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Check if MongoDB is running
echo Checking MongoDB connection...
timeout /t 2 /nobreak >nul

REM Start the server
echo Starting Node.js server...
echo Server will be available at http://localhost:8000
echo.
call npm start
