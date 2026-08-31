# 🚀 EquipTrack - Deploy to Railway

## What You'll Do

1. Push code to GitHub (one time)
2. Deploy on Railway (one time setup)
3. Use CMD to push updates when you need to fix things

---

## Step 1: Push to GitHub

Open CMD:

```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack

git init
git add .
git commit -m "Initial commit"
```

Go to https://github.com/new and create repo named `equiptrack`

Then:
```cmd
git remote add origin https://github.com/YOUR_USERNAME/equiptrack.git
git branch -M main
git push -u origin main
```

✅ **Done! Code is on GitHub**

---

## Step 2: Deploy on Railway

### A. Create Project
1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your `equiptrack` repo

### B. Add PostgreSQL
1. "+ New" → "Database" → "Add PostgreSQL"
2. Wait for it to deploy

### C. Setup Backend
1. "+ New" → "GitHub Repo" → `equiptrack`
2. Click on service → Settings:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. Variables tab, add:
```
NODE_ENV=production
PORT=3001
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-random-32-char-string-here
JWT_REFRESH_SECRET=another-random-32-char-string
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=temporary
```
4. Settings → Networking → "Generate Domain"
5. **Copy backend URL!**

### D. Initialize Database
1. Click PostgreSQL → "Data" → "Query"
2. Copy everything from `backend/database/init.sql`
3. Paste and "Run Query"

### E. Setup Frontend
1. "+ New" → "GitHub Repo" → `equiptrack`
2. Click on service → Settings:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx vite preview --port $PORT --host`
3. Variables tab:
```
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```
4. Settings → Networking → "Generate Domain"
5. **Copy frontend URL!**

### F. Update Backend
1. Go to backend service → Variables
2. Update `FRONTEND_URL` with frontend URL
3. Wait for redeploy

✅ **Done! App is live!**

Open your frontend URL and login:
- Email: `admin@equiptrack.com`
- Password: `Admin123!`

---

## Step 3: Making Updates

When you fix something:

```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack

REM Method 1: Manual
git add .
git commit -m "Fixed bug"
git push

REM Method 2: Use helper script
push-to-github.bat "Fixed bug"
```

Railway auto-deploys! ✨

---

## Quick Reference

**GitHub:** https://github.com/YOUR_USERNAME/equiptrack
**Railway:** https://railway.app
**Your App:** https://frontend-production-xxx.railway.app

**Push updates:**
```cmd
push-to-github.bat "Your fix description"
```

**That's it!** 🎉

See **DEPLOY_TO_RAILWAY.md** for detailed guide.
