# 🎯 EquipTrack - Desktop Work Assignment Manager

A professional desktop application for managing work assignments, user roles, and team collaboration.

## 💻 Desktop Application

**Platform:** Windows, macOS, Linux  
**Tech Stack:** Python, PyQt6, SQLite  
**Status:** Production Ready ✅

---

## ⚡ Quick Start (3 Commands)

```powershell
cd desktop-app
python check_requirements.py
python main.py
```

**First Login:**  
📧 Email: `admin@equiptrack.com`  
🔑 Password: `admin123`

---

## 📁 Project Structure

```
EquipTrack/
├── desktop-app/              # Main application folder
│   ├── main.py               # 🚀 Run this to start
│   ├── database.py           # SQLite database
│   ├── login_window.py       # Login screen
│   ├── work_assignments.py   # Assignment manager
│   ├── user_management.py    # Role management
│   ├── notifications.py      # Notification system
│   ├── check_requirements.py # Auto-installer
│   ├── requirements.txt      # Dependencies
│   ├── README.md             # Full documentation
│   ├── QUICKSTART.md         # Installation guide
│   └── equiptrack.db         # Database (auto-created)
├── README.md                 # This file
├── COMPLETE_SUMMARY.md       # Project history
└── FEATURES_ADDED.md         # Feature changelog
```

---

## ✨ Features

### 👤 User & Role Management
- **3 Role Types:** Employee, Manager, Admin
- **Role Permissions:** Hierarchical access control
- **User Status:** Active/Inactive tracking
- **Profile Management:** Edit email, password, role (admin only)

### 📋 Work Assignment System
- **Create Assignments:** Assign tasks to any user
- **Status Tracking:** Pending → Accepted → Completed
- **Assignment Details:** Action, department, location, deadline
- **Accept/Reject:** Employees can respond to assignments
- **Contact Options:** Call or email assignee directly
- **Search & Filter:** Find assignments by status or user

### 🔔 Notification System
- **Real-time Alerts:** New assignments, status changes
- **Notification Panel:** View all notifications in one place
- **Mark as Read:** Clear notifications after viewing
- **Persistent Storage:** Never miss an update

### 💾 Data Management
- **SQLite Database:** Fast, reliable, local storage
- **No Server Required:** 100% offline capable
- **Automatic Backups:** Database stored in app folder
- **Data Privacy:** All data stays on your computer

---

## 🛠️ Installation

### Requirements
- **Python 3.9 or higher**
- **Operating System:** Windows, macOS, or Linux

### Step 1: Check Python
```bash
python --version
```
Should show Python 3.9 or higher.

### Step 2: Install & Run
```bash
cd desktop-app
python check_requirements.py  # Auto-installs dependencies
python main.py               # Launches the app
```

The `check_requirements.py` script automatically installs:
- PyQt6 (GUI framework)
- bcrypt (password security)
- python-dateutil (date handling)

---

## 🎨 User Interface

### Main Window
```
┌─────────────────────────────────────────────┐
│  EquipTrack - IT Asset Management           │
├──────────┬──────────────────────────────────┤
│ Sidebar  │  Content Area                    │
│          │                                   │
│ 📋 Work  │  ┌──────────────────────────┐   │
│    Assign│  │ Work Assignments         │   │
│          │  ├──────────────────────────┤   │
│ 👥 User  │  │ All | Pending | Accepted │   │
│    Mgmt  │  │     | Completed          │   │
│          │  ├──────────────────────────┤   │
│ 🔔 Notif │  │ Assignment List          │   │
│          │  │ - Employee Name          │   │
│ 🚪 Logout│  │ - Action & Department    │   │
│          │  │ - Status & Date          │   │
│          │  └──────────────────────────┘   │
└──────────┴──────────────────────────────────┘
```

### Features by Screen

**Work Assignments:**
- View all assignments in table format
- Filter by status tabs
- Create new assignment (button)
- Accept/Reject assignments
- Mark as completed
- Search assignments

**User Management:**
- View all users
- Add new users
- Edit roles (Admin/Manager/Employee)
- Activate/Deactivate users
- Delete users (admin only)

**Notifications:**
- Unread notification count
- List of all notifications
- Mark individual or all as read
- Clear notifications

---

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Secure session management
- ✅ SQL injection prevention
- ✅ Local data storage (no cloud)

---

## 🎯 User Roles & Permissions

### 👨‍💼 Admin (Full Access)
- ✅ Create, edit, delete users
- ✅ Promote/demote user roles
- ✅ Assign work to anyone
- ✅ View all assignments
- ✅ Accept/reject own assignments
- ✅ Complete own assignments

### 👔 Manager (Team Management)
- ✅ Assign work to employees
- ✅ View all assignments
- ✅ Accept/reject own assignments
- ✅ Complete own assignments
- ❌ Cannot promote/demote users
- ❌ Cannot delete users

### 👤 Employee (Basic Access)
- ✅ View own assignments
- ✅ Accept/reject assignments
- ✅ Mark assignments as completed
- ✅ View notifications
- ❌ Cannot assign work
- ❌ Cannot manage users
- ❌ Cannot promote/demote

---

## 🚦 Work Assignment Workflow

1. **Manager/Admin creates assignment**
   ```
   - Select employee from dropdown
   - Enter action description
   - Choose department
   - Specify location
   - Set deadline
   - Add optional notes
   - Click "Create Assignment"
   ```

2. **Employee receives notification**
   ```
   - Notification bell shows red dot + count
   - Opens notification panel
   - Clicks notification to view details
   ```

3. **Employee responds**
   ```
   - Views assignment in Work Assignments
   - Clicks "Accept" or "Reject"
   - Status updates to "Accepted" or back to "Pending"
   ```

4. **Employee completes work**
   ```
   - After finishing the task
   - Clicks "Mark Complete"
   - Status updates to "Completed"
   - Manager/Admin sees completion
   ```

5. **Tracking & History**
   ```
   - All assignments logged in database
   - Filter by status (tabs)
   - Search by employee name
   - View assignment timeline
   ```

---

## 🐛 Troubleshooting

### App won't start
**Problem:** `python: command not found`  
**Solution:** Install Python 3.9+ from python.org

**Problem:** Missing dependencies  
**Solution:** Run `python check_requirements.py`

**Problem:** PyQt6 installation fails  
**Solution:** Try `pip install --upgrade pip` then retry

### Login fails
**Problem:** Can't login with admin@equiptrack.com  
**Solution:** Delete `equiptrack.db` and restart app (recreates database)

**Problem:** Forgot password  
**Solution:** Delete `equiptrack.db` to reset (creates new admin account)

### Database errors
**Problem:** Database locked  
**Solution:** Close all instances of the app, then restart

**Problem:** Corrupted database  
**Solution:** Backup `equiptrack.db`, delete it, restart app

### Display issues
**Problem:** Window too small/large  
**Solution:** Resize window and restart (settings saved)

**Problem:** Blurry text on high-DPI displays  
**Solution:** App auto-detects DPI, try restarting

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [desktop-app/README.md](./desktop-app/README.md) | Full technical documentation |
| [desktop-app/QUICKSTART.md](./desktop-app/QUICKSTART.md) | Installation guide |
| [COMPLETE_SUMMARY.md](./COMPLETE_SUMMARY.md) | Project development history |
| [FEATURES_ADDED.md](./FEATURES_ADDED.md) | Feature changelog |

---

## 💡 Usage Tips

1. **First Time Setup:**
   - Login as admin
   - Go to User Management
   - Add managers and employees
   - Start creating assignments

2. **Creating Assignments:**
   - Be specific in action description
   - Set realistic deadlines
   - Use notes for additional context

3. **Managing Users:**
   - Set users to "Inactive" instead of deleting
   - Inactive users can't login but data is preserved
   - Promote employees to managers as needed

4. **Notifications:**
   - Check bell icon regularly
   - Mark as read to clear count
   - Notifications persist until cleared

5. **Database Backup:**
   - Copy `equiptrack.db` regularly
   - Store backups in safe location
   - Restore by replacing the file

---

## 🔧 Development

### Running from Source
```bash
cd desktop-app
pip install -r requirements.txt
python main.py
```

### Database Schema
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT,
    is_active INTEGER,
    created_at TIMESTAMP
);

-- Work Assignments table
CREATE TABLE work_assignments (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    action TEXT,
    department TEXT,
    location TEXT,
    deadline TEXT,
    status TEXT,
    notes TEXT,
    created_at TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    message TEXT,
    is_read INTEGER,
    created_at TIMESTAMP
);
```

### File Structure
```
main.py              - Main window + navigation
login_window.py      - Authentication screen
work_assignments.py  - Assignment management UI
user_management.py   - User/role management UI
notifications.py     - Notification panel UI
database.py          - SQLite operations
```

---

## 📈 Future Enhancements

- [ ] Export assignments to Excel/PDF
- [ ] Calendar view for deadlines
- [ ] Email notifications
- [ ] File attachments for assignments
- [ ] Assignment templates
- [ ] Advanced search filters
- [ ] Dark/light theme toggle
- [ ] Multi-language support
- [ ] Assignment statistics/reports
- [ ] Equipment tracking module

---

## 📝 License

MIT License - Free to use and modify.

---

## 🤝 Contributing

Contributions welcome! Feel free to submit issues or pull requests.

---

## 📧 Support

For questions or issues:
1. Check [desktop-app/README.md](./desktop-app/README.md)
2. Review [desktop-app/QUICKSTART.md](./desktop-app/QUICKSTART.md)
3. Open an issue on GitHub

---

**Ready to get started?** 🚀

```bash
cd desktop-app
python check_requirements.py
python main.py
```

**Login:** `admin@equiptrack.com` / `admin123`
