const db = require('../database');
const { v4: uuidv4 } = require('uuid');

class Equipment {
  static getAll(callback) {
    db.all('SELECT * FROM equipment ORDER BY created_at DESC', [], callback);
  }

  static getById(id, callback) {
    db.get('SELECT * FROM equipment WHERE id = ?', [id], callback);
  }

  static create(data, callback) {
    const id = uuidv4();
    const {
      name, category, brand, model, serial_number,
      purchase_date, purchase_price, status = 'available',
      condition = 'good', notes
    } = data;
    
    db.run(
      `INSERT INTO equipment 
       (id, name, category, brand, model, serial_number, purchase_date, 
        purchase_price, status, condition, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, category, brand, model, serial_number, purchase_date,
       purchase_price, status, condition, notes],
      function(err) {
        if (err) {
          callback(err);
        } else {
          Equipment.getById(id, callback);
        }
      }
    );
  }

  static update(id, data, callback) {
    const {
      name, category, brand, model, serial_number,
      purchase_date, purchase_price, status, condition, notes
    } = data;
    
    db.run(
      `UPDATE equipment 
       SET name = ?, category = ?, brand = ?, model = ?, serial_number = ?,
           purchase_date = ?, purchase_price = ?, status = ?, condition = ?, notes = ?
       WHERE id = ?`,
      [name, category, brand, model, serial_number, purchase_date,
       purchase_price, status, condition, notes, id],
      function(err) {
        if (err) {
          callback(err);
        } else {
          Equipment.getById(id, callback);
        }
      }
    );
  }

  static delete(id, callback) {
    db.run('DELETE FROM equipment WHERE id = ?', [id], callback);
  }

  static getAvailable(callback) {
    db.all(
      'SELECT * FROM equipment WHERE status = ? ORDER BY name',
      ['available'],
      callback
    );
  }

  static getByStatus(status, callback) {
    db.all(
      'SELECT * FROM equipment WHERE status = ? ORDER BY created_at DESC',
      [status],
      callback
    );
  }
}

module.exports = Equipment;
