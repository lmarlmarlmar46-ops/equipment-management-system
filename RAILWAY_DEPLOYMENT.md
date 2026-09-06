# 🚂 Deploy EquipTrack to Railway

## Quick Deployment Steps

### 1. Push Your Code to GitHub First
```bash
git add -A
git commit -m "Add Railway configuration"
git push origin main
```

### 2. Deploy on Railway

#### Option A: Deploy from GitHub (Recommended)
1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository: `equipment-management-system`
5. Railway will automatically detect and deploy your backend

#### Option B: Deploy with Railway CLI
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

### 3. Configure Environment Variables (if needed)

In Railway Dashboard → Your Project → Variables, add:
- `NODE_ENV=production`
- `PORT` (Railway sets this automatically)

### 4. Get Your Deployment URL

After deployment completes, Railway will provide a URL like:
```
https://your-project.up.railway.app
```

## 📁 Files Created for Railway

✅ `railway.json` - Railway configuration
✅ `nixpacks.toml` - Build configuration  
✅ `Procfile` - Start command
✅ Updated `backend/package.json` - Added engines
✅ Updated `backend/server.js` - Added root health check

## 🔧 What These Files Do

### `railway.json`
Tells Railway to:
- Use NIXPACKS builder
- Start the backend server
- Restart on failure

### `nixpacks.toml`
Configures the build process:
- Use Node.js 18
- Install dependencies in backend folder
- Run the server from backend directory

### `Procfile`
Defines the start command for the web service

## 🌐 Frontend Deployment

**Important:** Railway is deploying your **backend API only**.

For the frontend, you have two options:

### Option 1: Separate Frontend Deployment (Recommended)
Deploy frontend to Vercel/Netlify:

1. **Vercel:**
   - Connect your GitHub repo
   - Set root directory to `frontend`
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-railway-backend.railway.app`

2. **Netlify:**
   - Same process as Vercel
   - Base directory: `frontend`

### Option 2: Serve Frontend from Backend
If you want everything on Railway, you can serve the built frontend from Express:

1. Build frontend locally:
   ```bash
   cd frontend
   npm run build
   ```

2. Update `backend/server.js` to serve static files:
   ```javascript
   const path = require('path');
   app.use(express.static(path.join(__dirname, '../frontend/dist')));
   ```

3. Update `nixpacks.toml` to build frontend:
   ```toml
   [phases.install]
   cmds = [
     "cd backend && npm ci",
     "cd frontend && npm ci"
   ]
   
   [phases.build]
   cmds = [
     "cd frontend && npm run build"
   ]
   ```

## 🧪 Testing Your Deployment

Once deployed, test your API:

```bash
# Health check
curl https://your-project.railway.app/

# Dashboard stats
curl https://your-project.railway.app/api/dashboard/stats

# Equipment list
curl https://your-project.railway.app/api/equipment
```

## ⚠️ Common Issues

### Build Fails with "railpack not found"
✅ Fixed by adding `railway.json` and `nixpacks.toml`

### Database Not Persisting
Railway's filesystem is ephemeral. For production, consider:
- Railway PostgreSQL (free tier available)
- External database service

### Port Issues
✅ Fixed - server uses `process.env.PORT` which Railway provides

### Module Not Found
Make sure `package.json` is in the backend folder and has all dependencies

## 📊 Monitor Your Deployment

Railway Dashboard provides:
- **Logs** - Real-time application logs
- **Metrics** - CPU, Memory, Network usage
- **Deployments** - History of all deployments

## 💰 Railway Pricing

- **Free Tier:** $5 credit per month
- **Hobby Plan:** $5/month
- Your backend should fit within the free tier for development

## 🔄 Continuous Deployment

Railway automatically redeploys when you push to GitHub:
```bash
git add -A
git commit -m "Update feature"
git push origin main
```

Railway will detect the push and redeploy automatically!

---

## Quick Reference

**Repository:** https://github.com/lmarlmarlmar46-ops/equipment-management-system
**Railway:** https://railway.app
**Docs:** https://docs.railway.app

Need help? Check the Railway logs in your dashboard for detailed error messages.
