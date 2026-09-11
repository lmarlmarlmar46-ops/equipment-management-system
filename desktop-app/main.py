import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                             QHBoxLayout, QPushButton, QLabel, QStackedWidget,
                             QFrame, QScrollArea)
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QFont, QPixmap, QPainter, QColor
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
        
        # Clean black and blue theme
        self.setStyleSheet("""
            QMainWindow {
                background: #000000;
            }
            QLabel {
                color: #ffffff;
            }
            QPushButton {
                background: #1a1a1a;
                color: #ffffff;
                border: 1px solid #333333;
                border-radius: 8px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
            }
            QPushButton:hover {
                background: #2a2a2a;
                border: 1px solid #0066ff;
            }
            QPushButton:pressed {
                background: #0d0d0d;
            }
            QPushButton#activeTab {
                background: #0066ff;
                border: 1px solid #0066ff;
                color: white;
            }
            QScrollBar:vertical {
                border: none;
                background: #0d0d0d;
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background: #333333;
                min-height: 30px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical:hover {
                background: #0066ff;
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
        self.content_stack.setStyleSheet("QStackedWidget { background: #0d0d0d; }")
        
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
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("""
            QFrame {
                background: #0066ff;
                border-right: 1px solid #0052cc;
            }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 30, 20, 30)
        layout.setSpacing(0)
        
        # Logo and title
        logo_container = QWidget()
        logo_container.setStyleSheet("background: transparent;")
        logo_layout = QVBoxLayout()
        logo_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_layout.setSpacing(15)
        
        # Simple icon logo
        logo_label = QLabel("◆")
        logo_label.setFont(QFont("Segoe UI", 48, QFont.Weight.Bold))
        logo_label.setStyleSheet("color: white; background: transparent;")
        logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        app_name = QLabel("EquipTrack")
        app_name.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        app_name.setStyleSheet("color: white; background: transparent;")
        app_name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        logo_layout.addWidget(logo_label)
        logo_layout.addWidget(app_name)
        logo_container.setLayout(logo_layout)
        
        # User info
        user_card = QWidget()
        user_card.setStyleSheet("""
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            margin-bottom: 30px;
        """)
        user_layout = QVBoxLayout()
        
        user_name = QLabel(self.current_user['username'])
        user_name.setFont(QFont("Segoe UI", 13, QFont.Weight.DemiBold))
        user_name.setStyleSheet("color: white; background: transparent;")
        user_name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        role_badge = QLabel(self.current_user['role'].upper())
        role_badge.setStyleSheet("""
            background: rgba(255, 255, 255, 0.25);
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 8px;
            padding: 5px 10px;
        """)
        role_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        user_layout.addWidget(user_name)
        user_layout.addWidget(role_badge)
        user_card.setLayout(user_layout)
        
        layout.addWidget(logo_container)
        layout.addWidget(user_card)
        
        # Navigation
        nav_label = QLabel("MENU")
        nav_label.setStyleSheet("color: rgba(255,255,255,0.6); font-size: 11px; font-weight: 700; margin-top: 10px; margin-bottom: 10px; background: transparent;")
        layout.addWidget(nav_label)
        
        self.work_btn = QPushButton("Work Assignments")
        self.work_btn.setObjectName("activeTab")
        self.work_btn.setMinimumHeight(45)
        self.work_btn.setStyleSheet("""
            QPushButton {
                background: white;
                color: #0066ff;
                border: none;
                font-weight: 700;
                text-align: center;
            }
            QPushButton:hover {
                background: #f0f0f0;
            }
        """)
        self.work_btn.clicked.connect(lambda: self.switch_page(0))
        layout.addWidget(self.work_btn)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.users_btn = QPushButton("User Management")
            self.users_btn.setMinimumHeight(45)
            self.users_btn.setStyleSheet("""
                QPushButton {
                    background: rgba(255, 255, 255, 0.15);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    font-weight: 600;
                    text-align: center;
                    margin-top: 10px;
                }
                QPushButton:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
            """)
            self.users_btn.clicked.connect(lambda: self.switch_page(1))
            layout.addWidget(self.users_btn)
        
        layout.addStretch()
        
        # Logout
        logout_btn = QPushButton("Logout")
        logout_btn.setMinimumHeight(45)
        logout_btn.setStyleSheet("""
            QPushButton {
                background: rgba(255, 0, 0, 0.2);
                border: 1px solid rgba(255, 0, 0, 0.3);
                color: white;
                font-weight: 600;
                text-align: center;
            }
            QPushButton:hover {
                background: rgba(255, 0, 0, 0.3);
            }
        """)
        logout_btn.clicked.connect(self.logout)
        layout.addWidget(logout_btn)
        
        sidebar.setLayout(layout)
        return sidebar
    
    def switch_page(self, index):
        self.content_stack.setCurrentIndex(index)
        
        if hasattr(self, 'work_btn'):
            if index == 0:
                self.work_btn.setStyleSheet("""
                    QPushButton {
                        background: white;
                        color: #0066ff;
                        border: none;
                        font-weight: 700;
                        text-align: center;
                    }
                    QPushButton:hover {
                        background: #f0f0f0;
                    }
                """)
            else:
                self.work_btn.setStyleSheet("""
                    QPushButton {
                        background: rgba(255, 255, 255, 0.15);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-weight: 600;
                        text-align: center;
                    }
                    QPushButton:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }
                """)
        
        if hasattr(self, 'users_btn'):
            if index == 1:
                self.users_btn.setStyleSheet("""
                    QPushButton {
                        background: white;
                        color: #0066ff;
                        border: none;
                        font-weight: 700;
                        text-align: center;
                        margin-top: 10px;
                    }
                    QPushButton:hover {
                        background: #f0f0f0;
                    }
                """)
            else:
                self.users_btn.setStyleSheet("""
                    QPushButton {
                        background: rgba(255, 255, 255, 0.15);
                        color: white;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-weight: 600;
                        text-align: center;
                        margin-top: 10px;
                    }
                    QPushButton:hover {
                        background: rgba(255, 255, 255, 0.25);
                    }
                """)
    
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
