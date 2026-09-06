@echo off
echo ========================================
echo EquipTrack Installation Script
echo ========================================
echo.

echo Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

cd ..
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo To start the application:
echo   1. Open a terminal and run: cd backend ^&^& npm start
echo   2. Open another terminal and run: cd frontend ^&^& npm run dev
echo   3. Open browser to http://localhost:3000
echo.
pause
