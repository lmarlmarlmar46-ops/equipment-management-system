# Deploy EquipTrack to Railway (Simple Guide)

## 🎯 Goal
Deploy EquipTrack to Railway via GitHub. Use CMD only to push updates.

---

## 📋 One-Time Setup

### Step 1: Push to GitHub (5 minutes)

Open CMD:

```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack
```

Initialize Git:
```cmd
git init
git add .
git commit -m "Initial commit: EquipTrack"
```

Create GitHub repository:
1. Go to https://github.com/new
2. Name: `equiptrack`
3. Keep Private
4. Click "Create repository"

Push to GitHub (replace YOUR_USERNAME):
```cmd
git remote add origin https://github.com/YOUR_USERNAME/equiptrack.git
git branch -M main
git push -u origin main
```

**✅ Code is now on GitHub!**

---

## 🚀 Step 2: Deploy to Railway (10 minutes)

### A. Create Railway Project

1. Go to https://railway.app (sign up if needed)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect GitHub and select `equiptrack` repo
5. Railway will detect the monorepo

### B. Add PostgreSQL Database

1. In your project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. PostgreSQL will be created automatically
4. Click on PostgreSQL service → "Connect" tab
5. **Copy the "Postgres Connection URL"** (you'll need it)

### C. Deploy Backend

1. Click "+ New" → "GitHub Repo" → Select `equiptrack`
2. Service will be created

**Configure Backend:**

Click on the backend service:

**Settings → Root Directory & Build:**
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`
- Watch Paths: `backend/**`

**Variables tab - Add these:**

```
NODE_ENV=production
PORT=3001

DATABASE_URL=${{Postgres.DATABASE_URL}}

JWT_SECRET=put-random-32-char-string-here-abc123xyz789def456ghi
JWT_REFRESH_SECRET=put-different-random-32-char-string-here-jkl012mno
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=https://temporary-will-update-later.up.railway.app

RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX_REQUESTS=1000

LOG_LEVEL=info
```

**⚠️ Important:** For `JWT_SECRET` and `JWT_REFRESH_SECRET`, use random strings. Example:
- `JWT_SECRET=k8Hd93jD82hFj39dKs72Nd83jDks92Kd`
- `JWT_REFRESH_SECRET=m9Js82kF93jDd72Ks83nD92kDs03Jf`

**Settings → Networking:**
- Click "Generate Domain"
- **Copy this backend URL!** Example: `https://backend-production-abc123.up.railway.app`

### D. Initialize Database

1. Click on PostgreSQL service
2. Click "Data" tab
3. Click "Query" button
4. Open `C:\Users\holog\OneDrive\Desktop\EquipTrack\backend\database\init.sql` in Notepad
5. Copy ALL contents (Ctrl+A, Ctrl+C)
6. Paste into Railway query editor
7. Click "Run Query"

**✅ Database initialized with admin user!**

### E. Deploy Frontend

1. Click "+ New" → "GitHub Repo" → Select `equiptrack` again
2. New service created

**Configure Frontend:**

Click on the frontend service:

**Settings → Root Directory & Build:**
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npx vite preview --port $PORT --host`
- Watch Paths: `frontend/**`

**Variables tab - Add:**

```
VITE_API_URL=https://your-backend-url-from-step-C.up.railway.app/api/v1
VITE_APP_NAME=EquipTrack
VITE_APP_VERSION=1.0.0
```

**⚠️ Replace** `your-backend-url-from-step-C` with your actual backend URL!

**Settings → Networking:**
- Click "Generate Domain"
- **Copy this frontend URL!** Example: `https://frontend-production-xyz789.up.railway.app`

### F. Update Backend FRONTEND_URL

1. Go back to Backend service
2. Click "Variables" tab
3. Find `FRONTEND_URL`
4. Update it with your frontend URL from step E
5. Backend will redeploy automatically

**✅ Wait 2-3 minutes for deployment to complete**

---

## 🎉 Step 3: Access Your App

Open your frontend URL: `https://frontend-production-xyz789.up.railway.app`

**Login:**
- Email: `admin@equiptrack.com`
- Password: `Admin123!`

**🎊 You're LIVE on Railway!**

---

## 🔄 Making Updates (Use CMD)

When you need to fix something:

### 1. Make your changes in code

Edit files in: `C:\Users\holog\OneDrive\Desktop\EquipTrack`

### 2. Push to GitHub

Open CMD:

```cmd
cd C:\Users\holog\OneDrive\Desktop\EquipTrack

git add .
git commit -m "Fixed bug in dashboard"
git push
```

### 3. Railway auto-deploys!

Railway detects the GitHub push and automatically redeploys both services.

Watch deployment:
1. Go to Railway dashboard
2. Click on service (backend or frontend)
3. Click "Deployments" tab
4. Watch the logs

**That's it!** No need to run anything locally. Just edit → commit → push → Railway deploys.

---

## 🐛 Common Issues

### Build Fails

**Check:**
1. Railway dashboard → Service → Deployments → View logs
2. Look for error messages
3. Common issues:
   - Wrong Root Directory (should be `backend` or `frontend`)
   - Missing environment variables
   - Package.json errors

**Fix:**
1. Fix the issue locally
2. Push to GitHub again
3. Railway will retry

### Can't Login

**Check:**
1. Backend service is deployed (green checkmark in Railway)
2. Database was initialized (run init.sql query)
3. FRONTEND_URL in backend variables is correct
4. VITE_API_URL in frontend variables is correct

### Database Connection Failed

**Check:**
1. DATABASE_URL variable is set to `${{Postgres.DATABASE_URL}}`
2. PostgreSQL service is running (green in Railway)
3. Backend logs for specific error

---

## 📊 Monitor Your App

**Railway Dashboard shows:**
- ✅ Service status (running/building/failed)
- 📊 Usage and costs
- 📝 Deployment logs
- 🔧 Environment variables

**View Logs:**
1. Click on service
2. Click "Deployments" tab
3. Click latest deployment
4. View real-time logs

---

## 💰 Cost

**Railway Free Tier:**
- $5 credit per month
- Should be enough for development/testing

**Estimated Usage:**
- Backend: ~$2-3/month
- Frontend: ~$1-2/month  
- PostgreSQL: ~$1-2/month
- **Total: ~$5-7/month**

Monitor usage in Railway dashboard.

---

## 🎯 Workflow Summary

```
Local Changes
    ↓
git add . && git commit -m "message"
    ↓
git push
    ↓
GitHub receives code
    ↓
Railway auto-deploys
    ↓
Live website updated! ✨
```

**Simple as that!**

---

## 🔑 Important URLs

**Save these:**

- GitHub Repo: `https://github.com/YOUR_USERNAME/equiptrack`
- Railway Dashboard: `https://railway.app/project/YOUR_PROJECT_ID`
- Backend API: `https://backend-production-xxx.up.railway.app`
- Frontend App: `https://frontend-production-xxx.up.railway.app`
- PostgreSQL: (internal, managed by Railway)

---

## ✅ Checklist

After deployment:

- [ ] Backend service is running (green)
- [ ] Frontend service is running (green)
- [ ] PostgreSQL service is running (green)
- [ ] Can access frontend URL
- [ ] Can login with admin credentials
- [ ] Dashboard loads without errors
- [ ] Environment variables are set correctly

If all checkmarks are complete, **you're good to go!** 🚀

---

## 📞 Need Help?

1. Check Railway logs for errors
2. Verify environment variables
3. Check GitHub repo has latest code
4. Review this guide again

**Most common fix:** Redeploy from Railway dashboard (click "Redeploy")

---

## 🎓 Git Commands Reference

```cmd
# Check status
git status

# Add all changes
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub (and trigger Railway deploy)
git push

# View commit history
git log --oneline

# Undo last commit (before push)
git reset HEAD~1

# Pull latest from GitHub
git pull
```

---

**That's everything! Deploy once, then just `git push` to update.** 🎉
