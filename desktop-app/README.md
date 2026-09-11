# EquipTrack Desktop Application

A complete Python desktop application for IT asset and work assignment management built with PyQt6.

## Features

✅ **User Authentication** - Secure login with bcrypt password hashing
✅ **Work Assignments** - Managers assign tasks, employees accept/reject/complete
✅ **Real-time Notifications** - Get notified about new assignments and updates
✅ **User Management** - Admin/Manager role-based user promotion/demotion
✅ **Dark Theme UI** - Modern, professional GitHub-inspired dark interface
✅ **SQLite Database** - Local database, no server required
✅ **Cross-platform** - Works on Windows, macOS, and Linux

## Screenshots

- Login screen with demo account info
- Work Assignments with tabs (All, Pending, Accepted, Completed)
- User list for managers to assign work
- Notifications panel
- User Management with role changes

## Installation

### Prerequisites

**Install Python 3.9 or higher:**
- Download from: https://www.python.org/downloads/
- **CRITICAL**: Check "Add Python to PATH" during installation
- Restart your terminal after installation

### Quick Install (3 Commands)

Open PowerShell and run:

```powershell
cd C:\Users\holog\OneDrive\Desktop\EquipTrack\desktop-app

python check_requirements.py

python main.py
```

That's it! The check_requirements.py script will auto-install missing packages.

### Manual Install

If you prefer manual installation:

```powershell
pip install PyQt6 bcrypt python-dateutil
python main.py
```

## Usage

### Login

**Default Admin Account:**
- Email: `admin@equiptrack.com`
- Password: `admin123`

### For Managers/Admins

1. **Assign Work:**
   - View "Available Users" table at the bottom
   - Click "Assign Work" button next to any user
   - Fill in task details (description, department, location, priority, notes)
   - Click "Assign" to send the work assignment

2. **Manage Users:**
   - Click "User Management" in the sidebar
   - Change user roles using the dropdown (employee → manager → admin)
   - Only admins can promote to admin role

3. **Monitor Assignments:**
   - Use tabs to filter: All, Pending, Accepted, Completed
   - See real-time status updates
   - Get notified when employees respond

### For Employees

1. **View Assignments:**
   - See all your assigned work in "Work Assignments"
   - Filter by status using tabs

2. **Respond to Assignments:**
   - **Pending**: Accept or Reject (with reason)
   - **Accepted**: Start Work
   - **In Progress**: Mark as Complete

3. **Check Notifications:**
   - Bell icon shows unread notification count
   - Click to view new assignments and updates

## File Structure

```
desktop-app/
├── main.py                 # Main application window
├── database.py            # SQLite database handler
├── login_window.py        # Login interface
├── work_assignments.py    # Work assignment management
├── user_management.py     # User role management
├── notifications.py       # Notification panel
├── requirements.txt       # Python dependencies
├── README.md             # This file
└── equiptrack.db         # Database file (created on first run)
```

## Database Schema

### Tables

**users:**
- id, username, email, password_hash, role, status, phone, department, created_at, last_login

**work_assignments:**
- id, assigned_to, assigned_by, task_description, department, location, priority, status, due_date, notes, rejection_reason, accepted_at, completed_at, created_at, updated_at

**notifications:**
- id, user_id, type, title, message, is_read, action_url, created_at

**equipment:**
- id, name, category, brand, model, serial_number, purchase_date, purchase_price, status, condition, notes, created_at

**allocations:**
- id, equipment_id, user_id, allocated_date, expected_return_date, actual_return_date, status, notes, created_at

## Creating an Executable (.exe)

To create a standalone executable that doesn't require Python:

1. **Install PyInstaller:**
   ```powershell
   pip install pyinstaller
   ```

2. **Create the executable:**
   ```powershell
   pyinstaller --onefile --windowed --name EquipTrack --icon=icon.ico main.py
   ```

3. **Find the executable:**
   - Located in `dist/EquipTrack.exe`
   - Double-click to run without Python installed

## Troubleshooting

### "Python was not found"
- Install Python from python.org
- Make sure "Add Python to PATH" was checked during installation
- Restart PowerShell after installation

### "No module named PyQt6"
- Run: `pip install -r requirements.txt`
- If that fails: `pip install PyQt6 bcrypt python-dateutil`

### Database errors
- Delete `equiptrack.db` file and restart the app
- A new database will be created with the default admin account

### Permission errors
- Run PowerShell as Administrator
- Or move the desktop-app folder to a location without restrictions

## Keyboard Shortcuts

- **Ctrl+Q**: Quit application
- **Enter**: Submit login form
- **Esc**: Close dialogs

## Security

- Passwords are hashed with bcrypt (salt rounds: 12)
- SQL injection protected with parameterized queries
- Role-based access control for all operations
- Session management with automatic logout

## Future Enhancements

Potential features to add:
- Equipment inventory tracking
- Barcode/QR code scanning
- Export to Excel/PDF reports
- Email notifications
- Automatic backup
- Multi-language support
- Calendar view for assignments

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Verify all dependencies are installed
3. Check Python version is 3.9+

## License

MIT License - Free to use and modify

## Credits

Built with:
- PyQt6 - Modern Qt bindings for Python
- SQLite - Embedded database
- bcrypt - Password hashing
- python-dateutil - Date handling

---

**Version:** 1.0.0  
**Last Updated:** September 11, 2026  
**Author:** EquipTrack Development Team
