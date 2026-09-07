const { Pool } = require('pg');

// Use Railway PostgreSQL connection or fallback to SQLite
const DATABASE_URL = process.env.DATABASE_URL;

let pool;

if (DATABASE_URL) {
  // PostgreSQL configuration for Railway
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL pool error:', err);
  });
} else {
  console.log('⚠️  No DATABASE_URL found - using SQLite fallback');
}

// Universal query function that works with both PostgreSQL and SQLite
async function query(text, params = []) {
  if (!pool) {
    throw new Error('Database not initialized. Set DATABASE_URL environment variable for PostgreSQL.');
  }

  try {
    const result = await pool.query(text, params);
    return result;
  } catch (err) {
    console.error('Query error:', err);
    throw err;
  }
}

// Get a single row
async function get(text, params = []) {
  const result = await query(text, params);
  return result.rows[0];
}

// Get all rows
async function all(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

// Run a query (INSERT, UPDATE, DELETE)
async function run(text, params = []) {
  const result = await query(text, params);
  return result;
}

// Initialize database tables for PostgreSQL
async function initializeDatabase() {
  if (!pool) {
    console.log('Skipping database initialization - no PostgreSQL connection');
    return;
  }

  console.log('🔧 Initializing PostgreSQL database tables...');

  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'employee',
        employee_id TEXT,
        status TEXT DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Employees table
    await query(`
      CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        department TEXT,
        location TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Equipment table
    await query(`
      CREATE TABLE IF NOT EXISTS equipment (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        brand TEXT,
        model TEXT,
        serial_number TEXT UNIQUE,
        purchase_date DATE,
        purchase_price DECIMAL(10,2),
        status TEXT DEFAULT 'available',
        condition TEXT DEFAULT 'good',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Allocations table
    await query(`
      CREATE TABLE IF NOT EXISTS allocations (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        allocated_date DATE NOT NULL,
        expected_return_date DATE,
        actual_return_date DATE,
        status TEXT DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Maintenance logs table
    await query(`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        maintenance_type TEXT NOT NULL,
        description TEXT,
        cost DECIMAL(10,2),
        performed_date DATE NOT NULL,
        performed_by TEXT,
        next_maintenance_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    // Audit logs table
    await query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        action TEXT NOT NULL,
        old_values TEXT,
        new_values TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Warranties table
    await query(`
      CREATE TABLE IF NOT EXISTS warranties (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        provider TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        coverage_details TEXT,
        contact_info TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id)
      )
    `);

    // Reservations table
    await query(`
      CREATE TABLE IF NOT EXISTS reservations (
        id TEXT PRIMARY KEY,
        equipment_id TEXT NOT NULL,
        employee_id TEXT NOT NULL,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        status TEXT DEFAULT 'pending',
        purpose TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Service requests table
    await query(`
      CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        equipment_id TEXT,
        employee_id TEXT NOT NULL,
        issue_type TEXT NOT NULL,
        priority TEXT DEFAULT 'medium',
        description TEXT,
        status TEXT DEFAULT 'pending',
        assigned_to TEXT,
        resolution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP
      )
    `);

    // Documents table
    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        uploaded_by TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notifications table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        action_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Work assignments table
    await query(`
      CREATE TABLE IF NOT EXISTS work_assignments (
        id SERIAL PRIMARY KEY,
        assigned_to INTEGER NOT NULL,
        assigned_by INTEGER NOT NULL,
        task_description TEXT NOT NULL,
        department TEXT,
        location TEXT,
        priority TEXT DEFAULT 'medium',
        status TEXT DEFAULT 'pending',
        due_date TIMESTAMP,
        notes TEXT,
        rejection_reason TEXT,
        accepted_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables initialized successfully');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  }
}

module.exports = {
  pool,
  query,
  get,
  all,
  run,
  initializeDatabase
};
