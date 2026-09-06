# 🎯 EquipTrack - Remote Employee Equipment Allocation & Asset Tracking System

A comprehensive web-based system for managing equipment allocation to remote employees, tracking assets, and monitoring equipment lifecycle.

## 📋 Features

### 🏠 Dashboard
- Real-time statistics overview
- Total, available, and allocated equipment counts
- Active employee and allocation metrics
- Equipment distribution by category

### 💻 Equipment Management
- Add, edit, and delete equipment items
- Track equipment details (brand, model, serial number)
- Monitor equipment status (available, allocated, maintenance, retired)
- Condition tracking (excellent, good, fair, poor)
- Purchase information and pricing

### 👥 Employee Management
- Manage employee records
- Department and location tracking
- Employee status management (active/inactive)
- View equipment allocation history per employee

### 🔄 Allocation System
- Allocate equipment to employees
- Track allocation dates and expected returns
- Process equipment returns
- View allocation history
- Automatic equipment status updates

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database
- RESTful API architecture
- UUID for unique identifiers

### Frontend
- **React 18** with hooks
- **Vite** for fast development
- Modern CSS with CSS variables
- Responsive design

## 📁 Project Structure

```
EquipTrack/
├── backend/
│   ├── models/
│   │   ├── Employee.js
│   │   ├── Equipment.js
│   │   └── Allocation.js
│   ├── routes/
│   │   ├── employees.js
│   │   ├── equipment.js
│   │   ├── allocations.js
│   │   └── dashboard.js
│   ├── database.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Equipment.jsx
│   │   │   ├── Employees.jsx
│   │   │   └── Allocations.jsx
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd EquipTrack
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

You need to run both backend and frontend servers:

#### Terminal 1: Start Backend Server
```bash
cd backend
npm start
```
The backend API will run on `http://localhost:5000`

#### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

### First Time Setup

When you first run the application:
1. The SQLite database will be automatically created
2. Database tables will be initialized
3. Open your browser to `http://localhost:3000`
4. Start by adding employees and equipment
5. Create allocations to track equipment distribution

## 📚 API Endpoints

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `GET /api/employees/:id/allocations` - Get employee's allocations
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Equipment
- `GET /api/equipment` - Get all equipment
- `GET /api/equipment/:id` - Get equipment by ID
- `GET /api/equipment/available` - Get available equipment
- `POST /api/equipment` - Create new equipment
- `PUT /api/equipment/:id` - Update equipment
- `DELETE /api/equipment/:id` - Delete equipment

### Allocations
- `GET /api/allocations` - Get all allocations
- `GET /api/allocations/active` - Get active allocations
- `GET /api/allocations/:id` - Get allocation by ID
- `GET /api/allocations/employee/:employee_id` - Get allocations by employee
- `GET /api/allocations/equipment/:equipment_id` - Get allocations by equipment
- `POST /api/allocations` - Create new allocation
- `POST /api/allocations/:id/return` - Return equipment

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Health Check
- `GET /api/health` - API health check

## 💾 Database Schema

### Employees Table
- `id` - Unique identifier
- `name` - Employee full name
- `email` - Employee email (unique)
- `department` - Department name
- `location` - Work location
- `status` - Employee status (active/inactive)
- `created_at` - Timestamp

### Equipment Table
- `id` - Unique identifier
- `name` - Equipment name
- `category` - Equipment category
- `brand` - Manufacturer brand
- `model` - Model number
- `serial_number` - Unique serial number
- `purchase_date` - Purchase date
- `purchase_price` - Purchase price
- `status` - Status (available/allocated/maintenance/retired)
- `condition` - Condition (excellent/good/fair/poor)
- `notes` - Additional notes
- `created_at` - Timestamp

### Allocations Table
- `id` - Unique identifier
- `equipment_id` - Foreign key to equipment
- `employee_id` - Foreign key to employee
- `allocated_date` - Allocation date
- `expected_return_date` - Expected return date
- `actual_return_date` - Actual return date
- `status` - Allocation status (active/returned)
- `notes` - Additional notes
- `created_at` - Timestamp

### Maintenance Logs Table
- `id` - Unique identifier
- `equipment_id` - Foreign key to equipment
- `maintenance_type` - Type of maintenance
- `description` - Maintenance description
- `cost` - Maintenance cost
- `performed_date` - Date performed
- `performed_by` - Person who performed maintenance
- `created_at` - Timestamp

## 🎨 Features in Detail

### Equipment Status Management
- **Available**: Ready for allocation
- **Allocated**: Currently assigned to an employee
- **Maintenance**: Under maintenance or repair
- **Retired**: No longer in service

### Allocation Workflow
1. Select an available employee
2. Choose available equipment
3. Set allocation date and expected return date
4. Add notes if needed
5. System automatically updates equipment status to "allocated"
6. When returned, equipment status reverts to "available"

### Dashboard Metrics
- **Total Equipment**: All equipment in the system
- **Available Equipment**: Equipment ready for allocation
- **Allocated Equipment**: Currently assigned equipment
- **Active Employees**: Employees with active status
- **Active Allocations**: Current equipment allocations
- **Equipment by Category**: Visual breakdown of equipment types

## 🔧 Configuration

### Backend Configuration
Edit `backend/server.js` to change:
- Server port (default: 5000)
- CORS settings
- Database path

### Frontend Configuration
Edit `frontend/vite.config.js` to change:
- Development server port (default: 3000)
- API proxy settings

## 🎯 Usage Tips

1. **Adding Equipment First**: Start by adding equipment items before creating allocations
2. **Employee Management**: Ensure employees are set to "active" status for allocations
3. **Serial Numbers**: Use unique serial numbers for better equipment tracking
4. **Categories**: Use consistent category names for better dashboard reporting
5. **Regular Returns**: Process equipment returns promptly to keep inventory accurate

## 🐛 Troubleshooting

### Backend won't start
- Ensure Node.js is installed: `node --version`
- Check if port 5000 is available
- Verify all dependencies are installed: `npm install`

### Frontend won't start
- Ensure Node.js is installed
- Check if port 3000 is available
- Verify all dependencies are installed: `npm install`
- Clear browser cache if seeing old data

### Database errors
- Delete `backend/equiptrack.db` and restart the server to recreate the database
- Check file permissions in the backend directory

### API connection issues
- Verify backend server is running
- Check proxy configuration in `frontend/vite.config.js`
- Ensure no firewall is blocking local connections

## 📈 Future Enhancements

- User authentication and authorization
- Email notifications for overdue returns
- Equipment depreciation tracking
- Advanced reporting and analytics
- CSV/Excel export functionality
- Barcode/QR code generation for equipment
- Mobile app for quick equipment scanning
- Integration with procurement systems
- Multi-tenant support for multiple organizations

## 📝 License

MIT License - Feel free to use this system for your organization.

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## 📧 Support

For support and questions, please open an issue in the project repository.

---

Built with ❤️ for remote teams managing equipment allocation
