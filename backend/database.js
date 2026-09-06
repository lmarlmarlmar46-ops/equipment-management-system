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
    // Employees table
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT,
        location TEXT,
        status TEXT DEFAULT 'active',
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    console.log('Database tables initialized');
  });
}

module.exports = db;
