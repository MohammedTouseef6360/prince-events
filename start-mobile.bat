@echo off
title PRINCE EVENTS - Mobile/Network Mode
echo ============================================
echo    PRINCE EVENTS - Network Mode
echo    "We Serve You Smile"
echo ============================================
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do set ip=%%a
set ip=%ip: =%
echo [*] Your computer IP: %ip%
echo.
echo [*] Starting server for network access...
echo.
echo [✓] Open on your phone browser:
echo     http://%ip%:3000
echo.
echo [*] Make sure phone is on the SAME WiFi network
echo [*] Press Ctrl+C to stop
echo.
npx next dev -H 0.0.0.0
pause
