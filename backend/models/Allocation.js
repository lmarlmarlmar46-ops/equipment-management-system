const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Allocation {
  static getAll(callback) {
    db.all(
      `SELECT a.*, 
              e.name as employee_name, e.email as employee_email, e.department,
              eq.name as equipment_name, eq.category, eq.serial_number
       FROM allocations a
       JOIN employees e ON a.employee_id = e.id
       JOIN equipment eq ON a.equipment_id = eq.id
       ORDER BY a.created_at DESC`,
      [],
      callback
    );
  }

  static getById(id, callback) {
    db.get(
      `SELECT a.*, 
              e.name as employee_name, e.email as employee_email, e.department,
              eq.name as equipment_name, eq.category, eq.serial_number
       FROM allocations a
       JOIN employees e ON a.employee_id = e.id
       JOIN equipment eq ON a.equipment_id = eq.id
       WHERE a.id = ?`,
      [id],
      callback
    );
  }

  static create(data, callback) {
    const id = uuidv4();
    const {
      equipment_id, employee_id, allocated_date,
      expected_return_date, notes
    } = data;
    
    // First, check if equipment is available
    db.get(
      'SELECT status FROM equipment WHERE id = ?',
      [equipment_id],
      (err, equipment) => {
        if (err) {
          return callback(err);
        }
        if (!equipment) {
          return callback(new Error('Equipment not found'));
        }
        if (equipment.status !== 'available') {
          return callback(new Error('Equipment is not available'));
        }

        // Create allocation
        db.run(
          `INSERT INTO allocations 
           (id, equipment_id, employee_id, allocated_date, expected_return_date, notes, status) 
           VALUES (?, ?, ?, ?, ?, ?, 'active')`,
          [id, equipment_id, employee_id, allocated_date, expected_return_date, notes],
          function(err) {
            if (err) {
              return callback(err);
            }

            // Update equipment status to allocated
            db.run(
              'UPDATE equipment SET status = ? WHERE id = ?',
              ['allocated', equipment_id],
              (err) => {
                if (err) {
                  return callback(err);
                }
                Allocation.getById(id, callback);
              }
            );
          }
        );
      }
    );
  }

  static returnEquipment(id, actual_return_date, callback) {
    db.get('SELECT equipment_id FROM allocations WHERE id = ?', [id], (err, allocation) => {
      if (err) {
        return callback(err);
      }
      if (!allocation) {
        return callback(new Error('Allocation not found'));
      }

      // Update allocation status
      db.run(
        `UPDATE allocations 
         SET status = 'returned', actual_return_date = ?
         WHERE id = ?`,
        [actual_return_date, id],
        (err) => {
          if (err) {
            return callback(err);
          }

          // Update equipment status back to available
          db.run(
            'UPDATE equipment SET status = ? WHERE id = ?',
            ['available', allocation.equipment_id],
            (err) => {
              if (err) {
                return callback(err);
              }
              Allocation.getById(id, callback);
            }
          );
        }
      );
    });
  }

  static getActive(callback) {
    db.all(
      `SELECT a.*, 
              e.name as employee_name, e.email as employee_email, e.department,
              eq.name as equipment_name, eq.category, eq.serial_number
       FROM allocations a
       JOIN employees e ON a.employee_id = e.id
       JOIN equipment eq ON a.equipment_id = eq.id
       WHERE a.status = 'active'
       ORDER BY a.allocated_date DESC`,
      [],
      callback
    );
  }

  static getByEmployee(employee_id, callback) {
    db.all(
      `SELECT a.*, 
              eq.name as equipment_name, eq.category, eq.serial_number
       FROM allocations a
       JOIN equipment eq ON a.equipment_id = eq.id
       WHERE a.employee_id = ?
       ORDER BY a.allocated_date DESC`,
      [employee_id],
      callback
    );
  }

  static getByEquipment(equipment_id, callback) {
    db.all(
      `SELECT a.*, 
              e.name as employee_name, e.email as employee_email, e.department
       FROM allocations a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.equipment_id = ?
       ORDER BY a.allocated_date DESC`,
      [equipment_id],
      callback
    );
  }
}

module.exports = Allocation;
