@echo off
echo ========================================================
echo   UNAMIS Portal — Preparando Compilacion para Hostinger
echo ========================================================
echo.
echo [1/3] Ejecutando compilacion del Frontend (Vite + TypeScript)...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Fallo la compilacion de TypeScript o Vite.
    echo Por favor, revisa los errores arriba.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/3] Sincronizando archivos del Backend a la carpeta dist/...
copy /Y api.php dist\api.php
copy /Y api-banco.php dist\api-banco.php
copy /Y security.php dist\security.php
copy /Y config.php dist\config.php
copy /Y diagnostico.php dist\diagnostico.php
copy /Y test-conexion.php dist\test-conexion.php
copy /Y verificar_build.php dist\verificar_build.php
copy /Y sw.js dist\sw.js
copy /Y .htaccess dist\.htaccess
copy /Y *.sql dist\
xcopy /E /I /Y documentos dist\documentos

echo.
echo [3/3] ¡Listo! Carpeta dist/ preparada con la ultima actualizacion.
echo Puedes subir los contenidos de dist/ a tu Hostinger por FTP,
echo comprimirlos en un ZIP, o hacer git push para el deploy automatico.
echo.
rem pause

