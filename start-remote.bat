@echo off
REM UnkleAyo Remote Access Launcher
REM This script helps you set up remote access with ngrok

echo.
echo ========================================
echo    UnkleAyo Meeting Scheduler
echo    Remote Access Launcher
echo ========================================
echo.

echo Checking for ngrok...
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] ngrok not found in system PATH
    echo.
    echo To enable REMOTE access (from any device worldwide):
    echo 1. Download ngrok: https://ngrok.com/download
    echo 2. Extract and add to PATH, or run ngrok from the extracted folder
    echo 3. Run: ngrok http 3001
    echo 4. Copy the HTTPS URL (e.g., https://abc123.ngrok.io^)
    echo 5. Edit .env file and set: VITE_PUBLIC_URL=https://abc123.ngrok.io
    echo 6. Run this script again
    echo.
    pause
    exit /b
)

echo [✓] ngrok found
echo.
echo For REMOTE ACCESS setup:
echo.
echo Step 1: Start ngrok in a NEW terminal window
echo   ngrok http 3001
echo.
echo Step 2: Copy the HTTPS forwarding URL (e.g., https://abc123.ngrok.io^)
echo.
echo Step 3: Edit .env and set the VITE_PUBLIC_URL:
echo   VITE_PUBLIC_URL=https://abc123.ngrok.io
echo.
echo Step 4: Continue with this script
echo.
pause
echo.
echo Starting application...
echo.
npm run dev
