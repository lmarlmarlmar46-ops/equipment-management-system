@echo off
echo ========================================
echo   EquipTrack Desktop Application
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

echo [OK] Python is installed
echo.

REM Check if dependencies are installed
python -c "import PyQt6" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing dependencies...
    echo.
    pip install -r requirements.txt
    echo.
)

echo [OK] Dependencies are ready
echo.
echo Starting EquipTrack...
echo.

REM Run the application
python main.py

pause
