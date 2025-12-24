@echo off
cls
echo ========================================
echo   TALENT OPS - START ALL SERVERS
echo ========================================
echo.

echo This will start both backend and frontend servers
echo in separate windows.
echo.
echo Backend: http://localhost:8035
echo Frontend: http://localhost:5173
echo.
pause

echo Starting backend server...
start "Talent Ops - Backend" cmd /k "cd ai_backend && python server.py"

timeout /t 3 /nobreak >nul

echo Starting frontend server...
start "Talent Ops - Frontend" cmd /k "cd "Landing-login page" && npm run dev"

echo.
echo ========================================
echo   SERVERS STARTED! 🚀
echo ========================================
echo.
echo Backend:  http://localhost:8035
echo Frontend: http://localhost:5173
echo.
echo Two new windows have opened for each server.
echo Close those windows to stop the servers.
echo.
echo ========================================
pause
