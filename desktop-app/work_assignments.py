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
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)
        
        # Simple header
        header_container = QWidget()
        header_container.setStyleSheet("""
            background: #1a1a1a;
            border: 1px solid #333333;
            border-radius: 10px;
            padding: 25px;
        """)
        header_layout = QVBoxLayout()
        
        title_row = QHBoxLayout()
        title = QLabel('Work Assignments')
        title.setFont(QFont("Segoe UI", 26, QFont.Weight.Bold))
        title.setStyleSheet('color: #ffffff;')
        title_row.addWidget(title)
        title_row.addStretch()
        
        if self.user['role'] in ['admin', 'manager']:
            refresh_btn = QPushButton('Refresh')
            refresh_btn.setStyleSheet("""
                QPushButton {
                    background: #0066ff;
                    border: none;
                    color: white;
                    font-weight: 600;
                    padding: 12px 24px;
                    border-radius: 8px;
                }
                QPushButton:hover {
                    background: #0052cc;
                }
            """)
            refresh_btn.clicked.connect(self.load_data)
            title_row.addWidget(refresh_btn)
        
        subtitle = QLabel('Manage and track all work assignments')
        subtitle.setStyleSheet('color: #888888; font-size: 14px;')
        
        header_layout.addLayout(title_row)
        header_layout.addWidget(subtitle)
        header_container.setLayout(header_layout)
        
        layout.addWidget(header_container)
        
        # Simple tabs
        self.tabs = QTabWidget()
        self.tabs.setStyleSheet('''
            QTabWidget::pane {
                border: 1px solid #333333;
                background: #0d0d0d;
                border-radius: 8px;
                padding: 15px;
            }
            QTabBar::tab {
                background: #1a1a1a;
                color: #888888;
                padding: 12px 24px;
                margin-right: 4px;
                border-top-left-radius: 6px;
                border-top-right-radius: 6px;
                font-weight: 600;
            }
            QTabBar::tab:hover {
                background: #2a2a2a;
                color: #ffffff;
            }
            QTabBar::tab:selected {
                background: #0066ff;
                color: white;
            }
        ''')
        
        self.all_tab = self.create_assignments_list('all')
        self.tabs.addTab(self.all_tab, 'All')
        
        self.pending_tab = self.create_assignments_list('pending')
        self.tabs.addTab(self.pending_tab, 'Pending')
        
        self.accepted_tab = self.create_assignments_list('accepted')
        self.tabs.addTab(self.accepted_tab, 'Accepted')
        
        self.completed_tab = self.create_assignments_list('completed')
        self.tabs.addTab(self.completed_tab, 'Completed')
        
        layout.addWidget(self.tabs)
        
        # Team members
        if self.user['role'] in ['admin', 'manager']:
            users_group = QGroupBox('Team Members')
            users_group.setStyleSheet('''
                QGroupBox {
                    color: #ffffff;
                    font-weight: 700;
                    font-size: 16px;
                    border: 1px solid #333333;
                    border-radius: 8px;
                    padding: 20px;
                    margin-top: 20px;
                    background: #1a1a1a;
                }
                QGroupBox::title {
                    subcontrol-origin: margin;
                    left: 15px;
                    padding: 0 10px;
                    color: #0066ff;
                }
            ''')
            users_layout = QVBoxLayout()
            
            self.users_table = QTableWidget()
            self.users_table.setStyleSheet('''
                QTableWidget {
                    background: #0d0d0d;
                    color: #ffffff;
                    gridline-color: #333333;
                    border: 1px solid #333333;
                    border-radius: 6px;
                }
                QHeaderView::section {
                    background: #1a1a1a;
                    color: #888888;
                    padding: 12px;
                    border: none;
                    border-bottom: 2px solid #30363d;
                    font-weight: 600;
                    font-size: 12px;
                }
                QTableWidget::item {
                    padding: 12px 8px;
                    border-bottom: 1px solid #21262d;
                }
                QTableWidget::item:hover {
                    background: #161b22;
                }
            ''')
            self.users_table.setColumnCount(5)
            self.users_table.setHorizontalHeaderLabels(['Username', 'Email', 'Department', 'Role', 'Action'])
            self.users_table.horizontalHeader().setStretchLastSection(True)
            self.users_table.verticalHeader().setVisible(False)
            self.users_table.setAlternatingRowColors(True)
            
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
                assign_btn.setFixedWidth(120)
                assign_btn.setStyleSheet('''
                    QPushButton {
                        background: #0066ff;
                        color: white;
                        font-weight: 600;
                        border: none;
                        border-radius: 6px;
                        padding: 8px 16px;
                    }
                    QPushButton:hover {
                        background: #0052cc;
                    }
                ''')
                assign_btn.clicked.connect(lambda checked, u=user: self.show_assign_dialog(u))
                
                # Center the button in the cell
                btn_widget = QWidget()
                btn_layout = QHBoxLayout()
                btn_layout.setContentsMargins(0, 0, 0, 0)
                btn_layout.addStretch()
                btn_layout.addWidget(assign_btn)
                btn_layout.addStretch()
                btn_widget.setLayout(btn_layout)
                
                self.users_table.setCellWidget(i, 4, btn_widget)
    
    def create_assignment_card(self, assignment):
        card = QFrame()
        card.setStyleSheet('''
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #161b22, stop:1 #1c2128);
                border: 2px solid #30363d;
                border-radius: 16px;
                padding: 20px;
                margin: 8px 4px;
            }
            QFrame:hover {
                border-color: #58a6ff;
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #1c2128, stop:1 #22272e);
            }
        ''')
        
        layout = QVBoxLayout()
        layout.setSpacing(12)
        
        # Header with badges
        header_layout = QHBoxLayout()
        
        status_label = QLabel(f"  {assignment['status'].upper()}  ")
        status_colors = {
            'pending': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #d29922, stop:1 #f0a020); color: #000;',
            'accepted': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #58a6ff, stop:1 #79c0ff); color: #000;',
            'in_progress': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #1f6feb, stop:1 #388bfd); color: white;',
            'completed': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #2ea043, stop:1 #46d15b); color: #000;',
            'rejected': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #da3633, stop:1 #f85149); color: white;'
        }
        status_label.setStyleSheet(f'''
            {status_colors.get(assignment['status'], 'background: #6e7681; color: white;')}
            padding: 6px 14px;
            border-radius: 16px;
            font-weight: bold;
            font-size: 11px;
        ''')
        header_layout.addWidget(status_label)
        
        priority_label = QLabel(f"  {assignment['priority'].upper()}  ")
        priority_colors = {
            'low': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #2ea043, stop:1 #46d15b); color: #000;',
            'medium': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #d29922, stop:1 #f0a020); color: #000;',
            'high': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #f85149, stop:1 #ff6b6b); color: white;',
            'urgent': 'background: qlineargradient(x1:0, y1:0, x2:1, y2:0, stop:0 #da3633, stop:1 #ff0000); color: white;'
        }
        priority_label.setStyleSheet(f'''
            {priority_colors.get(assignment['priority'], 'background: #6e7681; color: white;')}
            padding: 6px 14px;
            border-radius: 16px;
            font-weight: bold;
            font-size: 11px;
        ''')
        header_layout.addWidget(priority_label)
        header_layout.addStretch()
        
        date_label = QLabel(f"📅 {assignment['created_at'][:10]}" if assignment.get('created_at') else '')
        date_label.setStyleSheet('color: #8b949e; font-size: 12px; font-weight: 600;')
        header_layout.addWidget(date_label)
        
        layout.addLayout(header_layout)
        
        # Divider line
        divider = QFrame()
        divider.setFrameShape(QFrame.Shape.HLine)
        divider.setStyleSheet('background: #30363d; max-height: 1px;')
        layout.addWidget(divider)
        
        # Task description with better typography
        task_label = QLabel(assignment['task_description'])
        task_label.setWordWrap(True)
        task_label.setStyleSheet('''
            color: #e6edf3;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.6;
            margin: 8px 0;
        ''')
        layout.addWidget(task_label)
        
        # Details with icons
        details_container = QWidget()
        details_container.setStyleSheet('background: rgba(88, 166, 255, 0.08); border-radius: 8px; padding: 12px;')
        details_layout = QVBoxLayout()
        details_layout.setSpacing(6)
        
        if assignment.get('employee_name'):
            emp_label = QLabel(f"👤  {assignment['employee_name']}")
            emp_label.setStyleSheet('color: #e6edf3; font-size: 13px; font-weight: 500; background: transparent;')
            details_layout.addWidget(emp_label)
        
        if assignment.get('department'):
            dept_label = QLabel(f"🏢  {assignment['department']}")
            dept_label.setStyleSheet('color: #8b949e; font-size: 13px; background: transparent;')
            details_layout.addWidget(dept_label)
        
        if assignment.get('location'):
            loc_label = QLabel(f"📍  {assignment['location']}")
            loc_label.setStyleSheet('color: #8b949e; font-size: 13px; background: transparent;')
            details_layout.addWidget(loc_label)
        
        details_container.setLayout(details_layout)
        if assignment.get('employee_name') or assignment.get('department') or assignment.get('location'):
            layout.addWidget(details_container)
        
        # Notes
        if assignment.get('notes'):
            notes_container = QWidget()
            notes_container.setStyleSheet('background: rgba(139, 148, 158, 0.08); border-radius: 8px; padding: 12px; margin-top: 8px;')
            notes_layout = QVBoxLayout()
            notes_layout.setContentsMargins(0, 0, 0, 0)
            
            notes_title = QLabel("📝 Notes:")
            notes_title.setStyleSheet('color: #8b949e; font-size: 11px; font-weight: bold; background: transparent;')
            notes_layout.addWidget(notes_title)
            
            notes_label = QLabel(assignment['notes'])
            notes_label.setWordWrap(True)
            notes_label.setStyleSheet('color: #8b949e; font-size: 13px; background: transparent; margin-top: 4px;')
            notes_layout.addWidget(notes_label)
            
            notes_container.setLayout(notes_layout)
            layout.addWidget(notes_container)
        
        # Action buttons for employees with enhanced styling
        if self.user['role'] == 'employee' and assignment['assigned_to'] == self.user['id']:
            btn_layout = QHBoxLayout()
            btn_layout.setSpacing(8)
            btn_layout.setContentsMargins(0, 12, 0, 0)
            
            if assignment['status'] == 'pending':
                accept_btn = QPushButton('✅  Accept Assignment')
                accept_btn.setStyleSheet('''
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #2ea043, stop:1 #46d15b);
                        color: white;
                        font-weight: 600;
                        min-height: 40px;
                        border: none;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #238636, stop:1 #2ea043);
                    }
                ''')
                accept_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'accepted'))
                btn_layout.addWidget(accept_btn)
                
                reject_btn = QPushButton('❌  Reject')
                reject_btn.setStyleSheet('''
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #da3633, stop:1 #f85149);
                        color: white;
                        font-weight: 600;
                        min-height: 40px;
                        border: none;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #b62324, stop:1 #da3633);
                    }
                ''')
                reject_btn.clicked.connect(lambda: self.reject_assignment(assignment['id']))
                btn_layout.addWidget(reject_btn)
            
            elif assignment['status'] == 'accepted':
                start_btn = QPushButton('▶️  Start Working')
                start_btn.setStyleSheet('''
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #1f6feb, stop:1 #388bfd);
                        color: white;
                        font-weight: 600;
                        min-height: 40px;
                        border: none;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #1158c7, stop:1 #1f6feb);
                    }
                ''')
                start_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'in_progress'))
                btn_layout.addWidget(start_btn)
            
            elif assignment['status'] == 'in_progress':
                complete_btn = QPushButton('✔️  Mark as Complete')
                complete_btn.setStyleSheet('''
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #2ea043, stop:1 #46d15b);
                        color: white;
                        font-weight: 600;
                        min-height: 40px;
                        border: none;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #238636, stop:1 #2ea043);
                    }
                ''')
                complete_btn.clicked.connect(lambda: self.update_status(assignment['id'], 'completed'))
                btn_layout.addWidget(complete_btn)
            
            layout.addLayout(btn_layout)
        
        card.setLayout(layout)
        return card
    
    def show_assign_dialog(self, user):
        dialog = QDialog(self)
        dialog.setWindowTitle(f'Assign Work to {user["username"]}')
        dialog.setModal(True)
        dialog.setFixedWidth(550)
        dialog.setStyleSheet('''
            QDialog {
                background: #0d1117;
            }
            QLabel {
                color: #e6edf3;
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 6px;
            }
            QLineEdit, QTextEdit, QComboBox {
                background: #161b22;
                color: #e6edf3;
                border: 2px solid #30363d;
                border-radius: 8px;
                padding: 10px;
                font-size: 13px;
            }
            QLineEdit:focus, QTextEdit:focus, QComboBox:focus {
                border-color: #58a6ff;
            }
            QComboBox::drop-down {
                border: none;
                width: 30px;
            }
            QComboBox::down-arrow {
                image: none;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 5px solid #8b949e;
                margin-right: 10px;
            }
        ''')
        
        layout = QVBoxLayout()
        layout.setSpacing(16)
        layout.setContentsMargins(24, 24, 24, 24)
        
        # Header
        header_label = QLabel(f'Creating assignment for: {user["username"]}')
        header_label.setStyleSheet('font-size: 16px; font-weight: bold; color: #58a6ff; margin-bottom: 16px;')
        layout.addWidget(header_label)
        
        # Task description
        task_label = QLabel('📝 Task Description *')
        task_input = QTextEdit()
        task_input.setMaximumHeight(100)
        task_input.setPlaceholderText('Enter detailed task description...')
        layout.addWidget(task_label)
        layout.addWidget(task_input)
        
        # Department
        dept_label = QLabel('🏢 Department')
        dept_input = QLineEdit()
        dept_input.setText(user.get('department', ''))
        dept_input.setPlaceholderText('e.g., IT, HR, Engineering')
        layout.addWidget(dept_label)
        layout.addWidget(dept_input)
        
        # Location
        loc_label = QLabel('📍 Location')
        loc_input = QLineEdit()
        loc_input.setPlaceholderText('e.g., Building A, Floor 3')
        layout.addWidget(loc_label)
        layout.addWidget(loc_input)
        
        # Priority
        priority_label = QLabel('⚡ Priority Level')
        priority_combo = QComboBox()
        priority_combo.addItems(['Low', 'Medium', 'High', 'Urgent'])
        priority_combo.setCurrentIndex(1)  # Medium by default
        layout.addWidget(priority_label)
        layout.addWidget(priority_combo)
        
        # Notes
        notes_label = QLabel('📋 Additional Notes')
        notes_input = QTextEdit()
        notes_input.setMaximumHeight(80)
        notes_input.setPlaceholderText('Any additional information...')
        layout.addWidget(notes_label)
        layout.addWidget(notes_input)
        
        # Buttons
        btn_layout = QHBoxLayout()
        btn_layout.setSpacing(12)
        btn_layout.setContentsMargins(0, 16, 0, 0)
        
        cancel_btn = QPushButton('Cancel')
        cancel_btn.setStyleSheet('''
            QPushButton {
                background: #21262d;
                color: #8b949e;
                border: 1px solid #444c56;
                min-height: 40px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: #2d333b;
                color: #e6edf3;
            }
        ''')
        cancel_btn.clicked.connect(dialog.reject)
        
        assign_btn = QPushButton('✅ Assign Work')
        assign_btn.setStyleSheet('''
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #238636, stop:1 #2ea043);
                color: white;
                border: none;
                min-height: 40px;
                font-weight: 600;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2ea043, stop:1 #46d15b);
            }
        ''')
        assign_btn.clicked.connect(lambda: self.assign_work(
            user['id'], 
            task_input.toPlainText(),
            dept_input.text(),
            loc_input.text(),
            priority_combo.currentText().lower(),
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
