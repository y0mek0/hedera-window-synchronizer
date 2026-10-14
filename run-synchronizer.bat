@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
if not exist .env.local if exist .env.example copy /Y .env.example .env.local >nul
call npm run validate
if errorlevel 1 exit /b 1
call npm start
endlocal
