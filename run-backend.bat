@echo off
cls
echo ========================================
echo   TALENT OPS - BACKEND SERVER
echo ========================================
echo.

cd ai_backend

echo Starting chatbot backend server...
echo Server will run on: http://localhost:8035
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

python server.py

pause
