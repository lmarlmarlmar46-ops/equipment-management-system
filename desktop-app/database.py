import sqlite3
import os
from datetime import datetime
import bcrypt

class Database:
    def __init__(self, db_path="equiptrack.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Users table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'employee',
                status TEXT DEFAULT 'active',
                phone TEXT,
                department TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP
            )
        """)
        
        # Work Assignments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS work_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (assigned_by) REFERENCES users(id)
            )
        """)
        
        # Notifications table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                is_read INTEGER DEFAULT 0,
                action_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        # Equipment table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS equipment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Allocations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS allocations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                equipment_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                allocated_date DATE NOT NULL,
                expected_return_date DATE,
                actual_return_date DATE,
                status TEXT DEFAULT 'active',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (equipment_id) REFERENCES equipment(id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        
        conn.commit()
        conn.close()
        
        # Create default admin user if none exists
        self.create_default_admin()
    
    def create_default_admin(self):
        """Create default admin account"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
        if cursor.fetchone()[0] == 0:
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, role, department)
                VALUES (?, ?, ?, ?, ?)
            """, ('admin', 'admin@equiptrack.com', password_hash, 'admin', 'IT'))
            conn.commit()
        
        conn.close()
    
    # User methods
    def create_user(self, username, email, password, role='employee', department=None, phone=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        try:
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, role, department, phone)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (username, email, password_hash, role, department, phone))
            conn.commit()
            return cursor.lastrowid
        except sqlite3.IntegrityError as e:
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, email, password):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ? AND status = 'active'", (email,))
        user = cursor.fetchone()
        
        if user and bcrypt.checkpw(password.encode('utf-8'), user['password_hash']):
            # Update last login
            cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", 
                         (datetime.now(), user['id']))
            conn.commit()
            conn.close()
            return dict(user)
        
        conn.close()
        return None
    
    def get_all_users(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, username, email, role, status, department, phone, created_at FROM users ORDER BY created_at DESC")
        users = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return users
    
    def update_user_role(self, user_id, new_role):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))
        conn.commit()
        conn.close()
    
    # Work Assignment methods
    def create_assignment(self, assigned_to, assigned_by, task_description, department=None, 
                         location=None, priority='medium', due_date=None, notes=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO work_assignments (assigned_to, assigned_by, task_description, 
                                         department, location, priority, due_date, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (assigned_to, assigned_by, task_description, department, location, priority, due_date, notes))
        
        assignment_id = cursor.lastrowid
        
        # Create notification
        cursor.execute("SELECT username FROM users WHERE id = ?", (assigned_by,))
        manager = cursor.fetchone()
        manager_name = manager['username'] if manager else 'Manager'
        
        cursor.execute("""
            INSERT INTO notifications (user_id, type, title, message, action_url)
            VALUES (?, ?, ?, ?, ?)
        """, (assigned_to, 'work_assignment', 'New Work Assignment',
              f"{manager_name} assigned you a new task: {task_description[:50]}...",
              f'/work-assignments/{assignment_id}'))
        
        conn.commit()
        conn.close()
        return assignment_id
    
    def get_assignments(self, user_id=None, role=None, status=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = """
            SELECT wa.*, 
                   u1.username as employee_name,
                   u1.email as employee_email,
                   u2.username as manager_name
            FROM work_assignments wa
            LEFT JOIN users u1 ON wa.assigned_to = u1.id
            LEFT JOIN users u2 ON wa.assigned_by = u2.id
            WHERE 1=1
        """
        params = []
        
        if role == 'employee' and user_id:
            query += " AND wa.assigned_to = ?"
            params.append(user_id)
        
        if status:
            query += " AND wa.status = ?"
            params.append(status)
        
        query += " ORDER BY wa.created_at DESC"
        
        cursor.execute(query, params)
        assignments = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return assignments
    
    def update_assignment_status(self, assignment_id, status, rejection_reason=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        update_query = "UPDATE work_assignments SET status = ?, updated_at = ?"
        params = [status, datetime.now()]
        
        if status == 'accepted':
            update_query += ", accepted_at = ?"
            params.append(datetime.now())
        elif status == 'completed':
            update_query += ", completed_at = ?"
            params.append(datetime.now())
        elif status == 'rejected' and rejection_reason:
            update_query += ", rejection_reason = ?"
            params.append(rejection_reason)
        
        update_query += " WHERE id = ?"
        params.append(assignment_id)
        
        cursor.execute(update_query, params)
        
        # Create notification for manager
        cursor.execute("SELECT assigned_by, assigned_to FROM work_assignments WHERE id = ?", (assignment_id,))
        assignment = cursor.fetchone()
        
        if assignment:
            cursor.execute("SELECT username FROM users WHERE id = ?", (assignment['assigned_to'],))
            employee = cursor.fetchone()
            employee_name = employee['username'] if employee else 'Employee'
            
            message = f"{employee_name} {status} the work assignment"
            if status == 'rejected' and rejection_reason:
                message += f": {rejection_reason}"
            
            cursor.execute("""
                INSERT INTO notifications (user_id, type, title, message, action_url)
                VALUES (?, ?, ?, ?, ?)
            """, (assignment['assigned_by'], 'work_assignment_update', 
                  'Work Assignment Update', message, f'/work-assignments/{assignment_id}'))
        
        conn.commit()
        conn.close()
    
    # Notification methods
    def get_unread_notifications(self, user_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE user_id = ? AND is_read = 0 
            ORDER BY created_at DESC
        """, (user_id,))
        notifications = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return notifications
    
    def mark_notification_read(self, notification_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
        conn.commit()
        conn.close()
    
    def mark_all_notifications_read(self, user_id):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", (user_id,))
        conn.commit()
        conn.close()
