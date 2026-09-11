import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QStackedWidget,
                             QListWidget, QFrame, QScrollArea, QGraphicsOpacityEffect)
from PyQt6.QtCore import Qt, QTimer, QPropertyAnimation, QEasingCurve, pyqtProperty
from PyQt6.QtGui import QFont, QIcon, QPalette, QColor
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
        self.setWindowTitle("EquipTrack - Work Assignment Manager")
        self.setGeometry(100, 100, 1500, 950)
        
        # Enhanced modern stylesheet with better colors and effects
        self.setStyleSheet("""
            QMainWindow {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0a0e1a, stop:1 #1a1f2e);
            }
            QLabel {
                color: #e6edf3;
            }
            QPushButton {
                background-color: #1c2128;
                color: #e6edf3;
                border: 1px solid #444c56;
                border-radius: 8px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 500;
                text-align: left;
            }
            QPushButton:hover {
                background-color: #2d333b;
                border-color: #58a6ff;
                transform: translateY(-2px);
            }
            QPushButton:pressed {
                background-color: #22272e;
                transform: translateY(0px);
            }
            QPushButton#activeTab {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #1f6feb, stop:1 #388bfd);
                border-color: #58a6ff;
                font-weight: 600;
            }
            QScrollBar:vertical {
                border: none;
                background: #0d1117;
                width: 12px;
                margin: 0px 0px 0px 0px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical {
                background: #30363d;
                min-height: 20px;
                border-radius: 6px;
            }
            QScrollBar::handle:vertical:hover {
                background: #484f58;
            }
            QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {
                height: 0px;
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
        
        # Content area with better background
        self.content_stack = QStackedWidget()
        self.content_stack.setStyleSheet("""
            QStackedWidget {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0d1117, stop:1 #161b22);
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
        sidebar.setFixedWidth(280)
        sidebar.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #161b22, stop:1 #0d1117);
                border-right: 2px solid #30363d;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Header with gradient
        header = QWidget()
        header.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #1f6feb, stop:1 #388bfd);
            padding: 24px;
            border-bottom: 3px solid #58a6ff;
        """)
        header_layout = QVBoxLayout()
        
        title = QLabel("⚡ EquipTrack")
        title.setFont(QFont("Segoe UI", 22, QFont.Weight.Bold))
        title.setStyleSheet("color: white; background: transparent;")
        
        subtitle = QLabel("Work Assignment Manager")
        subtitle.setStyleSheet("color: rgba(255,255,255,0.9); font-size: 11px; background: transparent; margin-top: 2px;")
        
        user_container = QWidget()
        user_container.setStyleSheet("background: rgba(0,0,0,0.2); border-radius: 8px; padding: 12px; margin-top: 16px;")
        user_layout = QVBoxLayout()
        user_layout.setContentsMargins(0, 0, 0, 0)
        
        user_label = QLabel(f"👤 {self.current_user['username']}")
        user_label.setFont(QFont("Segoe UI", 12, QFont.Weight.DemiBold))
        user_label.setStyleSheet("color: white; background: transparent;")
        
        role_label = QLabel(f"{self.current_user['role'].upper()}")
        role_badge = QLabel(f"  {self.current_user['role'].upper()}  ")
        role_badge.setStyleSheet("""
            background: rgba(255,255,255,0.25);
            color: white;
            font-size: 10px;
            font-weight: bold;
            border-radius: 10px;
            padding: 4px 10px;
        """)
        role_badge.setAlignment(Qt.AlignmentFlag.AlignLeft)
        
        user_layout.addWidget(user_label)
        user_layout.addWidget(role_badge)
        user_container.setLayout(user_layout)
        
        header_layout.addWidget(title)
        header_layout.addWidget(subtitle)
        header_layout.addWidget(user_container)
        header.setLayout(header_layout)
        layout.addWidget(header)
        
        # Navigation buttons with better styling
        nav_widget = QWidget()
        nav_layout = QVBoxLayout()
        nav_layout.setContentsMargins(16, 24, 16, 16)
        nav_layout.setSpacing(8)
        
        nav_title = QLabel("NAVIGATION")
        nav_title.setStyleSheet("color: #7d8590; font-size: 11px; font-weight: bold; margin-bottom: 8px;")
        nav_layout.addWidget(nav_title)
        
        self.work_btn = QPushButton("  📋  Work Assignments")
        self.work_btn.setObjectName("activeTab")
        self.work_btn.setMinimumHeight(48)
        self.work_btn.clicked.connect(lambda: self.switch_page(0))
        nav_layout.addWidget(self.work_btn)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.users_btn = QPushButton("  👥  User Management")
            self.users_btn.setMinimumHeight(48)
            self.users_btn.clicked.connect(lambda: self.switch_page(1))
            nav_layout.addWidget(self.users_btn)
        
        nav_layout.addStretch()
        
        # Stats card (optional)
        stats_card = QFrame()
        stats_card.setStyleSheet("""
            QFrame {
                background: #1c2128;
                border: 1px solid #444c56;
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            }
        """)
        stats_layout = QVBoxLayout()
        
        stats_title = QLabel("Quick Stats")
        stats_title.setFont(QFont("Segoe UI", 11, QFont.Weight.Bold))
        stats_title.setStyleSheet("color: #58a6ff; background: transparent;")
        
        stats_info = QLabel("📊 View your activity")
        stats_info.setStyleSheet("color: #8b949e; font-size: 11px; background: transparent; margin-top: 4px;")
        
        stats_layout.addWidget(stats_title)
        stats_layout.addWidget(stats_info)
        stats_card.setLayout(stats_layout)
        nav_layout.addWidget(stats_card)
        
        # Logout button with better styling
        logout_btn = QPushButton("🚪  Logout")
        logout_btn.setMinimumHeight(48)
        logout_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #da3633, stop:1 #f85149);
                border: 1px solid #f85149;
                color: white;
                font-weight: 600;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #b62324, stop:1 #da3633);
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
