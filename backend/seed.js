const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./database-pg');

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Initialize database tables first
    await db.initializeDatabase();

    // Check if data already exists
    const existingUsers = await db.all('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('⚠️  Database already contains data. Skipping seed.');
      console.log('   To reseed, manually clear the database first.');
      process.exit(0);
    }

    // 1. Create Demo Employees
    console.log('👥 Creating employees...');
    const employees = [
      {
        id: uuidv4(),
        name: 'John Smith',
        email: 'john.smith@company.com',
        department: 'Engineering',
        location: 'Remote - California'
      },
      {
        id: uuidv4(),
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Marketing',
        location: 'Remote - New York'
      },
      {
        id: uuidv4(),
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        department: 'Engineering',
        location: 'Remote - Texas'
      },
      {
        id: uuidv4(),
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        department: 'Sales',
        location: 'Remote - Florida'
      },
      {
        id: uuidv4(),
        name: 'David Wilson',
        email: 'david.wilson@company.com',
        department: 'IT Operations',
        location: 'Office - Seattle'
      }
    ];

    for (const emp of employees) {
      await db.run(
        'INSERT INTO employees (id, name, email, department, location, status) VALUES ($1, $2, $3, $4, $5, $6)',
        [emp.id, emp.name, emp.email, emp.department, emp.location, 'active']
      );
    }
    console.log(`✅ Created ${employees.length} employees\n`);

    // 2. Create Demo Users
    console.log('👤 Creating user accounts...');
    const password = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);
    const managerPassword = await bcrypt.hash('manager123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    const users = [
      {
        id: uuidv4(),
        username: 'admin',
        email: 'admin@equiptrack.com',
        password_hash: adminPassword,
        role: 'admin',
        employee_id: employees[4].id // David Wilson (IT)
      },
      {
        id: uuidv4(),
        username: 'manager',
        email: 'manager@equiptrack.com',
        password_hash: managerPassword,
        role: 'manager',
        employee_id: employees[4].id // David Wilson (IT)
      },
      {
        id: uuidv4(),
        username: 'employee',
        email: 'employee@equiptrack.com',
        password_hash: employeePassword,
        role: 'employee',
        employee_id: employees[0].id // John Smith
      },
      {
        id: uuidv4(),
        username: 'sarah',
        email: 'sarah.johnson@company.com',
        password_hash: password,
        role: 'employee',
        employee_id: employees[1].id
      },
      {
        id: uuidv4(),
        username: 'michael',
        email: 'michael.chen@company.com',
        password_hash: password,
        role: 'employee',
        employee_id: employees[2].id
      }
    ];

    for (const user of users) {
      await db.run(
        'INSERT INTO users (id, username, email, password_hash, role, employee_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [user.id, user.username, user.email, user.password_hash, user.role, user.employee_id, 'active']
      );
    }
    console.log(`✅ Created ${users.length} user accounts\n`);

    // 3. Create Demo Equipment
    console.log('💻 Creating equipment...');
    const equipment = [
      {
        id: uuidv4(),
        name: 'MacBook Pro 16"',
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro 2023',
        serial_number: 'MBP-001',
        purchase_date: '2023-01-15',
        purchase_price: 2499.99,
        status: 'available',
        condition: 'excellent'
      },
      {
        id: uuidv4(),
        name: 'MacBook Pro 14"',
        category: 'Laptop',
        brand: 'Apple',
        model: 'MacBook Pro 2023',
        serial_number: 'MBP-002',
        purchase_date: '2023-01-20',
        purchase_price: 1999.99,
        status: 'allocated',
        condition: 'excellent'
      },
      {
        id: uuidv4(),
        name: 'Dell XPS 15',
        category: 'Laptop',
        brand: 'Dell',
        model: 'XPS 15 9530',
        serial_number: 'DELL-001',
        purchase_date: '2023-02-10',
        purchase_price: 1799.99,
        status: 'allocated',
        condition: 'good'
      },
      {
        id: uuidv4(),
        name: 'LG 27" 4K Monitor',
        category: 'Monitor',
        brand: 'LG',
        model: '27UP850',
        serial_number: 'MON-001',
        purchase_date: '2023-03-05',
        purchase_price: 449.99,
        status: 'available',
        condition: 'excellent'
      },
      {
        id: uuidv4(),
        name: 'Dell UltraSharp 24"',
        category: 'Monitor',
        brand: 'Dell',
        model: 'U2422H',
        serial_number: 'MON-002',
        purchase_date: '2023-03-10',
        purchase_price: 299.99,
        status: 'allocated',
        condition: 'good'
      },
      {
        id: uuidv4(),
        name: 'Magic Keyboard',
        category: 'Keyboard',
        brand: 'Apple',
        model: 'Magic Keyboard',
        serial_number: 'KB-001',
        purchase_date: '2023-04-01',
        purchase_price: 99.99,
        status: 'available',
        condition: 'excellent'
      },
      {
        id: uuidv4(),
        name: 'Logitech MX Master 3',
        category: 'Mouse',
        brand: 'Logitech',
        model: 'MX Master 3',
        serial_number: 'MS-001',
        purchase_date: '2023-04-05',
        purchase_price: 99.99,
        status: 'available',
        condition: 'excellent'
      },
      {
        id: uuidv4(),
        name: 'iPad Pro 12.9"',
        category: 'Tablet',
        brand: 'Apple',
        model: 'iPad Pro 2023',
        serial_number: 'IPD-001',
        purchase_date: '2023-05-01',
        purchase_price: 1099.99,
        status: 'available',
        condition: 'excellent'
      }
    ];

    for (const equip of equipment) {
      await db.run(
        `INSERT INTO equipment (id, name, category, brand, model, serial_number, purchase_date, purchase_price, status, condition) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [equip.id, equip.name, equip.category, equip.brand, equip.model, equip.serial_number, 
         equip.purchase_date, equip.purchase_price, equip.status, equip.condition]
      );
    }
    console.log(`✅ Created ${equipment.length} equipment items\n`);

    // 4. Create Demo Allocations
    console.log('🔄 Creating allocations...');
    const allocations = [
      {
        id: uuidv4(),
        equipment_id: equipment[1].id, // MacBook Pro 14"
        employee_id: employees[0].id, // John Smith
        allocated_date: '2023-06-01',
        expected_return_date: '2024-06-01',
        status: 'active',
        notes: 'Standard work laptop'
      },
      {
        id: uuidv4(),
        equipment_id: equipment[2].id, // Dell XPS
        employee_id: employees[1].id, // Sarah Johnson
        allocated_date: '2023-06-15',
        expected_return_date: '2024-06-15',
        status: 'active',
        notes: 'For marketing campaigns'
      },
      {
        id: uuidv4(),
        equipment_id: equipment[4].id, // Dell Monitor
        employee_id: employees[2].id, // Michael Chen
        allocated_date: '2023-07-01',
        expected_return_date: '2024-07-01',
        status: 'active',
        notes: 'Extra monitor for development'
      }
    ];

    for (const alloc of allocations) {
      await db.run(
        `INSERT INTO allocations (id, equipment_id, employee_id, allocated_date, expected_return_date, status, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [alloc.id, alloc.equipment_id, alloc.employee_id, alloc.allocated_date, 
         alloc.expected_return_date, alloc.status, alloc.notes]
      );
    }
    console.log(`✅ Created ${allocations.length} allocations\n`);

    // 5. Create Demo Service Request
    console.log('🎫 Creating service requests...');
    const serviceRequests = [
      {
        id: uuidv4(),
        equipment_id: null,
        employee_id: employees[3].id, // Emily Davis
        issue_type: 'equipment_request',
        priority: 'medium',
        description: 'Need a laptop for new hire. Prefer MacBook Pro for design work.',
        status: 'pending'
      }
    ];

    for (const req of serviceRequests) {
      await db.run(
        `INSERT INTO service_requests (id, equipment_id, employee_id, issue_type, priority, description, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.id, req.equipment_id, req.employee_id, req.issue_type, req.priority, req.description, req.status]
      );
    }
    console.log(`✅ Created ${serviceRequests.length} service requests\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('📋 Demo Accounts Created:');
    console.log('   Admin:    admin@equiptrack.com / admin123');
    console.log('   Manager:  manager@equiptrack.com / manager123');
    console.log('   Employee: employee@equiptrack.com / employee123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
