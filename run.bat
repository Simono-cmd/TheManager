@echo off
cd /d "%~dp0"

echo ----------------------------------------------------------
echo                        THE MANAGER
echo ----------------------------------------------------------

echo.
echo [1/3] Backend...
cd backend
call npm install

echo.
echo [2/3] Frontend...
cd ..
cd frontend
call npm install

echo.
echo [3/3] Starting...
cd ..
cd backend
call npm run setup

pause