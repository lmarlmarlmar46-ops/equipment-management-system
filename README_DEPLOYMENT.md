# EquipTrack - Deployment Guide

## 🎯 Your Workflow

```
┌─────────────────────────────────────────────────────────┐
│  LOCAL (Your Computer)                                  │
│  C:\Users\holog\OneDrive\Desktop\EquipTrack           │
│                                                         │
│  1. Make changes to code                               │
│  2. Run: push-to-github.bat "Fixed XYZ"               │
│     ↓                                                  │
└─────┼───────────────────────────────────────────────────┘
      │
      │ git push
      ↓
┌─────────────────────────────────────────────────────────┐
│  GITHUB (Code Repository)                               │
│  https://github.com/YOUR_USERNAME/equiptrack           │
│                                                         │
│  Stores your code                                      │
│     ↓                                                  │
└─────┼───────────────────────────────────────────────────┘
      │
      │ webhook trigger
      ↓
┌─────────────────────────────────────────────────────────┐
│  RAILWAY (Hosting)                                      │
│  https://railway.app                                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Backend    │  │   Frontend   │  │  PostgreSQL  │ │
│  │   Node.js    │  │    React     │  │   Database   │ │
│  │   Port 3001  │  │   Port 3000  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                         │
│  Auto-deploys when you push to GitHub! ✨              │
│     ↓                                                  │
└─────┼───────────────────────────────────────────────────┘
      │
      ↓
┌─────────────────────────────────────────────────────────┐
│  LIVE WEBSITE                                           │
│  https://frontend-production-xxx.railway.app           │
│                                                         │
│  Your users access the app here                        │
└─────────────────────────────────────────────────────────┘
```

## 📁 Files You Need to Know

```
EquipTrack/
├── 📘 START.md                    ← Read this FIRST
├── 📘 DEPLOY_TO_RAILWAY.md       ← Detailed deployment guide
├── 🔧 push-to-github.bat         ← Easy push helper
├── 🔧 .gitignore                 ← What NOT to push
│
├── backend/                       ← API server code
│   ├── src/                      ← Source code
│   ├── database/init.sql         ← Database setup
│   ├── package.json              ← Dependencies
│   └── .env.example              ← Config template
│
└── frontend/                      ← Website code
    ├── src/                      ← Source code
    ├── package.json              ← Dependencies
    └── .env.example              ← Config template
```

## 🎮 Commands You'll Use

### One-Time Setup

```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack

# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/equiptrack.git
git push -u origin main
```

Then deploy on Railway (see START.md)

### Daily Usage - Push Updates

```cmd
# Option 1: Manual
cd C:\Users\holog\OneDrive\Desktop\EquipTrack
git add .
git commit -m "Fixed bug in dashboard"
git push

# Option 2: Use helper (easier!)
push-to-github.bat "Fixed bug in dashboard"
```

Railway will automatically deploy your changes in 1-2 minutes!

## ✅ Setup Checklist

### GitHub Setup
- [ ] Created GitHub account
- [ ] Created `equiptrack` repository
- [ ] Pushed code to GitHub
- [ ] Can see code on GitHub website

### Railway Setup
- [ ] Created Railway account
- [ ] Created new project from GitHub
- [ ] Added PostgreSQL database
- [ ] Deployed backend service
- [ ] Deployed frontend service
- [ ] Ran database initialization SQL
- [ ] Set all environment variables
- [ ] Generated domains for both services
- [ ] Updated FRONTEND_URL in backend
- [ ] Updated VITE_API_URL in frontend

### Testing
- [ ] Can access frontend URL
- [ ] Login page loads
- [ ] Can login with admin@equiptrack.com
- [ ] Dashboard shows data
- [ ] No console errors

## 🔑 Important URLs to Save

After deployment, save these:

```
GitHub Repository:
https://github.com/YOUR_USERNAME/equiptrack

Railway Dashboard:
https://railway.app/project/YOUR_PROJECT_ID

Backend API:
https://backend-production-xxx.up.railway.app

Frontend Website:
https://frontend-production-xxx.up.railway.app

Admin Login:
Email: admin@equiptrack.com
Password: Admin123!
```

## 🐛 Troubleshooting

### "git push" doesn't work
- Make sure you're in the right folder: `cd C:\Users\holog\OneDrive\Desktop\EquipTrack`
- Run: `git remote -v` to check GitHub is connected
- If not: `git remote add origin https://github.com/YOUR_USERNAME/equiptrack.git`

### Railway deployment fails
1. Check Railway dashboard → Deployments → View logs
2. Common fixes:
   - Verify Root Directory is correct (`backend` or `frontend`)
   - Check environment variables are set
   - Make sure PostgreSQL is running

### Can't login to website
- Check backend is running (green in Railway)
- Database was initialized (ran init.sql)
- Environment variables are correct

### Website shows errors
1. Open browser console (F12)
2. Check error message
3. View Railway logs for backend
4. Make sure VITE_API_URL points to correct backend URL

## 💡 Tips

1. **Always test locally first** (if you set up local environment)
2. **Write clear commit messages** so you know what changed
3. **Check Railway logs** if something doesn't work
4. **Keep environment variables secure** - never commit .env files
5. **Monitor Railway usage** to avoid unexpected charges

## 📚 Documentation

- **START.md** - Quick start guide (read this first!)
- **DEPLOY_TO_RAILWAY.md** - Complete deployment steps
- **QUICKSTART.md** - Local + Railway setup
- **RUN_ON_WINDOWS.md** - Windows-specific instructions

## 🎓 Learn More

**Git Basics:**
- `git status` - See what changed
- `git add .` - Stage all changes
- `git commit -m "message"` - Save changes
- `git push` - Send to GitHub
- `git log` - See history

**Railway:**
- Automatic deploys on `git push`
- View logs in real-time
- Manage environment variables
- Monitor usage and costs

## 🚀 Next Steps

1. ✅ Deploy to Railway (follow START.md)
2. 📝 Change admin password
3. 🎨 Customize branding
4. 👥 Add more users
5. 📊 Set up email notifications
6. 🔒 Set up custom domain (optional)

---

**Need Help?**

1. Read START.md for quick guide
2. Read DEPLOY_TO_RAILWAY.md for detailed steps
3. Check Railway logs for errors
4. Review this checklist

**You've got this! 🎉**
