@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 exit /b 1
)
set "HWS_MODE=dry-run"
call npm run validate
if errorlevel 1 exit /b 1
call npm run start:dry
endlocal
