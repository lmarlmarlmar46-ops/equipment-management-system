# ✅ EquipTrack Deployment Checklist

Print this and check off as you go!

---

## 📝 BEFORE YOU START

- [ ] I have Node.js installed (`node --version` works)
- [ ] I have Git installed (`git --version` works)
- [ ] I have a GitHub account
- [ ] I have a Railway account

---

## 🔷 PART 1: PUSH TO GITHUB (5 minutes)

### Open CMD and navigate:
```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack
```

### Commands to run:
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`

### On GitHub:
- [ ] Created new repo: https://github.com/new
- [ ] Named it: `equiptrack`
- [ ] Kept it Private

### Back in CMD:
- [ ] `git remote add origin https://github.com/YOUR_USERNAME/equiptrack.git`
- [ ] `git branch -M main`
- [ ] `git push -u origin main`
- [ ] Code is now on GitHub (check the website)

---

## 🔷 PART 2: DEPLOY ON RAILWAY (15 minutes)

### Create Project:
- [ ] Went to https://railway.app
- [ ] Clicked "New Project"
- [ ] Selected "Deploy from GitHub repo"
- [ ] Connected GitHub account
- [ ] Selected `equiptrack` repository

### Add Database:
- [ ] Clicked "+ New"
- [ ] Selected "Database" → "Add PostgreSQL"
- [ ] PostgreSQL service created (green checkmark)
- [ ] Clicked on PostgreSQL → "Connect" tab
- [ ] **Copied the DATABASE_URL** (saved it somewhere)

### Setup Backend:
- [ ] Clicked "+ New" → "GitHub Repo" → `equiptrack`
- [ ] Backend service created
- [ ] Clicked on backend service

#### Settings Configuration:
- [ ] Settings → Root Directory: `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`

#### Environment Variables:
- [ ] Clicked "Variables" tab
- [ ] Added `NODE_ENV` = `production`
- [ ] Added `PORT` = `3001`
- [ ] Added `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`
- [ ] Added `JWT_SECRET` = (generated random 32 chars)
- [ ] Added `JWT_REFRESH_SECRET` = (generated different random 32 chars)
- [ ] Added `JWT_EXPIRES_IN` = `1h`
- [ ] Added `JWT_REFRESH_EXPIRES_IN` = `7d`
- [ ] Added `FRONTEND_URL` = `temporary` (will update later)

#### Get Backend URL:
- [ ] Settings → Networking → "Generate Domain"
- [ ] **Copied backend URL** (saved it)
- [ ] Backend is deploying (green checkmark when done)

### Initialize Database:
- [ ] Clicked on PostgreSQL service
- [ ] Clicked "Data" tab
- [ ] Clicked "Query" button
- [ ] Opened `C:\Users\holog\OneDrive\Desktop\EquipTrack\backend\database\init.sql` in Notepad
- [ ] Copied ALL contents (Ctrl+A, Ctrl+C)
- [ ] Pasted into Railway query editor
- [ ] Clicked "Run Query"
- [ ] Query executed successfully

### Setup Frontend:
- [ ] Clicked "+ New" → "GitHub Repo" → `equiptrack`
- [ ] Frontend service created
- [ ] Clicked on frontend service

#### Settings Configuration:
- [ ] Settings → Root Directory: `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx vite preview --port $PORT --host`

#### Environment Variables:
- [ ] Clicked "Variables" tab
- [ ] Added `VITE_API_URL` = `https://your-backend-url.railway.app/api/v1`
  - **Used actual backend URL from earlier!**

#### Get Frontend URL:
- [ ] Settings → Networking → "Generate Domain"
- [ ] **Copied frontend URL** (saved it)
- [ ] Frontend is deploying (green checkmark when done)

### Update Backend with Frontend URL:
- [ ] Went back to Backend service
- [ ] Clicked "Variables" tab
- [ ] Updated `FRONTEND_URL` with actual frontend URL
- [ ] Backend redeployed automatically
- [ ] All services show green checkmarks

---

## 🔷 PART 3: TEST YOUR APP (5 minutes)

### Access Website:
- [ ] Opened frontend URL in browser: `https://frontend-production-xxx.railway.app`
- [ ] Login page loaded successfully
- [ ] No errors in browser console (F12)

### Login:
- [ ] Entered email: `admin@equiptrack.com`
- [ ] Entered password: `Admin123!`
- [ ] Clicked "Sign in"
- [ ] Login successful!

### Dashboard:
- [ ] Dashboard loaded
- [ ] Stats show numbers
- [ ] Navigation menu works
- [ ] Can click between pages

### Test Features:
- [ ] Clicked "Equipment" - page loads
- [ ] Clicked "Requests" - page loads
- [ ] Clicked "My Equipment" - page loads
- [ ] No console errors

---

## 🔷 PART 4: SAVE IMPORTANT INFO

Write these down:

**GitHub Repo:**
```
https://github.com/__________________/equiptrack
```

**Railway Project:**
```
https://railway.app/project/__________________
```

**Backend URL:**
```
https://backend-production-__________________.railway.app
```

**Frontend URL (YOUR WEBSITE):**
```
https://frontend-production-__________________.railway.app
```

**Login Credentials:**
```
Email: admin@equiptrack.com
Password: Admin123!
```

---

## 🔷 PART 5: TEST PUSHING UPDATES

### Make a Small Change:
- [ ] Opened `C:\Users\holog\OneDrive\Desktop\EquipTrack\frontend\index.html`
- [ ] Changed title to: `<title>EquipTrack - My Equipment System</title>`
- [ ] Saved file

### Push to GitHub:
- [ ] Opened CMD
- [ ] `cd C:\Users\holog\OneDrive\Desktop\EquipTrack`
- [ ] `git add .`
- [ ] `git commit -m "Changed website title"`
- [ ] `git push`

### Check Railway:
- [ ] Went to Railway dashboard
- [ ] Saw frontend redeploying
- [ ] Waited for green checkmark
- [ ] Refreshed website
- [ ] Saw new title in browser tab!

---

## ✅ FINAL VERIFICATION

Everything working if:

- [ ] ✅ Can access website URL
- [ ] ✅ Can login
- [ ] ✅ Dashboard shows data
- [ ] ✅ All pages work
- [ ] ✅ No errors in console
- [ ] ✅ Push to GitHub triggers Railway deploy
- [ ] ✅ Changes appear on live site

---

## 🎉 YOU'RE DONE!

**Your workflow now:**
1. Make changes to code
2. Run: `push-to-github.bat "What you changed"`
3. Railway auto-deploys
4. Website updates automatically!

**Save these files:**
- [ ] Saved this checklist
- [ ] Saved your URLs document
- [ ] Bookmarked Railway dashboard
- [ ] Bookmarked GitHub repo

---

## 📞 IF SOMETHING DOESN'T WORK

1. **Check Railway logs:**
   - Railway dashboard → Click service → "Deployments" → View logs

2. **Common fixes:**
   - Redeploy: Railway dashboard → Service → Click "Redeploy"
   - Check variables: Make sure all environment variables are set
   - Check URLs: FRONTEND_URL and VITE_API_URL must be correct

3. **Read guides:**
   - START.md - Quick guide
   - DEPLOY_TO_RAILWAY.md - Detailed guide
   - README_DEPLOYMENT.md - Visual guide

---

**Need help? Check the guides first!** 📚

**Congrats on deploying! 🚀**
