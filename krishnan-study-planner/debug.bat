@echo off
echo Checking Node.js installation...
where node
if %errorlevel% neq 0 (
    echo Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
where npm
if %errorlevel% neq 0 (
    echo npm is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Running npm install...
call npm install
if %errorlevel% neq 0 (
    echo npm install failed
    pause
    exit /b 1
)

echo.
echo Starting development server...
start "" cmd /k "npm run dev"
timeout /t 5 >nul
start "" http://localhost:5173
pause
