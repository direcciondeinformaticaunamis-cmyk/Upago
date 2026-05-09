@echo off
echo Iniciando servidores para UNAMIS Portal de Admisión...
start "PHP Backend (8001)" cmd /k "php -S localhost:8001"
start "Vite Frontend (5173)" cmd /k "npm run dev"
echo Servidores iniciados.
echo Backend: http://localhost:8001
echo Frontend: http://localhost:5173
pause
