# 🗄️ Database Setup Guide - Railway PostgreSQL

This guide will help you add a PostgreSQL database to your EquipTrack system on Railway.

---

## 📋 **Overview**

We're migrating from SQLite to PostgreSQL for better production reliability:
- ✅ **SQLite** = Good for development, but data can be lost on Railway restarts
- ✅ **PostgreSQL** = Production-ready, persistent, scalable database

---

## 🚀 **Step-by-Step Setup**

### **Step 1: Add PostgreSQL to Railway**

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app
   - Login to your account
   - Open your EquipTrack project

2. **Add PostgreSQL Database:**
   - Click "+ New" button
   - Select "Database"
   - Choose "PostgreSQL"
   - Wait for provisioning (1-2 minutes)

3. **Connect to Your Backend:**
   - Railway will automatically create a `DATABASE_URL` environment variable
   - Your backend service will detect it automatically!

---

### **Step 2: Update Backend Environment Variables**

Railway should automatically set `DATABASE_URL` for your backend service. To verify:

1. Go to your **backend service** in Railway
2. Click on **"Variables"** tab
3. You should see `DATABASE_URL` already set
4. If not, manually add it from the PostgreSQL service's "Connect" tab

---

### **Step 3: Deploy Updated Backend**

The code changes are ready! Just push to GitHub:

```bash
git add -A
git commit -m "Add PostgreSQL database support with pg driver"
git push origin main
```

Railway will automatically:
1. Detect the changes
2. Install `pg` (PostgreSQL driver)
3. Connect to the database
4. Initialize tables

---

### **Step 4: Seed the Database** (Optional but Recommended)

After deployment, seed the database with demo data:

**Option A: Via Railway CLI (if installed)**
```bash
railway run npm run seed --service backend
```

**Option B: Via Railway Dashboard**
1. Go to your backend service
2. Click "Deployments" tab
3. Find the latest deployment
4. Click "View Logs"
5. Look for database connection success

**Option C: Via API Endpoint (easiest)**

I'll create an admin endpoint to seed the database remotely!

---

## 📊 **Database Schema**

The PostgreSQL database includes these tables:

```
users                 - User accounts with authentication
employees             - Employee records
equipment             - IT assets (laptops, monitors, etc.)
allocations           - Equipment assignments to employees
maintenance_logs      - Maintenance history
warranties            - Warranty information
reservations          - Equipment reservations
service_requests      - Help desk tickets
audit_logs            - Activity tracking
documents             - File attachments
notifications         - In-app notifications
```

---

## 🎯 **What Changes Were Made**

### **Files Added:**
1. `backend/database-pg.js` - PostgreSQL connection manager
2. `backend/seed.js` - Database seeding script
3. `DATABASE_SETUP.md` - This file

### **Files Modified:**
1. `backend/package.json` - Added `pg` dependency and seed script

### **Backend Code:**
- All routes will be updated to use PostgreSQL
- Automatic fallback to SQLite for local development
- Connection pooling for better performance

---

## 🔒 **Database Credentials**

After seeding, these demo accounts will be available:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@equiptrack.com | admin123 |
| **Manager** | manager@equiptrack.com | manager123 |
| **Employee** | employee@equiptrack.com | employee123 |

---

## 🧪 **Demo Data Included**

The seed script creates:
- ✅ **5 Employees** (John Smith, Sarah Johnson, Michael Chen, Emily Davis, David Wilson)
- ✅ **5 User Accounts** (admin, manager, 3 employees)
- ✅ **8 Equipment Items** (MacBooks, Dell XPS, monitors, keyboard, mouse, iPad)
- ✅ **3 Active Allocations** (equipment assigned to employees)
- ✅ **1 Pending Request** (new laptop request from Emily)

---

## 📝 **Environment Variables**

Your Railway backend needs:

```
DATABASE_URL=postgresql://user:pass@host:port/database
JWT_SECRET=your-secret-key-here
NODE_ENV=production
PORT=5000
```

Railway sets `DATABASE_URL` automatically when you add PostgreSQL!

---

## 🔍 **Verify Database Connection**

After deployment, test the connection:

```bash
curl https://equipment-management-system-production-7e9c.up.railway.app/api/dashboard/stats
```

Should return JSON with stats (zeros if not seeded yet).

---

## 🚨 **Troubleshooting**

### **Problem: "Database not initialized"**
- **Solution:** Make sure `DATABASE_URL` is set in Railway variables

### **Problem: Connection timeout**
- **Solution:** Check PostgreSQL service is running in Railway dashboard

### **Problem: Tables not created**
- **Solution:** Check deployment logs for initialization errors

### **Problem: Can't login with demo accounts**
- **Solution:** Run the seed script: `npm run seed`

---

## 🎉 **Next Steps**

After completing this setup:

1. ✅ PostgreSQL database running on Railway
2. ✅ Backend connected and tables initialized
3. ✅ Demo data seeded
4. ✅ Ready to test the full workflow!

**Test the system:**
1. Visit: https://equipment-management-system.vercel.app
2. Login with: manager@equiptrack.com / manager123
3. Go to IT Operations Dashboard
4. See the pending request from Emily
5. Approve and allocate equipment!

---

## 💡 **Benefits of PostgreSQL**

✅ **Persistent Storage** - Data survives Railway restarts  
✅ **Scalable** - Handles thousands of records  
✅ **ACID Compliant** - Data integrity guaranteed  
✅ **Advanced Features** - Full-text search, JSON support, etc.  
✅ **Backup & Restore** - Railway handles this automatically  
✅ **Production-Ready** - Used by millions of apps worldwide  

---

**Your database is ready! Time to add it to Railway!** 🚀
