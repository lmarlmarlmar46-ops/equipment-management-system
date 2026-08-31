@echo off
echo ================================================
echo Git Push Helper for EquipTrack
echo ================================================
echo.

REM Check if message was provided
if "%~1"=="" (
    echo Error: Please provide a commit message
    echo.
    echo Usage: push-to-github.bat "Your commit message here"
    echo Example: push-to-github.bat "Fixed login bug"
    echo.
    echo For first time setup, read: PUSH_TO_GITHUB_FIRST_TIME.txt
    echo.
    pause
    exit /b 1
)

REM Check if git is initialized
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo ================================================
    echo ⚠️  Git is not initialized yet!
    echo ================================================
    echo.
    echo This seems to be your first time.
    echo Please read: PUSH_TO_GITHUB_FIRST_TIME.txt
    echo.
    echo It will guide you through:
    echo 1. Initializing Git
    echo 2. Connecting to your GitHub repo
    echo 3. First push
    echo.
    pause
    exit /b 1
)

echo Checking git status...
git status
echo.

echo Adding all changes...
git add .
echo.

echo Committing with message: %~1
git commit -m "%~1"
echo.

echo Pushing to GitHub...
git push
echo.

if %errorlevel% equ 0 (
    echo ================================================
    echo ✅ Successfully pushed to GitHub!
    echo Railway will auto-deploy in 1-2 minutes.
    echo ================================================
) else (
    echo ================================================
    echo ❌ Push failed! Check the error above.
    echo ================================================
    echo.
    echo Common solutions:
    echo 1. Make sure you did the first-time setup
    echo 2. Check your internet connection
    echo 3. Verify GitHub credentials
    echo.
    echo Need help? Read: PUSH_TO_GITHUB_FIRST_TIME.txt
)

echo.
pause
