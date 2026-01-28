@echo off
echo Iniciando servidor Uvicorn (MCMatias Backend)...
echo.
call venv\Scripts\activate
uvicorn config.asgi:application --reload --host 127.0.0.1 --port 8000
pause