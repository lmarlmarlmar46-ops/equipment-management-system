#!/usr/bin/env python3
"""
EquipTrack - Requirement Checker
Checks if all dependencies are installed
"""

import sys
import subprocess

print("=" * 50)
print("  EquipTrack - Checking Requirements")
print("=" * 50)
print()

# Check Python version
print("[1/4] Checking Python version...")
if sys.version_info < (3, 9):
    print(f"❌ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    print("   Python 3.9 or higher is required")
    print("   Download from: https://www.python.org/downloads/")
    sys.exit(1)
else:
    print(f"✓ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")
print()

# Check pip
print("[2/4] Checking pip...")
try:
    import pip
    print(f"✓ pip is available")
except ImportError:
    print("❌ pip is not installed")
    sys.exit(1)
print()

# Check required packages
print("[3/4] Checking required packages...")
required_packages = {
    'PyQt6': 'PyQt6',
    'bcrypt': 'bcrypt',
    'dateutil': 'python-dateutil'
}

missing_packages = []

for module_name, package_name in required_packages.items():
    try:
        __import__(module_name)
        print(f"✓ {package_name}")
    except ImportError:
        print(f"❌ {package_name} - NOT INSTALLED")
        missing_packages.append(package_name)

print()

if missing_packages:
    print("[4/4] Installing missing packages...")
    print()
    for package in missing_packages:
        print(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✓ {package} installed successfully")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            print(f"   Try manually: pip install {package}")
    print()
else:
    print("[4/4] All packages installed!")
    print()

print("=" * 50)
print("  Setup Complete!")
print("=" * 50)
print()
print("To run EquipTrack:")
print("  python main.py")
print()
print("Default login:")
print("  Email: admin@equiptrack.com")
print("  Password: admin123")
print()
