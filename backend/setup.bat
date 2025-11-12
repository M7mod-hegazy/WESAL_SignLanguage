@echo off
echo ========================================
echo   Sign Language Backend Setup
echo ========================================
echo.

echo [1/4] Creating environment file...
if not exist ".env" (
    copy .env.example .env
    echo Created .env file with MongoDB Atlas configuration
) else (
    echo .env file already exists
)
echo.

echo [2/4] Installing Node.js dependencies...
call npm install
echo.

echo [3/4] MongoDB Atlas Configuration
echo Using cloud database - No local MongoDB needed!
echo Connection: mongodb+srv://cluster0.okawlww.mongodb.net/
timeout /t 2 /nobreak >nul
echo.

echo [4/4] Seeding database with sample data...
call npm run seed
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Your backend is ready with MongoDB Atlas!
echo.
echo To start the server, run:
echo   npm start
echo.
echo Or use the start.bat script:
echo   start.bat
echo.
pause
