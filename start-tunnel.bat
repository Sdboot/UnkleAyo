@echo off
REM Start the dev server in the background
echo Starting development server...
start cmd /k "cd /d %~dp0 && npm run dev"

REM Wait a few seconds for the server to start
timeout /t 5

REM Start ngrok tunnel
echo Starting ngrok tunnel...
ngrok http 5173

pause
