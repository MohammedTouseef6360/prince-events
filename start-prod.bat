@echo off
title PRINCE EVENT'S - Production Server
echo ============================================
echo    PRINCE EVENT'S - Production Mode
echo    "We Serve You Smile"
echo ============================================
echo.
echo [*] Building project for production...
npx next build
if %errorlevel% neq 0 (
    echo [X] Build failed! Check errors above.
    pause
    exit /b 1
)
echo.
echo [✓] Build complete!
echo [*] Starting production server on http://localhost:3000
echo.
npx next start
pause
