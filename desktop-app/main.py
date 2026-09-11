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
        
        # Modern dark purple/blue theme
        self.setStyleSheet("""
            QMainWindow {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0f0f23, stop:1 #1a1a3e);
            }
            QLabel {
                color: #e0e0ff;
            }
            QPushButton {
                background: rgba(30, 30, 60, 0.5);
                color: #b8b8d8;
                border: 1px solid rgba(100, 100, 200, 0.3);
                border-radius: 10px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: 600;
                text-align: center;
            }
            QPushButton:hover {
                background: rgba(50, 50, 100, 0.7);
                border: 1px solid rgba(130, 130, 255, 0.5);
                color: #ffffff;
            }
            QPushButton:pressed {
                background: rgba(40, 40, 80, 0.8);
            }
            QPushButton#activeTab {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #6366f1, stop:1 #8b5cf6);
                border: 1px solid #8b5cf6;
                color: white;
            }
            QScrollBar:vertical {
                border: none;
                background: rgba(20, 20, 40, 0.5);
                width: 10px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical {
                background: rgba(130, 130, 255, 0.4);
                min-height: 30px;
                border-radius: 5px;
            }
            QScrollBar::handle:vertical:hover {
                background: rgba(130, 130, 255, 0.6);
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
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                    stop:0 #0f0f23, stop:1 #1a1a3e);
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
        sidebar.setFixedWidth(250)
        sidebar.setStyleSheet("""
            QFrame {
                background: qlineargradient(x1:0, y1:0, x2:0, y2:1,
                    stop:0 #0a0a1f, stop:1 #141428);
                border-right: 1px solid rgba(100, 100, 200, 0.2);
            }
        """)
        
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 30, 20, 30)
        layout.setSpacing(0)
        
        # Logo with purple accent
        logo_container = QWidget()
        logo_container.setStyleSheet("background: transparent;")
        logo_layout = QVBoxLayout()
        logo_layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        logo_layout.setSpacing(15)
        
        # Purple logo icon
        logo_label = QLabel("◆")
        logo_label.setFont(QFont("Segoe UI", 48, QFont.Weight.Bold))
        logo_label.setStyleSheet("color: #8b5cf6; background: transparent;")
        logo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        app_name = QLabel("EquipTrack")
        app_name.setFont(QFont("Segoe UI", 20, QFont.Weight.Bold))
        app_name.setStyleSheet("color: #ffffff; background: transparent;")
        app_name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        tagline = QLabel("Track. Manage. Keep Assets Moving.")
        tagline.setStyleSheet("color: #8888aa; font-size: 11px; background: transparent;")
        tagline.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        logo_layout.addWidget(logo_label)
        logo_layout.addWidget(app_name)
        logo_layout.addWidget(tagline)
        logo_container.setLayout(logo_layout)
        
        # User card with purple gradient
        user_card = QWidget()
        user_card.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 rgba(99, 102, 241, 0.15), stop:1 rgba(139, 92, 246, 0.15));
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            padding: 15px;
            margin-top: 25px;
            margin-bottom: 30px;
        """)
        user_layout = QVBoxLayout()
        
        user_name = QLabel(self.current_user['username'])
        user_name.setFont(QFont("Segoe UI", 14, QFont.Weight.DemiBold))
        user_name.setStyleSheet("color: #ffffff; background: transparent;")
        user_name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        role_badge = QLabel(self.current_user['role'].upper())
        role_badge.setStyleSheet("""
            background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                stop:0 #6366f1, stop:1 #8b5cf6);
            color: white;
            font-size: 10px;
            font-weight: 700;
            border-radius: 10px;
            padding: 6px 12px;
            letter-spacing: 1px;
        """)
        role_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        user_layout.addWidget(user_name)
        user_layout.addWidget(role_badge)
        user_card.setLayout(user_layout)
        
        layout.addWidget(logo_container)
        layout.addWidget(user_card)
        
        # Navigation section
        nav_label = QLabel("MENU")
        nav_label.setStyleSheet("color: #6666aa; font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-top: 10px; margin-bottom: 15px; background: transparent;")
        layout.addWidget(nav_label)
        
        self.work_btn = QPushButton("Work Assignments")
        self.work_btn.setObjectName("activeTab")
        self.work_btn.setMinimumHeight(48)
        self.work_btn.setStyleSheet("""
            QPushButton {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #6366f1, stop:1 #8b5cf6);
                color: white;
                border: none;
                font-weight: 600;
                text-align: center;
            }
            QPushButton:hover {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                    stop:0 #5558e3, stop:1 #7c3aed);
            }
        """)
        self.work_btn.clicked.connect(lambda: self.switch_page(0))
        layout.addWidget(self.work_btn)
        
        if self.current_user['role'] in ['admin', 'manager']:
            self.users_btn = QPushButton("User Management")
            self.users_btn.setMinimumHeight(48)
            self.users_btn.setStyleSheet("""
                QPushButton {
                    background: rgba(99, 102, 241, 0.2);
                    color: #c4c4ff;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    font-weight: 600;
                    text-align: center;
                    margin-top: 10px;
                }
                QPushButton:hover {
                    background: rgba(99, 102, 241, 0.3);
                    color: #ffffff;
                }
            """)
            self.users_btn.clicked.connect(lambda: self.switch_page(1))
            layout.addWidget(self.users_btn)
        
        layout.addStretch()
        
        # Logout button
        logout_btn = QPushButton("Logout")
        logout_btn.setMinimumHeight(48)
        logout_btn.setStyleSheet("""
            QPushButton {
                background: rgba(220, 38, 38, 0.15);
                border: 1px solid rgba(239, 68, 68, 0.4);
                color: #ff9999;
                font-weight: 600;
                text-align: center;
            }
            QPushButton:hover {
                background: rgba(220, 38, 38, 0.25);
                color: #ffcccc;
            }
        """)
        logout_btn.clicked.connect(self.logout)
        layout.addWidget(logout_btn)
        
        sidebar.setLayout(layout)
        return sidebar
    
    def switch_page(self, index):
        self.content_stack.setCurrentIndex(index)
        
        # Update button styles
        if hasattr(self, 'work_btn'):
            if index == 0:
                self.work_btn.setStyleSheet("""
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #6366f1, stop:1 #8b5cf6);
                        color: white;
                        border: none;
                        font-weight: 600;
                        text-align: center;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #5558e3, stop:1 #7c3aed);
                    }
                """)
            else:
                self.work_btn.setStyleSheet("""
                    QPushButton {
                        background: rgba(99, 102, 241, 0.2);
                        color: #c4c4ff;
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        font-weight: 600;
                        text-align: center;
                    }
                    QPushButton:hover {
                        background: rgba(99, 102, 241, 0.3);
                        color: #ffffff;
                    }
                """)
        
        if hasattr(self, 'users_btn'):
            if index == 1:
                self.users_btn.setStyleSheet("""
                    QPushButton {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #6366f1, stop:1 #8b5cf6);
                        color: white;
                        border: none;
                        font-weight: 600;
                        text-align: center;
                        margin-top: 10px;
                    }
                    QPushButton:hover {
                        background: qlineargradient(x1:0, y1:0, x2:1, y2:0,
                            stop:0 #5558e3, stop:1 #7c3aed);
                    }
                """)
            else:
                self.users_btn.setStyleSheet("""
                    QPushButton {
                        background: rgba(99, 102, 241, 0.2);
                        color: #c4c4ff;
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        font-weight: 600;
                        text-align: center;
                        margin-top: 10px;
                    }
                    QPushButton:hover {
                        background: rgba(99, 102, 241, 0.3);
                        color: #ffffff;
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
