import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QStackedWidget,
                             QFrame, QScrollArea, QGraphicsDropShadowEffect)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QColor
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
        self.setGeometry(80, 50, 1650, 1000)
        
        # Premium glassmorphism design
        self.setStyleSheet("""
            QMainWindow {
                background: #0a0e14;
            }
            QLabel {
                color: #e3e8ee;
            }
            QPushButton {
                background: rgba(30, 35, 45, 0.95);
                color: #b8c1d3;
                border: 1.5px solid rgba(60, 70, 85, 0.6);
                border-radius: 12px;
                padding: 14px 20px;
                font-size: 14px;
                font-weight: 600;
                text-align: left;
            }
            QPushButton:hover {
                background: rgba(45, 52, 70, 1);
                border: 1.5px solid rgba(88, 166, 255, 0.5);
                color: #e3e8ee;
            }
            QPushButton:pressed {
                background: rgba(35, 42, 58, 1);
            }
            QPushButton#activeTab {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #2563eb, stop:1 #3b82f6);
                border: 1.5px solid #60a5fa;
                color: white;
                font-weight: 700;
            }
            QScrollBar:vertical {
                border: none;
                background: rgba(20, 25, 35, 0.4);
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background: rgba(88, 166, 255, 0.3);
                min-height: 30px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical:hover {
                background: rgba(88, 166, 255, 0.5);
            }
        """)
        
        self.show_login()
    
    def show_login(self):
        self.login_window = LoginWindow(self.db)
        self.login_window.login_successful.connect(self.on_login_success)
        self.setCentralWidget(self.login_window)
    
    def on_login_success(self, user):
        self.current_user = user
        self.setup_main_interface()
    
    def setup_main_interface(self):
        main_widget = QWidget()
        main_layout = QHBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        sidebar = self.create_sidebar()
        main_layout.addWidget(sidebar)
        
        self.content_stack = QStackedWidget()
        self.content_stack.setStyleSheet("""
            QStackedWidget {
                background: #0f1419;
            }
        """)
        
        self.work_assignments_page = WorkAssignmentsWidget(self.db, self.current_user)
        self.content_stack.addWidget(self.work_assignments_page)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.user_management_page = UserManagementWidget(self.db, self.current_user)
            self.content_stack.addWidget(self.user_management_page)
        
        main_layout.addWidget(self.content_stack, 1)
        
        main_widget.setLayout(main_layout)
        self.setCentralWidget(main_widget)
        
        self.notification_timer = QTimer()
        self.notification_timer.timeout.connect(self.check_notifications)
        self.notification_timer.start(30000)
    
    def create_sidebar(self):
        sidebar = QFrame()
        sidebar.setFixedWidth(300)
        sidebar.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #1a1f2e, stop:1 #0f1419);
                border-right: 1px solid rgba(60, 70, 85, 0.4);
            }
        """)
        
        # Add subtle shadow
        shadow = QGraphicsDropShadowEffect()
        shadow.setBlurRadius(25)
        shadow.setColor(QColor(0, 0, 0, 80))
        shadow.setOffset(4, 0)
        sidebar.setGraphicsEffect(shadow)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)
        
        # Premium header
        header = QWidget()
        header.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                stop:0 #2563eb, stop:1 #1d4ed8);
            padding: 28px 24px;
        """)
        header_layout = QVBoxLayout()
        
        # App logo and title
        title_container = QWidget()
        title_container.setStyleSheet("background: transparent;")
        title_layout = QHBoxLayout()
        title_layout.setContentsMargins(0, 0, 0, 0)
        
        logo_label = QLabel("ET")
        logo_label.setFont(QFont("Segoe UI", 20, QFont.Weight.Black))
        logo_label.setStyleSheet("""
            background: white;
            color: #2563eb;
            border-radius: 10px;
            padding: 8px 12px;
            min-width: 50px;
            max-width: 50px;
            min-height: 40px;
            max-height: 40px;
        """)
        logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        title_text = QWidget()
        title_text.setStyleSheet("background: transparent;")
        title_text_layout = QVBoxLayout()
        title_text_layout.setContentsMargins(12, 0, 0, 0)
        title_text_layout.setSpacing(2)
        
        app_name = QLabel("EquipTrack")
        app_name.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        app_name.setStyleSheet("color: white; background: transparent;")
        
        app_subtitle = QLabel("Work Management")
        app_subtitle.setStyleSheet("color: rgba(255,255,255,0.8); font-size: 12px; background: transparent;")
        
        title_text_layout.addWidget(app_name)
        title_text_layout.addWidget(app_subtitle)
        title_text.setLayout(title_text_layout)
        
        title_layout.addWidget(logo_label)
        title_layout.addWidget(title_text)
        title_layout.addStretch()
        title_container.setLayout(title_layout)
        
        # User info card
        user_card = QWidget()
        user_card.setStyleSheet("""
            background: rgba(255, 255, 255, 0.12);
            border-radius: 12px;
            padding: 16px;
            margin-top: 20px;
        """)
        user_layout = QVBoxLayout()
        user_layout.setSpacing(8)
        
        user_name = QLabel(self.current_user['username'])
        user_name.setFont(QFont("Segoe UI", 13, QFont.Weight.DemiBold))
        user_name.setStyleSheet("color: white; background: transparent;")
        
        role_container = QWidget()
        role_container.setStyleSheet("background: transparent;")
        role_layout = QHBoxLayout()
        role_layout.setContentsMargins(0, 0, 0, 0)
        
        role_badge = QLabel(self.current_user['role'].upper())
        role_badge.setStyleSheet("""
            background: rgba(255, 255, 255, 0.2);
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 8px;
            padding: 5px 12px;
            letter-spacing: 0.5px;
        """)
        
        role_layout.addWidget(role_badge)
        role_layout.addStretch()
        role_container.setLayout(role_layout)
        
        user_layout.addWidget(user_name)
        user_layout.addWidget(role_container)
        user_card.setLayout(user_layout)
        
        header_layout.addWidget(title_container)
        header_layout.addWidget(user_card)
        header.setLayout(header_layout)
        layout.addWidget(header)
        
        # Navigation section
        nav_widget = QWidget()
        nav_layout = QVBoxLayout()
        nav_layout.setContentsMargins(20, 28, 20, 20)
        nav_layout.setSpacing(10)
        
        nav_title = QLabel("MENU")
        nav_title.setStyleSheet("color: #6b7280; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 8px;")
        nav_layout.addWidget(nav_title)
        
        self.work_btn = QPushButton("Work Assignments")
        self.work_btn.setObjectName("activeTab")
        self.work_btn.setMinimumHeight(52)
        self.work_btn.clicked.connect(lambda: self.switch_page(0))
        nav_layout.addWidget(self.work_btn)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.users_btn = QPushButton("User Management")
            self.users_btn.setMinimumHeight(52)
            self.users_btn.clicked.connect(lambda: self.switch_page(1))
            nav_layout.addWidget(self.users_btn)
        
        nav_layout.addStretch()
        
        # Logout button
        logout_btn = QPushButton("Logout")
        logout_btn.setMinimumHeight(52)
        logout_btn.setStyleSheet("""
            QPushButton {
                background: rgba(220, 38, 38, 0.1);
                border: 1.5px solid rgba(239, 68, 68, 0.4);
                color: #fca5a5;
                font-weight: 600;
            }
            QPushButton:hover {
                background: rgba(220, 38, 38, 0.2);
                border: 1.5px solid rgba(239, 68, 68, 0.6);
                color: #fecaca;
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
        
        if hasattr(self, 'work_btn'):
            self.work_btn.setObjectName("activeTab" if index == 0 else "")
            self.work_btn.setStyleSheet(self.styleSheet())
        
        if hasattr(self, 'users_btn'):
            self.users_btn.setObjectName("activeTab" if index == 1 else "")
            self.users_btn.setStyleSheet(self.styleSheet())
    
    def check_notifications(self):
        notifications = self.db.get_unread_notifications(self.current_user['id'])
        if notifications:
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
