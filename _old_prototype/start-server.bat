@echo off
REM Start server for The Fourth Lobby Project

title The Fourth Lobby - HTML Prototype Server

cd /d "%~dp0"

echo.
echo ============================================================
echo   The Fourth Lobby - HTML Prototype Server
echo ============================================================
echo.

python server.py 8000

if errorlevel 1 (
    echo.
    echo Error: Python is not installed or server failed to start
    echo Please make sure Python 3.6+ is installed
    pause
)

pause
