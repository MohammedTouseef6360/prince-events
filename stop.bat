@echo off
title PRINCE EVENTS - Stop Server
echo ============================================
echo    PRINCE EVENTS - Stopping Server
echo ============================================
echo.
echo [*] Stopping Next.js server...
for /f "tokens=2 delims=," %%a in ('tasklist /fi "imagename eq node.exe" /fo csv /nh 2^>nul ^| findstr /i "next"') do (
    taskkill /f /pid %%a 2>nul
)
echo [✓] Server stopped.
echo.
echo ============================================
echo    Thank you! - "We Serve You Smile"
echo ============================================
timeout /t 3 >nul
