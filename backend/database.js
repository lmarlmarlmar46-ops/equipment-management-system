const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.join(__dirname, 'equiptrack.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.serialize(() => {
    // Users table for authentication
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'employee',
        employee_id TEXT,
        status TEXT DEFAULT 'active',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Employees table
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT,
        location TEXT,
        status TEXT DEFAULT 'active',
        available INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Equipment table
    db.run(`
      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serial_number TEXT UNIQUE,
        purchase_date DATE,
        purchase_price REAL,
        status TEXT DEFAULT 'available',
        condition TEXT DEFAULT 'good',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Allocations table
    db.run(`
      CREATE TABLE IF NOT EXISTS allocations (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        allocated_date DATE NOT NULL,
        expected_return_date DATE,
        actual_return_date DATE,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Maintenance logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL,
        description TEXT,
        cost REAL,
        performed_date DATE NOT NULL,
        performed_by TEXT,
        next_maintenance_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    // Audit logs table
    db.run(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Warranties table
    db.run(`
      CREATE TABLE IF NOT EXISTS warranties (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        provider TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        coverage_details TEXT,
        contact_info TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    // Reservations table
    db.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status TEXT DEFAULT 'pending',
        purpose TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Service requests table
    db.run(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        description TEXT,
        status TEXT DEFAULT 'open',
        assigned_to TEXT,
        resolution_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id)
      )
    `);

    // Documents table
    db.run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        uploaded_by TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        is_read INTEGER DEFAULT 0,
        action_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('Database tables initialized');
  });
}

module.exports = db;
