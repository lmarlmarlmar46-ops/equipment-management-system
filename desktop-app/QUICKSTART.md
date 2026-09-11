# EquipTrack Desktop App - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Python

1. Download Python from: https://www.python.org/downloads/
2. Run the installer
3. **✅ IMPORTANT**: Check "Add Python to PATH"
4. Click "Install Now"

### Step 2: Install & Run

**Method A - Automatic (Recommended):**
1. Double-click `install.ps1`
2. If you see a security warning, click "Run anyway"
3. Follow the prompts
4. The app will start automatically

**Method B - Manual:**
1. Open PowerShell in this folder
2. Run: `pip install -r requirements.txt`
3. Run: `python main.py`

**Method C - Using Batch File:**
1. Double-click `run.bat`
2. The app will check dependencies and start

### Step 3: Login

**Default Admin Account:**
- **Email:** admin@equiptrack.com
- **Password:** admin123

---

## 📖 Quick Feature Guide

### For Managers/Admins

**Assign Work:**
1. Go to "Work Assignments"
2. Scroll to "Available Users" table
3. Click "Assign Work" next to any user
4. Fill in task details:
   - Task description (required)
   - Department
   - Location
   - Priority (low/medium/high/urgent)
   - Notes
5. Click "Assign"

**Manage Users:**
1. Click "User Management" in sidebar
2. Change roles using dropdown:
   - Employee → Manager → Admin
3. Managers cannot promote to Admin

**Monitor Progress:**
- Use tabs: All | Pending | Accepted | Completed
- See colored status badges
- Get notifications when employees respond

### For Employees

**Handle Assignments:**

**Pending:**
- ✅ Accept - Take the assignment
- ❌ Reject - Decline with reason

**Accepted:**
- ▶️ Start Work - Begin the task

**In Progress:**
- ✔️ Complete - Mark as done

**View Notifications:**
- Check the bell icon for new assignments
- Get notified about updates

---

## 🎨 UI Color Guide

**Status Colors:**
- 🟡 Yellow = Pending
- 🔵 Blue = Accepted
- 🟢 Green = Completed
- 🔴 Red = Rejected

**Priority Colors:**
- 🟢 Green = Low priority
- 🟡 Yellow = Medium priority
- 🟠 Orange = High priority
- 🔴 Red = Urgent

---

## 🔧 Troubleshooting

**"Python was not found"**
- Solution: Install Python and check "Add to PATH"
- Restart PowerShell after installation

**"No module named PyQt6"**
- Solution: Run `pip install -r requirements.txt`

**App won't start**
- Solution: Delete `equiptrack.db` and restart

**Can't assign work**
- Solution: Make sure you're logged in as Admin or Manager

---

## 💡 Tips & Tricks

1. **Keyboard Shortcuts:**
   - Enter = Submit login
   - Esc = Close dialogs

2. **Database Location:**
   - File: `equiptrack.db` in this folder
   - Backup: Copy this file to keep your data

3. **Multiple Users:**
   - Register new users through User Management
   - Default password: (set your own)

4. **Creating Executable:**
   ```powershell
   pip install pyinstaller
   pyinstaller --onefile --windowed --name EquipTrack main.py
   ```
   - Find exe in `dist/` folder

---

## 📞 Need Help?

1. Check README.md for detailed documentation
2. Look in the Troubleshooting section
3. Verify Python version: `python --version` (need 3.9+)

---

**First Time Users:**
1. Login with admin@equiptrack.com / admin123
2. Go to User Management
3. Add your team members
4. Start assigning work!

**Enjoy using EquipTrack! 🎉**
