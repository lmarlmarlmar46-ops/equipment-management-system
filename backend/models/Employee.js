const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Employee {
  static getAll(callback) {
    db.all('SELECT * FROM employees ORDER BY created_at DESC', [], callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM employees WHERE id = ?', [id], callback);
  }

  static create(data, callback) {
    const id = uuidv4();
    const { name, email, department, location, status = 'active', available = 1 } = data;
    
    db.run(
      `INSERT INTO employees (id, name, email, department, location, status, available) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email, department, location, status, available ? 1 : 0],
      function(err) {
        if (err) {
          callback(err);
        } else {
          Employee.getById(id, callback);
        }
      }
    );
  }

  static update(id, data, callback) {
    const { name, email, department, location, status, available } = data;
    
    db.run(
      `UPDATE employees 
       SET name = ?, email = ?, department = ?, location = ?, status = ?, available = ?
       WHERE id = ?`,
      [name, email, department, location, status, available ? 1 : 0, id],
      function(err) {
        if (err) {
          callback(err);
        } else {
          Employee.getById(id, callback);
        }
      }
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM employees WHERE id = ?', [id], callback);
  }

  static getWithAllocations(id, callback) {
    db.all(
      `SELECT e.*, 
              eq.id as equipment_id, eq.name as equipment_name, eq.category,
              a.id as allocation_id, a.allocated_date, a.status as allocation_status
       FROM employees e
       LEFT JOIN allocations a ON e.id = a.employee_id AND a.status = 'active'
       LEFT JOIN equipment eq ON a.equipment_id = eq.id
       WHERE e.id = ?`,
      [id],
      callback
    );
  }
}

module.exports = Employee;
