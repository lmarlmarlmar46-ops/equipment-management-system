# 🎯 EquipTrack - IT Asset & Work Assignment Management

A complete dual-platform solution for managing IT equipment, work assignments, and employee collaboration.

## 🚀 Two Applications in One

### 1️⃣ Web Application (Cloud-Based) ☁️
- **Live URL:** https://equipment-management-system-9fq3.vercel.app
- **Tech Stack:** React, Node.js, PostgreSQL
- **Hosting:** Vercel (frontend) + Railway (backend)
- **Perfect for:** Remote teams, anywhere access, real-time collaboration

### 2️⃣ Desktop Application (Offline-Ready) 💻
- **Platform:** Windows, macOS, Linux
- **Tech Stack:** Python, PyQt6, SQLite
- **Location:** `desktop-app/` folder
- **Perfect for:** Offline work, faster performance, no internet required

---

## 📁 Project Structure

```
EquipTrack/
├── backend/              # Node.js API (for web app)
│   ├── routes/           # API endpoints
│   ├── models/           # Data models
│   ├── middleware/       # Auth middleware
│   └── server.js         # Main server
├── frontend/             # React web app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page views
│   │   └── context/      # Auth context
│   └── public/           # Static files
├── desktop-app/          # Python desktop application ⭐
│   ├── main.py           # 🚀 Run this to start
│   ├── database.py       # SQLite database
│   ├── work_assignments.py  # Assignment manager
│   ├── user_management.py   # Role management
│   ├── notifications.py     # Notification system
│   ├── check_requirements.py  # Auto-installer
│   ├── requirements.txt     # Dependencies
│   ├── README.md           # Desktop docs
│   └── QUICKSTART.md       # Quick setup guide
├── COMPLETE_SUMMARY.md   # 📖 Full project documentation
├── DATABASE_SETUP.md     # Database configuration
└── DEMO_ACCOUNTS.md      # Login credentials
```

---

## ⚡ Quick Start

### Option 1: Web App (Already Live)
Just visit: **https://equipment-management-system-9fq3.vercel.app**

**Demo Login:**
- Admin: `admin@equiptrack.com` / `admin123`
- Manager: `manager@equiptrack.com` / `manager123`
- Employee: `employee@equiptrack.com` / `employee123`

### Option 2: Desktop App (3 Commands)
```powershell
cd desktop-app
python check_requirements.py
python main.py
```

**First Login:** `admin@equiptrack.com` / `admin123`

---

## ✨ Core Features

### 👤 User & Role Management
- **3 Role Types:** Employee, Manager, Admin
- **Role Permissions:** Hierarchical access control
- **User Status:** Active/Inactive tracking
- **Profile Management:** Edit email, password, role

### 📋 Work Assignment System
- **Create Assignments:** Assign tasks to any user
- **Status Tracking:** Pending → Accepted → Completed
- **Real-time Notifications:** Get notified instantly
- **Assignment Details:** Action, department, location, deadline
- **Accept/Reject:** Employees can respond to assignments
- **Contact Options:** Call or email assignee directly

### 🔔 Notification System
- **Real-time Alerts:** New assignments, status changes
- **Notification Bell:** Visual indicator with count
- **Mark as Read:** Clear notifications after viewing
- **Persistent Storage:** Never miss an update

### 💻 Equipment & Asset Tracking
- **Equipment Management:** Add, edit, delete equipment
- **Allocation Tracking:** Track who has what
- **Status Monitoring:** Available, allocated, maintenance
- **Equipment Categories:** Organize by type
- **Serial Numbers:** Unique identification

### 📊 Dashboard & Analytics
- **Quick Stats:** Equipment, users, allocations
- **Visual Charts:** Equipment distribution
- **Active Monitoring:** Real-time status overview
- **Department Tracking:** See team distribution

---

## 🛠️ Development Setup

### Web App Development

**Backend:**
```bash
cd backend
npm install
npm start  # Runs on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

### Desktop App Development

```bash
cd desktop-app
pip install -r requirements.txt
python main.py
```

**Requirements:**
- Python 3.9 or higher
- PyQt6
- bcrypt
- python-dateutil

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [COMPLETE_SUMMARY.md](./COMPLETE_SUMMARY.md) | Full project guide |
| [desktop-app/README.md](./desktop-app/README.md) | Desktop app documentation |
| [desktop-app/QUICKSTART.md](./desktop-app/QUICKSTART.md) | Quick installation guide |
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Database configuration |
| [DEMO_ACCOUNTS.md](./DEMO_ACCOUNTS.md) | Test account credentials |
| [FEATURES_ADDED.md](./FEATURES_ADDED.md) | Feature changelog |

---

## 🎨 Tech Stack

### Web Application
**Frontend:**
- React 18 with Hooks
- Vite (build tool)
- React Router (routing)
- Axios (API calls)
- CSS3 (styling)

**Backend:**
- Node.js + Express
- PostgreSQL (database)
- JWT (authentication)
- bcrypt (password hashing)
- CORS enabled

**Deployment:**
- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

### Desktop Application
**Framework:**
- PyQt6 (GUI)
- SQLite (local database)
- bcrypt (security)
- Python 3.9+

**Architecture:**
- Model-View pattern
- Separate modules per feature
- Auto-installer for dependencies
- Cross-platform compatible

---

## 🔐 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Protected API routes
- ✅ Secure session management
- ✅ SQL injection prevention
- ✅ XSS protection

---

## 🎯 User Roles & Permissions

### 👨‍💼 Admin
- Full system access
- User management (create, edit, delete, promote, demote)
- Assign work to anyone
- View all assignments
- Manage equipment and allocations

### 👔 Manager
- Assign work to employees
- View team assignments
- Cannot promote/demote users
- Manage equipment
- View reports

### 👤 Employee
- View own assignments
- Accept/reject assignments
- Update assignment status
- View own equipment
- **Cannot** promote/demote users
- **Cannot** assign work to others

---

## 🚦 Work Assignment Workflow

1. **Manager/Admin creates assignment**
   - Selects employee
   - Specifies: action, department, location, deadline
   - Option to call/email employee

2. **Employee receives notification**
   - Notification bell shows count
   - Opens notification panel

3. **Employee responds**
   - Accepts assignment → Status: Accepted
   - Rejects assignment → Status: Pending (reassignable)

4. **Employee completes work**
   - Updates status to Completed
   - Manager/Admin can see completion

5. **Tracking & History**
   - All assignments logged
   - Filter by status (Pending/Accepted/Completed)
   - Search by employee name

---

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/users` - Get all users (protected)
- `PUT /auth/users/:id` - Update user (admin only)
- `DELETE /auth/users/:id` - Delete user (admin only)

### Work Assignments
- `GET /work-assignments` - Get all assignments
- `GET /work-assignments/:id` - Get specific assignment
- `GET /work-assignments/user/:userId` - Get user's assignments
- `POST /work-assignments` - Create assignment
- `PUT /work-assignments/:id` - Update assignment
- `PUT /work-assignments/:id/status` - Update status
- `DELETE /work-assignments/:id` - Delete assignment

### Notifications
- `GET /notifications/:userId` - Get user notifications
- `POST /notifications` - Create notification
- `PUT /notifications/:id/read` - Mark as read
- `DELETE /notifications/:id` - Delete notification

### Equipment
- `GET /equipment` - Get all equipment
- `POST /equipment` - Create equipment
- `PUT /equipment/:id` - Update equipment
- `DELETE /equipment/:id` - Delete equipment

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

---

## 🐛 Troubleshooting

### Web App Issues

**Backend won't start:**
- Check Node.js version: `node --version` (need 16+)
- Port 5000 already in use → Change in `server.js`
- Missing dependencies → Run `npm install`

**Frontend won't start:**
- Check Node.js version
- Port conflict → Change in `vite.config.js`
- Clear node_modules → `rm -rf node_modules && npm install`

**Login fails:**
- Check backend is running
- Verify database connection
- Check browser console for errors

### Desktop App Issues

**App won't start:**
- Check Python version: `python --version` (need 3.9+)
- Missing dependencies → Run `python check_requirements.py`
- PyQt6 issues → Try `pip install --upgrade PyQt6`

**Database errors:**
- Delete `equiptrack.db` → Will recreate on restart
- Check write permissions in desktop-app folder

**Login fails:**
- Default: `admin@equiptrack.com` / `admin123`
- Check `equiptrack.db` exists
- Try deleting and recreating database

---

## 📈 Future Enhancements

- [ ] Email integration for notifications
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Equipment QR code scanning
- [ ] Advanced reporting dashboard
- [ ] Export to Excel/PDF
- [ ] Calendar integration
- [ ] File attachments for assignments
- [ ] Equipment maintenance scheduling
- [ ] Multi-language support

---

## 📝 License

MIT License - Free to use and modify for your organization.

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

---

## 📧 Support

For questions or issues:
1. Check documentation in `COMPLETE_SUMMARY.md`
2. Review `desktop-app/README.md` for desktop app help
3. Open an issue on GitHub

---

**Built with ❤️ for efficient team management**

🌐 **Live Demo:** https://equipment-management-system-9fq3.vercel.app

💻 **Desktop App:** Ready to install in `desktop-app/` folder
