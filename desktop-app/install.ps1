# EquipTrack Desktop App - Installation Script
# Run this script in PowerShell to set up the application

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EquipTrack Desktop App - Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Python installation
Write-Host "[1/4] Checking Python installation..." -ForegroundColor Yellow

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Python 3.9 or higher from:" -ForegroundColor Yellow
    Write-Host "https://www.python.org/downloads/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Make sure to check 'Add Python to PATH' during installation" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# Check pip
Write-Host "[2/4] Checking pip..." -ForegroundColor Yellow

try {
    $pipVersion = pip --version 2>&1
    Write-Host "✓ pip is available" -ForegroundColor Green
} catch {
    Write-Host "✗ pip is not available" -ForegroundColor Red
    Write-Host "Attempting to install pip..." -ForegroundColor Yellow
    python -m ensurepip --default-pip
}

Write-Host ""

# Install dependencies
Write-Host "[3/4] Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host ""
    pause
    exit 1
}

Write-Host ""

# Create desktop shortcut (optional)
Write-Host "[4/4] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To run EquipTrack:" -ForegroundColor Cyan
Write-Host "  Option 1: Double-click 'run.bat'" -ForegroundColor White
Write-Host "  Option 2: Run 'python main.py' in PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "Default login credentials:" -ForegroundColor Yellow
Write-Host "  Email: admin@equiptrack.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""

$runNow = Read-Host "Would you like to run EquipTrack now? (Y/N)"

if ($runNow -eq "Y" -or $runNow -eq "y") {
    Write-Host ""
    Write-Host "Starting EquipTrack..." -ForegroundColor Green
    Write-Host ""
    python main.py
} else {
    Write-Host ""
    Write-Host "You can run EquipTrack anytime by double-clicking run.bat" -ForegroundColor Cyan
    Write-Host ""
}

pause
