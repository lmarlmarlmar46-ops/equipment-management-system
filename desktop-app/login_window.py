from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel, 
                             QLineEdit, QPushButton, QMessageBox, QFrame)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont

class LoginWindow(QWidget):
    login_successful = pyqtSignal(dict)
    
    def __init__(self, db):
        super().__init__()
        self.db = db
        self.init_ui()
    
    def init_ui(self):
        layout = QVBoxLayout()
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # Login card
        card = QFrame()
        card.setFixedWidth(400)
        card.setStyleSheet("""
            QFrame {
                background-color: #161b22;
                border: 1px solid #30363d;
                border-radius: 12px;
                padding: 40px;
            }
        """)
        
        card_layout = QVBoxLayout()
        
        # Title
        title = QLabel("EquipTrack")
        title.setFont(QFont("Arial", 28, QFont.Weight.Bold))
        title.setStyleSheet("color: #58a6ff; margin-bottom: 10px;")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        subtitle = QLabel("Sign in to manage equipment")
        subtitle.setStyleSheet("color: #8b949e; font-size: 14px; margin-bottom: 30px;")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        card_layout.addWidget(title)
        card_layout.addWidget(subtitle)
        
        # Email field
        email_label = QLabel("Email Address")
        email_label.setStyleSheet("color: #e6edf3; font-weight: bold; margin-bottom: 5px;")
        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("you@example.com")
        self.email_input.setStyleSheet("""
            QLineEdit {
                background-color: #0d1117;
                border: 1px solid #30363d;
                border-radius: 6px;
                padding: 10px;
                color: #e6edf3;
                font-size: 14px;
            }
            QLineEdit:focus {
                border-color: #58a6ff;
            }
        """)
        
        card_layout.addWidget(email_label)
        card_layout.addWidget(self.email_input)
        card_layout.addSpacing(15)
        
        # Password field
        password_label = QLabel("Password")
        password_label.setStyleSheet("color: #e6edf3; font-weight: bold; margin-bottom: 5px;")
        self.password_input = QLineEdit()
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.password_input.setPlaceholderText("Enter your password")
        self.password_input.setStyleSheet("""
            QLineEdit {
                background-color: #0d1117;
                border: 1px solid #30363d;
                border-radius: 6px;
                padding: 10px;
                color: #e6edf3;
                font-size: 14px;
            }
            QLineEdit:focus {
                border-color: #58a6ff;
            }
        """)
        self.password_input.returnPressed.connect(self.handle_login)
        
        card_layout.addWidget(password_label)
        card_layout.addWidget(self.password_input)
        card_layout.addSpacing(20)
        
        # Login button
        login_btn = QPushButton("Sign In")
        login_btn.setStyleSheet("""
            QPushButton {
                background-color: #238636;
                color: white;
                border: none;
                border-radius: 6px;
                padding: 12px;
                font-size: 15px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #2ea043;
            }
            QPushButton:pressed {
                background-color: #1a7f37;
            }
        """)
        login_btn.clicked.connect(self.handle_login)
        card_layout.addWidget(login_btn)
        
        # Demo accounts info
        demo_label = QLabel("Demo Account:\nadmin@equiptrack.com / admin123")
        demo_label.setStyleSheet("""
            color: #8b949e; 
            font-size: 11px; 
            margin-top: 20px;
            padding: 10px;
            background-color: #0d1117;
            border-radius: 6px;
        """)
        demo_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        card_layout.addWidget(demo_label)
        
        card.setLayout(card_layout)
        layout.addWidget(card)
        
        self.setLayout(layout)
    
    def handle_login(self):
        email = self.email_input.text().strip()
        password = self.password_input.text()
        
        if not email or not password:
            QMessageBox.warning(self, "Error", "Please enter both email and password")
            return
        
        user = self.db.authenticate_user(email, password)
        
        if user:
            self.login_successful.emit(user)
        else:
            QMessageBox.critical(self, "Login Failed", 
                               "Invalid email or password.\nPlease try again.")
            self.password_input.clear()
            self.password_input.setFocus()
