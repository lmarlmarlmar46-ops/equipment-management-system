# Work Assignments Widget
from PyQt6.QtWidgets import *
from PyQt6.QtCore import *
from PyQt6.QtGui import *
from datetime import datetime

class WorkAssignmentsWidget(QWidget):
    def __init__(self, db, user):
        super().__init__()
        self.db = db
        self.user = user
        self.init_ui()
        self.load_data()
    
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Header
        header = QHBoxLayout()
        title = QLabel('Work Assignments')
        title.setStyleSheet('font-size: 24px; font-weight: bold; color: #e6edf3;')
        header.addWidget(title)
        header.addStretch()
        
        if self.user['role'] in ['admin', 'manager']:
            refresh_btn = QPushButton('🔄 Refresh')
            refresh_btn.clicked.connect(self.load_data)
            header.addWidget(refresh_btn)
        
        layout.addLayout(header)
        
        # Tabs
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet('''
            QTabWidget::pane { border: 1px solid #30363d; background: #0d1117; }
            QTabBar::tab { background: #161b22; color: #8b949e; padding: 10px 20px; }
            QTabBar::tab:selected { background: #1f6feb; color: white; }
        ''')
        
        # All assignments tab
        self.all_tab = self.create_assignments_list('all')
        self.tabs.addTab(self.all_tab, 'All')
        
        self.pending_tab = self.create_assignments_list('pending')
        self.tabs.addTab(self.pending_tab, 'Pending')
        
        self.accepted_tab = self.create_assignments_list('accepted')
        self.tabs.addTab(self.accepted_tab, 'Accepted')
        
        self.completed_tab = self.create_assignments_list('completed')
        self.tabs.addTab(self.completed_tab, 'Completed')
        
        layout.addWidget(self.tabs)
        
        # User list for managers
        if self.user['role'] in ['admin', 'manager']:
            users_group = QGroupBox('Available Users')
            users_group.setStyleSheet('QGroupBox { color: #e6edf3; font-weight: bold; }')
            users_layout = QVBoxLayout()
            
            self.users_table = QTableWidget()
            self.users_table.setStyleSheet('''
                QTableWidget { background: #0d1117; color: #e6edf3; gridline-color: #30363d; }
                QHeaderView::section { background: #161b22; color: #8b949e; padding: 8px; }
            ''')
            self.users_table.setColumnCount(5)
            self.users_table.setHorizontalHeaderLabels(['Username', 'Email', 'Department', 'Role', 'Action'])
            self.users_table.horizontalHeader().setStretchLastSection(True)
            
            users_layout.addWidget(self.users_table)
            users_group.setLayout(users_layout)
            layout.addWidget(users_group)
        
        self.setLayout(layout)
    
    def create_assignments_list(self, status_filter):
        widget = QWidget()
        layout = QVBoxLayout()
        
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet('QScrollArea { border: none; background: #0d1117; }')
        
        content = QWidget()
        self.assignment_layouts = {}
        self.assignment_layouts[status_filter] = QVBoxLayout()
        content.setLayout(self.assignment_layouts[status_filter])
        
        scroll.setWidget(content)
        layout.addWidget(scroll)
        widget.setLayout(layout)
        
        return widget
    
    def load_data(self):
        # Load assignments
        role = self.user['role']
        user_id = self.user['id'] if role == 'employee' else None
        
        assignments = self.db.get_assignments(user_id=user_id, role=role)
        
        # Clear and populate lists
        for status in ['all', 'pending', 'accepted', 'completed']:
            layout = self.assignment_layouts.get(status)
            if layout:
                while layout.count():
                    child = layout.takeAt(0)
                    if child.widget():
                        child.widget().deleteLater()
                
                filtered = [a for a in assignments if status == 'all' or a['status'] == status]
                
                for assignment in filtered:
                    card = self.create_assignment_card(assignment)
                    layout.addWidget(card)
                
                layout.addStretch()
        
        # Load users for managers
        if self.user['role'] in ['admin', 'manager']:
            users = self.db.get_all_users()
            self.users_table.setRowCount(len(users))
            
            for i, user in enumerate(users):
                self.users_table.setItem(i, 0, QTableWidgetItem(user['username']))
                self.users_table.setItem(i, 1, QTableWidgetItem(user['email']))
                self.users_table.setItem(i, 2, QTableWidgetItem(user.get('department', 'N/A')))
                self.users_table.setItem(i, 3, QTableWidgetItem(user['role']))
                
                assign_btn = QPushButton('Assign Work')
                assign_btn.clicked.connect(lambda checked, u=user: self.show_assign_dialog(u))
                self.users_table.setCellWidget(i, 4, assign_btn)
    
    def create_assignment_card(self, assignment):
        card = QFrame()
        card.setStyleSheet('''
            QFrame { 
                background: #161b22; 
                border: 1px solid #30363d; 
                border-radius: 8px; 
                padding: 15px;
                margin: 5px;
            }
        ''')
        
        layout = QVBoxLayout()
        
        # Header
        header_layout = QHBoxLayout()
        
        status_label = QLabel(assignment['status'].upper())
        status_colors = {
            'pending': '#d29922',
            'accepted': '#58a6ff',
            'in_progress': '#1f6feb',
            'completed': '#2ea043',
            'rejected': '#da3633'
        }
        status_label.setStyleSheet(f'''
            background: {status_colors.get(assignment['status'], '#6e7681')}; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 12px;
            font-weight: bold;
            font-size: 11px;
        ''')
        header_layout.addWidget(status_label)
        
        priority_label = QLabel(assignment['priority'].upper())
        priority_colors = {'low': '#2ea043', 'medium': '#d29922', 'high': '#f85149', 'urgent': '#da3633'}
        priority_label.setStyleSheet(f'''
            background: {priority_colors.get(assignment['priority'], '#6e7681')}; 
            color: white; 
            padding: 4px 12px; 
            border-radius: 12px;
            font-weight: bold;
            font-size: 11px;
        ''')
        header_layout.addWidget(priority_label)
        header_layout.addStretch()
        
        date_label = QLabel(assignment['created_at'][:10] if assignment.get('created_at') else '')
        date_label.setStyleSheet('color: #8b949e; font-size: 12px;')
        header_layout.addWidget(date_label)
        
        layout.addLayout(header_layout)
        
        # Task description
        task_label = QLabel(assignment['task_description'])
        task_label.setWordWrap(True)
        task_label.setStyleSheet('color: #e6edf3; font-size: 14px; font-weight: bold; margin-top: 10px;')
        layout.addWidget(task_label)
        
        # Details
        details = []
        if assignment.get('employee_name'):
            details.append(f"👤 {assignment['employee_name']}")
        if assignment.get('department'):
            details.append(f"🏢 {assignment['department']}")
        if assignment.get('location'):
            details.append(f"📍 {assignment['location']}")
        
        if details:
            details_label = QLabel(' | '.join(details))
            details_label.setStyleSheet('color: #8b949e; font-size: 12px; margin-top: 5px;')
            layout.addWidget(details_label)
        
        # Notes
        if assignment.get('notes'):
            notes_label = QLabel(f"📝 {assignment['notes']}")
            notes_label.setWordWrap(True)
            notes_label.setStyleSheet('color: #8b949e; font-size: 12px; margin-top: 5px;')
            layout.addWidget(notes_label)
        
        # Action buttons for employees
        if self.user['role'] == 'employee' and assignment['assigned_to'] == self.user['id']:
            btn_layout = QHBoxLayout()
            
            if assignment['status'] == 'pending':
                accept_btn = QPushButton('✅ Accept')
                accept_btn.setStyleSheet('background: #2ea043;')
                accept_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'accepted'))
                btn_layout.addWidget(accept_btn)
                
                reject_btn = QPushButton('❌ Reject')
                reject_btn.setStyleSheet('background: #da3633;')
                reject_btn.clicked.connect(lambda: self.reject_assignment(assignment['id']))
                btn_layout.addWidget(reject_btn)
            
            elif assignment['status'] == 'accepted':
                start_btn = QPushButton('▶️ Start Work')
                start_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'in_progress'))
                btn_layout.addWidget(start_btn)
            
            elif assignment['status'] == 'in_progress':
                complete_btn = QPushButton('✔️ Complete')
                complete_btn.setStyleSheet('background: #2ea043;')
                complete_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'completed'))
                btn_layout.addWidget(complete_btn)
            
            layout.addLayout(btn_layout)
        
        card.setLayout(layout)
        return card
    
    def show_assign_dialog(self, user):
        dialog = QDialog(self)
        dialog.setWindowTitle(f'Assign Work to {user["username"]}')
        dialog.setModal(True)
        dialog.setFixedWidth(500)
        
        layout = QVBoxLayout()
        
        # Task description
        task_label = QLabel('Task Description:')
        task_input = QTextEdit()
        task_input.setMaximumHeight(100)
        layout.addWidget(task_label)
        layout.addWidget(task_input)
        
        # Department
        dept_label = QLabel('Department:')
        dept_input = QLineEdit()
        dept_input.setText(user.get('department', ''))
        layout.addWidget(dept_label)
        layout.addWidget(dept_input)
        
        # Location
        loc_label = QLabel('Location:')
        loc_input = QLineEdit()
        layout.addWidget(loc_label)
        layout.addWidget(loc_input)
        
        # Priority
        priority_label = QLabel('Priority:')
        priority_combo = QComboBox()
        priority_combo.addItems(['low', 'medium', 'high', 'urgent'])
        priority_combo.setCurrentText('medium')
        layout.addWidget(priority_label)
        layout.addWidget(priority_combo)
        
        # Notes
        notes_label = QLabel('Notes:')
        notes_input = QTextEdit()
        notes_input.setMaximumHeight(80)
        layout.addWidget(notes_label)
        layout.addWidget(notes_input)
        
        # Buttons
        btn_layout = QHBoxLayout()
        cancel_btn = QPushButton('Cancel')
        cancel_btn.clicked.connect(dialog.reject)
        assign_btn = QPushButton('Assign')
        assign_btn.setStyleSheet('background: #238636;')
        assign_btn.clicked.connect(lambda: self.assign_work(
            user['id'], 
            task_input.toPlainText(),
            dept_input.text(),
            loc_input.text(),
            priority_combo.currentText(),
            notes_input.toPlainText(),
            dialog
        ))
        btn_layout.addWidget(cancel_btn)
        btn_layout.addWidget(assign_btn)
        layout.addLayout(btn_layout)
        
        dialog.setLayout(layout)
        dialog.exec()
    
    def assign_work(self, user_id, task, dept, loc, priority, notes, dialog):
        if not task:
            QMessageBox.warning(self, 'Error', 'Task description is required')
            return
        
        self.db.create_assignment(
            assigned_to=user_id,
            assigned_by=self.user['id'],
            task_description=task,
            department=dept,
            location=loc,
            priority=priority,
            notes=notes
        )
        
        QMessageBox.information(self, 'Success', 'Work assigned successfully!')
        dialog.accept()
        self.load_data()
    
    def update_status(self, assignment_id, status):
        self.db.update_assignment_status(assignment_id, status)
        self.load_data()
    
    def reject_assignment(self, assignment_id):
        reason, ok = QInputDialog.getText(self, 'Reject Assignment', 'Rejection reason:')
        if ok and reason:
            self.db.update_assignment_status(assignment_id, 'rejected', reason)
            self.load_data()
