import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QStackedWidget,
                             QListWidget, QFrame, QScrollArea)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QIcon
from database import Database
from login_window import LoginWindow
from work_assignments import WorkAssignmentsWidget
from user_management import UserManagementWidget
from notifications import NotificationWidget

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.db = Database()
        self.current_user = None
        self.init_ui()
    
    def init_ui(self):
        self.setWindowTitle("EquipTrack - IT Asset Management")
        self.setGeometry(100, 100, 1400, 900)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #0f1419;
            }
            QLabel {
                color: #e6edf3;
            }
            QPushButton {
                background-color: #21262d;
                color: #e6edf3;
                border: 1px solid #30363d;
                border-radius: 6px;
                padding: 8px 16px;
                font-size: 14px;
            }
            QPushButton:hover {
                background-color: #30363d;
                border-color: #58a6ff;
            }
            QPushButton:pressed {
                background-color: #161b22;
            }
            QPushButton#activeTab {
                background-color: #1f6feb;
                border-color: #1f6feb;
            }
        """)
        
        # Show login window first
        self.show_login()
    
    def show_login(self):
        self.login_window = LoginWindow(self.db)
        self.login_window.login_successful.connect(self.on_login_success)
        self.setCentralWidget(self.login_window)
    
    def on_login_success(self, user):
        self.current_user = user
        self.setup_main_interface()
    
    def setup_main_interface(self):
        # Main widget
        main_widget = QWidget()
        main_layout = QHBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # Sidebar
        sidebar = self.create_sidebar()
        main_layout.addWidget(sidebar)
        
        # Content area
        self.content_stack = QStackedWidget()
        self.content_stack.setStyleSheet("""
            QStackedWidget {
                background-color: #0d1117;
            }
        """)
        
        # Add pages
        self.work_assignments_page = WorkAssignmentsWidget(self.db, self.current_user)
        self.content_stack.addWidget(self.work_assignments_page)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.user_management_page = UserManagementWidget(self.db, self.current_user)
            self.content_stack.addWidget(self.user_management_page)
        
        main_layout.addWidget(self.content_stack, 1)
        
        main_widget.setLayout(main_layout)
        self.setCentralWidget(main_widget)
        
        # Setup notification checking
        self.notification_timer = QTimer()
        self.notification_timer.timeout.connect(self.check_notifications)
        self.notification_timer.start(30000)  # Check every 30 seconds
    
    def create_sidebar(self):
        sidebar = QFrame()
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("""
            QFrame {
                background-color: #161b22;
                border-right: 1px solid #30363d;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Header
        header = QWidget()
        header.setStyleSheet("background-color: #21262d; padding: 20px;")
        header_layout = QVBoxLayout()
        
        title = QLabel("EquipTrack")
        title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        title.setStyleSheet("color: #58a6ff;")
        
        user_label = QLabel(f"{self.current_user['username']}")
        user_label.setStyleSheet("color: #8b949e; font-size: 12px;")
        
        role_label = QLabel(f"Role: {self.current_user['role'].title()}")
        role_label.setStyleSheet("color: #8b949e; font-size: 11px;")
        
        header_layout.addWidget(title)
        header_layout.addWidget(user_label)
        header_layout.addWidget(role_label)
        header.setLayout(header_layout)
        layout.addWidget(header)
        
        # Navigation buttons
        nav_widget = QWidget()
        nav_layout = QVBoxLayout()
        nav_layout.setContentsMargins(10, 20, 10, 10)
        nav_layout.setSpacing(5)
        
        self.work_btn = QPushButton("📋 Work Assignments")
        self.work_btn.setObjectName("activeTab")
        self.work_btn.clicked.connect(lambda: self.switch_page(0))
        nav_layout.addWidget(self.work_btn)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.users_btn = QPushButton("👥 User Management")
            self.users_btn.clicked.connect(lambda: self.switch_page(1))
            nav_layout.addWidget(self.users_btn)
        
        nav_layout.addStretch()
        
        # Logout button
        logout_btn = QPushButton("🚪 Logout")
        logout_btn.setStyleSheet("""
            QPushButton {
                background-color: #da3633;
                border-color: #da3633;
            }
            QPushButton:hover {
                background-color: #b62324;
            }
        """)
        logout_btn.clicked.connect(self.logout)
        nav_layout.addWidget(logout_btn)
        
        nav_widget.setLayout(nav_layout)
        layout.addWidget(nav_widget)
        
        sidebar.setLayout(layout)
        return sidebar
    
    def switch_page(self, index):
        self.content_stack.setCurrentIndex(index)
        
        # Update button styles
        if hasattr(self, 'work_btn'):
            self.work_btn.setObjectName("activeTab" if index == 0 else "")
            self.work_btn.setStyleSheet(self.styleSheet())
        
        if hasattr(self, 'users_btn'):
            self.users_btn.setObjectName("activeTab" if index == 1 else "")
            self.users_btn.setStyleSheet(self.styleSheet())
    
    def check_notifications(self):
        notifications = self.db.get_unread_notifications(self.current_user['id'])
        if notifications:
            # Update notification badge or show alert
            pass
    
    def logout(self):
        self.current_user = None
        self.show_login()

if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    
    window = MainWindow()
    window.show()
    
    sys.exit(app.exec())
