@echo off
title PRINCE EVENTS - Restart Server
echo ============================================
echo    PRINCE EVENTS - Restarting Server
echo ============================================
echo.
echo [*] Stopping running Next.js processes...
for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq node.exe" /fo csv /nh 2^>nul ^| findstr /i "node"') do (
    taskkill /f /pid %%a 2>nul
)
timeout /t 2 /nobreak >nul
echo [*] Starting Next.js server...
echo.
cd /d "%~dp0"
start "PRINCE EVENTS Dev Server" cmd /k "npm run dev"
echo.
echo [✓] Server restarted. The new window will show the dev server.
echo     Open http://localhost:3000 when it reports ready.
echo ============================================
echo    Thank you! - "We Serve You Smile"
echo ============================================
timeout /t 3 >nul
