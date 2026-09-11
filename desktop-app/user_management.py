
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QTableWidget, 
                             QTableWidgetItem, QPushButton, QLabel, QMessageBox, QComboBox)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

class UserManagementWidget(QWidget):
    def __init__(self, db, user):
        super().__init__()
        self.db = db
        self.user = user
        self.init_ui()
        self.load_users()
    
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Header
        header = QHBoxLayout()
        title = QLabel('User Management')
        title.setFont(QFont("Arial", 24, QFont.Weight.Bold))
        title.setStyleSheet('color: #e6edf3;')
        header.addWidget(title)
        
        header.addStretch()
        
        refresh_btn = QPushButton('🔄 Refresh')
        refresh_btn.clicked.connect(self.load_users)
        header.addWidget(refresh_btn)
        
        layout.addLayout(header)
        
        # Users table
        self.table = QTableWidget()
        self.table.setColumnCount(6)
        self.table.setHorizontalHeaderLabels([
            'Username', 'Email', 'Department', 'Role', 'Status', 'Actions'
        ])
        
        self.table.setStyleSheet("""
            QTableWidget {
                background-color: #0d1117;
                color: #e6edf3;
                gridline-color: #30363d;
                border: 1px solid #30363d;
            }
            QHeaderView::section {
                background-color: #161b22;
                color: #8b949e;
                padding: 10px;
                border: none;
                font-weight: bold;
            }
            QTableWidget::item {
                padding: 8px;
            }
            QTableWidget::item:selected {
                background-color: #1f6feb;
            }
        """)
        
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        self.table.verticalHeader().setVisible(False)
        
        layout.addWidget(self.table)
        
        self.setLayout(layout)
    
    def load_users(self):
        users = self.db.get_all_users()
        self.table.setRowCount(len(users))
        
        for i, user in enumerate(users):
            self.table.setItem(i, 0, QTableWidgetItem(user['username']))
            self.table.setItem(i, 1, QTableWidgetItem(user['email']))
            self.table.setItem(i, 2, QTableWidgetItem(user.get('department', 'N/A')))
            self.table.setItem(i, 3, QTableWidgetItem(user['role']))
            
            # Status with color
            status_item = QTableWidgetItem(user['status'])
            if user['status'] == 'active':
                status_item.setForeground(Qt.GlobalColor.green)
            else:
                status_item.setForeground(Qt.GlobalColor.red)
            self.table.setItem(i, 4, status_item)
            
            # Actions
            actions_widget = QWidget()
            actions_layout = QHBoxLayout()
            actions_layout.setContentsMargins(5, 2, 5, 2)
            
            # Role selector
            role_combo = QComboBox()
            role_combo.addItems(['employee', 'manager', 'admin'])
            role_combo.setCurrentText(user['role'])
            role_combo.currentTextChanged.connect(
                lambda new_role, uid=user['id'], curr=user['role']: 
                self.change_role(uid, curr, new_role)
            )
            
            # Only allow role changes if current user is admin or 
            # if manager changing to employee/manager (not admin)
            if self.user['role'] == 'admin':
                role_combo.setEnabled(True)
            elif self.user['role'] == 'manager':
                role_combo.setEnabled(user['role'] != 'admin')
            else:
                role_combo.setEnabled(False)
            
            actions_layout.addWidget(role_combo)
            actions_widget.setLayout(actions_layout)
            
            self.table.setCellWidget(i, 5, actions_widget)
    
    def change_role(self, user_id, old_role, new_role):
        if old_role == new_role:
            return
        
        # Validation
        if self.user['role'] == 'manager' and new_role == 'admin':
            QMessageBox.warning(self, 'Permission Denied', 
                              'Only admins can promote users to admin role.')
            self.load_users()  # Reset the combo box
            return
        
        reply = QMessageBox.question(
            self, 'Confirm Role Change',
            f'Change user role from {old_role} to {new_role}?',
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            self.db.update_user_role(user_id, new_role)
            QMessageBox.information(self, 'Success', 
                                  f'User role updated to {new_role}')
            self.load_users()
        else:
            self.load_users()  # Reset the combo box
