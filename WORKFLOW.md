# EquipTrack - Core IT Operations Workflow

## 🔄 **Actual Workflow**

### **Step 1: Employee Requests Hardware**
**Actor:** Employee  
**Action:** Submit equipment request through service request system  

**Details:**
- Employee identifies need for equipment
- Submits request specifying:
  - Equipment type needed
  - Purpose/justification
  - Priority level
  - Required date
  - Department approval (if needed)

**System:** `POST /api/service-requests`

---

### **Step 2: IT Operations Reviews Request**
**Actor:** IT Operations / Manager  
**Action:** Review request and check inventory  

**Details:**
- IT team receives notification
- Reviews request details
- Checks available inventory
- Verifies equipment availability
- Confirms specifications match need
- May request additional information

**System:** 
- `GET /api/service-requests` (view pending)
- `GET /api/equipment?status=available` (check inventory)

---

### **Step 3: IT Reviews Inventory**
**Actor:** IT Operations  
**Action:** Check available equipment in inventory  

**Details:**
- View available equipment
- Check condition and specifications
- Verify serial numbers
- Check warranty status
- Ensure equipment is ready for deployment

**System:**
- `GET /api/equipment?status=available`
- `GET /api/equipment/:id` (detailed view)
- `GET /api/warranties?equipment_id=xxx` (warranty check)

---

### **Step 4: Approve/Assign Equipment**
**Actor:** IT Manager  
**Action:** Approve request and assign specific equipment  

**Details:**
- Approve service request
- Select specific equipment from inventory
- Create allocation record
- Update equipment status to "allocated"
- Update service request status to "approved/fulfilled"

**System:**
- `PATCH /api/service-requests/:id/resolve` (approve request)
- `POST /api/allocations` (create allocation)
- Equipment status automatically updates to "allocated"

---

### **Step 5: Issue Equipment & Tracking**
**Actor:** IT Operations  
**Action:** Issue equipment to employee and create tracking record  

**Details:**
- Physical handover to employee
- Record allocation details:
  - Employee ID
  - Equipment ID
  - Issue date
  - Expected return date
  - Condition at issue
  - Notes/special instructions
- Employee signs return agreement
- Send confirmation notification

**System:**
- Allocation record created with:
  - `allocated_date`
  - `expected_return_date`
  - `status: 'active'`
  - `notes` (return agreement details)

---

### **Step 6: Track Active Allocations**
**Actor:** IT Operations  
**Action:** Monitor issued equipment  

**Details:**
- View all active allocations
- Track upcoming return dates
- Monitor overdue equipment
- Send reminders for returns
- Update status if issues arise

**System:**
- `GET /api/allocations?status=active`
- `GET /api/reports/overdue-equipment`
- `GET /api/allocations` (filtered by employee/equipment)

---

### **Step 7: Return Agreement & Logging**
**Actor:** Employee → IT Operations  
**Action:** Employee returns equipment, IT logs return  

**Details:**
- Employee initiates return
- IT verifies equipment condition
- Log actual return date
- Update allocation status to "returned"
- Update equipment status back to "available" (if good condition)
- Document any damage or issues
- Create maintenance log if needed

**System:**
- `PATCH /api/allocations/:id` (update with return info)
  - Set `actual_return_date`
  - Set `status: 'returned'`
- Equipment status updated to "available" or "maintenance"
- `POST /api/maintenance` (if maintenance needed)

---

## 📊 **Workflow Diagram**

```
[Employee] 
   ↓ 
   Submits Request
   ↓
[Service Request System] ──→ Notification to IT
   ↓
[IT Manager]
   ↓
   Reviews Request + Checks Inventory
   ↓
   Decision: Approve/Reject
   ↓
   ┌─────────────┬──────────────┐
   ↓             ↓              ↓
Approve      Need More Info   Reject
   ↓
   Selects Equipment from Inventory
   ↓
[IT Operations]
   ↓
   Creates Allocation Record
   ↓
   Issues Equipment Physically
   ↓
   Employee Signs Return Agreement
   ↓
[Active Tracking]
   ↓
   Monitor Until Return Date
   ↓
[Employee Returns Equipment]
   ↓
[IT Verifies & Logs Return]
   ↓
   Updates Allocation Status
   ↓
   Equipment Back to Inventory
```

---

## 🎯 **Key System Features Needed**

### **1. Employee Request Portal**
- Simple request form
- View own requests
- Track request status
- Receive notifications

### **2. IT Operations Dashboard**
- **Pending Requests View**
  - All pending service requests
  - Priority sorting
  - Quick approve/reject
  
- **Inventory Management**
  - Available equipment
  - Equipment specifications
  - Quick search/filter

- **Active Allocations Monitor**
  - All issued equipment
  - Overdue tracking
  - Return reminders

### **3. Approval Workflow**
- Service request approval
- Equipment assignment
- One-click allocation creation

### **4. Return Processing**
- Return logging interface
- Condition assessment
- Status updates (returned/maintenance)

### **5. Reporting & Analytics**
- Equipment utilization
- Request fulfillment time
- Overdue equipment
- Department usage

---

## 📝 **Database Records for Workflow**

### **Service Request Record**
```json
{
  "id": "req-123",
  "employee_id": "emp-456",
  "issue_type": "equipment_request",
  "description": "Need laptop for remote work",
  "priority": "high",
  "status": "pending",
  "assigned_to": null,
  "created_at": "2024-01-15"
}
```

### **Inventory Check** (Equipment)
```json
{
  "id": "eq-789",
  "name": "Dell Laptop XPS 15",
  "status": "available",
  "condition": "good",
  "serial_number": "SN123456",
  "category": "Laptops"
}
```

### **Allocation Record** (Issue Tracking)
```json
{
  "id": "alloc-999",
  "equipment_id": "eq-789",
  "employee_id": "emp-456",
  "allocated_date": "2024-01-16",
  "expected_return_date": "2024-07-16",
  "actual_return_date": null,
  "status": "active",
  "notes": "Return agreement signed. Employee responsible for equipment."
}
```

### **Return Log** (Updated Allocation)
```json
{
  "id": "alloc-999",
  "equipment_id": "eq-789",
  "employee_id": "emp-456",
  "allocated_date": "2024-01-16",
  "expected_return_date": "2024-07-16",
  "actual_return_date": "2024-07-14",
  "status": "returned",
  "notes": "Equipment returned in good condition. No issues."
}
```

---

## 🔐 **Role Permissions for Workflow**

### **Employee Role**
- ✅ Submit equipment requests
- ✅ View own requests
- ✅ View own allocations
- ✅ Initiate return process
- ❌ Cannot approve requests
- ❌ Cannot create allocations directly

### **IT Operations / Manager Role**
- ✅ View all service requests
- ✅ Approve/reject requests
- ✅ View full inventory
- ✅ Create allocations
- ✅ Issue equipment
- ✅ Log returns
- ✅ Update equipment status
- ✅ View all reports

### **Admin Role**
- ✅ Full access to everything
- ✅ User management
- ✅ System configuration
- ✅ All IT Operations permissions
- ✅ Delete records

---

## 📧 **Notifications in Workflow**

### **1. Request Submitted**
- **To:** IT Operations team
- **Message:** "New equipment request from [Employee]"
- **Action:** Review request

### **2. Request Approved**
- **To:** Employee
- **Message:** "Your equipment request has been approved"
- **Action:** Await equipment issue

### **3. Equipment Issued**
- **To:** Employee
- **Message:** "Equipment [Name] issued to you. Return by [Date]"
- **Action:** None (informational)

### **4. Return Reminder**
- **To:** Employee
- **Message:** "Equipment [Name] due for return in 7 days"
- **Action:** Plan return

### **5. Overdue Equipment**
- **To:** Employee + IT Manager
- **Message:** "Equipment [Name] is overdue by [X] days"
- **Action:** Return equipment ASAP

### **6. Equipment Returned**
- **To:** IT Operations
- **Message:** "[Employee] has returned equipment [Name]"
- **Action:** Verify and log return

---

## 🎯 **API Endpoints Mapped to Workflow**

### **Step 1: Employee Requests**
```
POST   /api/service-requests          - Submit request
GET    /api/service-requests?employee_id=xxx  - View own requests
```

### **Step 2-3: IT Reviews & Checks Inventory**
```
GET    /api/service-requests?status=pending   - Pending requests
GET    /api/equipment?status=available        - Available inventory
GET    /api/equipment/:id                     - Equipment details
```

### **Step 4: Approve & Assign**
```
PATCH  /api/service-requests/:id/assign       - Assign to IT staff
PATCH  /api/service-requests/:id/resolve      - Approve request
POST   /api/allocations                       - Create allocation
```

### **Step 5: Issue & Track**
```
POST   /api/allocations                       - Issue equipment
GET    /api/allocations?status=active         - Active allocations
POST   /api/notifications                     - Send notifications
```

### **Step 6: Monitor**
```
GET    /api/allocations                       - All allocations
GET    /api/reports/overdue-equipment         - Overdue tracking
GET    /api/reports/allocation-history        - History
```

### **Step 7: Return & Log**
```
PATCH  /api/allocations/:id                   - Log return
      (set actual_return_date, status='returned')
PUT    /api/equipment/:id                     - Update status
POST   /api/maintenance                       - If maintenance needed
```

---

## 🚀 **Implementation Priority**

### **Phase 1: Core Workflow (DONE)**
✅ Service requests (already implemented)  
✅ Equipment inventory (already implemented)  
✅ Allocations (already implemented)  
✅ Basic dashboard (already implemented)  

### **Phase 2: Workflow Integration (NEEDED)**
- [ ] Link service requests to allocations
- [ ] Request approval workflow UI
- [ ] Inventory check during approval
- [ ] One-click "Approve & Allocate" action

### **Phase 3: Notifications (NEEDED)**
- [ ] Email notifications for requests
- [ ] Return reminders (7 days, 1 day, overdue)
- [ ] In-app notification panel
- [ ] IT team alerts

### **Phase 4: Enhanced UI (NEEDED)**
- [ ] Employee request portal
- [ ] IT operations dashboard
- [ ] Approval interface
- [ ] Return logging interface

---

## ✅ **Summary**

Your EquipTrack system **already has all the backend pieces** for this workflow:

✅ Service Requests → Employees can request equipment  
✅ Inventory Management → IT can check available equipment  
✅ Allocations → IT can issue and track equipment  
✅ Return Logging → IT can log returns  
✅ Reporting → Overdue tracking, history, analytics  

**What's needed:** Frontend UI to connect these pieces into a smooth workflow!

---

**This workflow transforms EquipTrack into a proper IT Asset Management system aligned with real-world IT operations!** 🎯
