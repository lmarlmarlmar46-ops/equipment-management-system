# 🚀 Deploy EquipTrack to Railway from GitHub

## ✅ Prerequisites Completed

Your code is ready with:
- ✅ Modern UI with dark mode
- ✅ Railway configuration files
- ✅ GitHub repository setup
- ✅ All code committed and pushed

**GitHub Repository:** https://github.com/lmarlmarlmar46-ops/equipment-management-system

---

## 📋 Step-by-Step Railway Deployment

### Step 1: Go to Railway
1. Open https://railway.app in your browser
2. Sign in with your GitHub account

### Step 2: Create New Project
1. Click **"New Project"** button
2. Select **"Deploy from GitHub repo"**
3. You'll see a list of your repositories

### Step 3: Select Your Repository
1. Find and click: **equipment-management-system**
2. Railway will connect to your GitHub repo

### Step 4: Configure Deployment
Railway will automatically:
- ✅ Detect the `nixpacks.toml` configuration
- ✅ Install Node.js dependencies
- ✅ Start your backend server
- ✅ Assign a public URL

**No additional configuration needed!** The files I created handle everything.

### Step 5: Wait for Deployment (2-3 minutes)
Watch the build logs. You should see:
```
✓ Preparing environment
✓ Installing dependencies  
✓ Building application
✓ Starting server
✓ Deployment successful
```

### Step 6: Get Your URL
Once deployed, Railway provides a URL like:
```
https://equiptrack-production.up.railway.app
```

Click **"Generate Domain"** if not automatically generated.

---

## 🧪 Test Your Deployment

### Test the API endpoints:

**1. Root Health Check:**
```bash
https://your-project.railway.app/
```

**2. API Health:**
```bash
https://your-project.railway.app/api/health
```

**3. Dashboard Stats:**
```bash
https://your-project.railway.app/api/dashboard/stats
```

**4. Equipment List:**
```bash
https://your-project.railway.app/api/equipment
```

---

## 🌐 Deploy Frontend to Vercel

Your backend is now on Railway. Now deploy the frontend:

### Step 1: Go to Vercel
1. Visit https://vercel.com
2. Sign in with GitHub

### Step 2: Import Project
1. Click **"Add New..." → "Project"**
2. Select **equipment-management-system** repository
3. Click **"Import"**

### Step 3: Configure Frontend
**Framework Preset:** Vite
**Root Directory:** `frontend`
**Build Command:** `npm run build`
**Output Directory:** `dist`

### Step 4: Add Environment Variable
Click **"Environment Variables"** and add:

**Name:** `VITE_API_URL`
**Value:** `https://your-railway-backend.railway.app`

*(Replace with your actual Railway URL)*

### Step 5: Deploy
Click **"Deploy"** and wait 1-2 minutes.

Vercel will give you a URL like:
```
https://equipment-management-system.vercel.app
```

---

## 🔗 Connect Frontend to Backend

After both are deployed:

### Update Frontend API Calls
Your frontend should use the Railway backend URL.

Update `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://your-railway-backend.railway.app',
        changeOrigin: true
      }
    }
  }
})
```

Or create `frontend/.env.production`:
```
VITE_API_URL=https://your-railway-backend.railway.app
```

Then update API calls to use:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
```

---

## 📊 Project Structure After Deployment

```
┌─────────────────────────────────────┐
│  Frontend (Vercel)                  │
│  https://yourapp.vercel.app         │
│                                     │
│  - React UI                         │
│  - Dark Mode Toggle                 │
│  - Modern Dashboard                 │
└────────────┬────────────────────────┘
             │
             │ API Calls
             ↓
┌─────────────────────────────────────┐
│  Backend (Railway)                  │
│  https://yourapi.railway.app        │
│                                     │
│  - Express Server                   │
│  - SQLite Database                  │
│  - REST API                         │
└─────────────────────────────────────┘
```

---

## 🔄 Auto-Deploy on Push

Both Railway and Vercel will auto-deploy when you push to GitHub:

```bash
# Make changes
git add -A
git commit -m "Update feature"
git push origin main
```

Railway and Vercel will automatically detect and redeploy! 🎉

---

## ⚙️ Railway Configuration Files Explained

### `railway.toml`
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "cd backend && npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```
Tells Railway how to deploy your app.

### `nixpacks.toml`
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x"]

[phases.install]
cmds = ["cd backend && npm ci"]

[start]
cmd = "cd backend && npm start"
```
Defines the build process.

### `Procfile`
```
web: cd backend && npm start
```
Alternative start command definition.

---

## 🐛 Troubleshooting

### Build Fails
**Check:** Build logs in Railway dashboard
**Common Fix:** Make sure `package.json` has all dependencies

### App Crashes
**Check:** Runtime logs in Railway dashboard
**Common Fix:** Database path issues (SQLite creates DB automatically)

### 500 Errors
**Check:** Railway logs for error details
**Common Fix:** CORS issues - backend already has CORS enabled

### Frontend Can't Connect
**Check:** Environment variable `VITE_API_URL` in Vercel
**Fix:** Make sure Railway URL is correct

---

## 💰 Pricing

**Railway:**
- Free tier: $5 credit/month
- Enough for development/small apps

**Vercel:**
- Hobby plan: Free
- Unlimited bandwidth for personal projects

---

## 📞 Support Resources

- **Railway Docs:** https://docs.railway.app
- **Vercel Docs:** https://vercel.com/docs
- **Your Repo:** https://github.com/lmarlmarlmar46-ops/equipment-management-system

---

## ✅ Checklist

- [ ] Push all code to GitHub
- [ ] Deploy backend to Railway from GitHub
- [ ] Get Railway URL
- [ ] Deploy frontend to Vercel
- [ ] Add VITE_API_URL environment variable in Vercel
- [ ] Test all API endpoints
- [ ] Test full application
- [ ] Set up custom domain (optional)

---

## 🎉 You're Done!

Your EquipTrack system is now live:
- **Frontend:** Modern, responsive UI with dark mode
- **Backend:** Scalable REST API on Railway
- **Database:** SQLite (consider PostgreSQL for production)
- **Auto-Deploy:** Push to GitHub = auto-deploy

Enjoy your modernized Equipment Tracking System! 🚀
