@echo off
title Study Planner - Starting...
cd /d "%~dp0"

:: Start the development server in a new window
start "Study Planner Server" /MIN cmd /c "npm run dev"

echo Starting Study Planner...
echo Please wait while the application loads...

:: Wait for the server to start (increased from 3 to 5 seconds for better reliability)
timeout /t 5 >nul

:: Open the application in the default browser
start "" "http://localhost:5173"

exit
