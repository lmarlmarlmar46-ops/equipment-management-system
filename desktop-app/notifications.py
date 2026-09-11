
from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QLabel, QPushButton, 
                             QScrollArea, QFrame, QHBoxLayout)
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QFont

class NotificationWidget(QWidget):
    def __init__(self, db, user):
        super().__init__()
        self.db = db
        self.user = user
        self.init_ui()
        self.load_notifications()
    
    def init_ui(self):
        layout = QVBoxLayout()
        
        # Header
        header = QHBoxLayout()
        title = QLabel('Notifications')
        title.setFont(QFont("Arial", 20, QFont.Weight.Bold))
        title.setStyleSheet('color: #e6edf3;')
        header.addWidget(title)
        
        header.addStretch()
        
        mark_all_btn = QPushButton('Mark All as Read')
        mark_all_btn.clicked.connect(self.mark_all_read)
        header.addWidget(mark_all_btn)
        
        layout.addLayout(header)
        
        # Scroll area for notifications
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("""
            QScrollArea {
                border: none;
                background-color: #0d1117;
            }
        """)
        
        self.notifications_container = QWidget()
        self.notifications_layout = QVBoxLayout()
        self.notifications_container.setLayout(self.notifications_layout)
        
        scroll.setWidget(self.notifications_container)
        layout.addWidget(scroll)
        
        self.setLayout(layout)
    
    def load_notifications(self):
        # Clear existing
        while self.notifications_layout.count():
            child = self.notifications_layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()
        
        # Get notifications
        notifications = self.db.get_unread_notifications(self.user['id'])
        
        if not notifications:
            empty_label = QLabel('No new notifications')
            empty_label.setStyleSheet('color: #8b949e; font-size: 14px; padding: 20px;')
            empty_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.notifications_layout.addWidget(empty_label)
        else:
            for notif in notifications:
                card = self.create_notification_card(notif)
                self.notifications_layout.addWidget(card)
        
        self.notifications_layout.addStretch()
    
    def create_notification_card(self, notif):
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #161b22;
                border: 1px solid #30363d;
                border-left: 4px solid #1f6feb;
                border-radius: 6px;
                padding: 15px;
                margin: 5px 0px;
            }
            QFrame:hover {
                background-color: #1c2128;
            }
        """)
        
        layout = QVBoxLayout()
        
        # Title
        title_label = QLabel(notif['title'])
        title_label.setFont(QFont("Arial", 14, QFont.Weight.Bold))
        title_label.setStyleSheet('color: #e6edf3;')
        layout.addWidget(title_label)
        
        # Message
        message_label = QLabel(notif['message'])
        message_label.setWordWrap(True)
        message_label.setStyleSheet('color: #8b949e; font-size: 13px; margin-top: 5px;')
        layout.addWidget(message_label)
        
        # Time
        time_label = QLabel(notif['created_at'][:16] if notif.get('created_at') else '')
        time_label.setStyleSheet('color: #6e7681; font-size: 11px; margin-top: 5px;')
        layout.addWidget(time_label)
        
        # Mark as read button
        btn_layout = QHBoxLayout()
        btn_layout.addStretch()
        
        mark_read_btn = QPushButton('Mark as Read')
        mark_read_btn.setStyleSheet("""
            QPushButton {
                background-color: #238636;
                padding: 5px 15px;
                font-size: 12px;
            }
            QPushButton:hover {
                background-color: #2ea043;
            }
        """)
        mark_read_btn.clicked.connect(lambda: self.mark_as_read(notif['id']))
        btn_layout.addWidget(mark_read_btn)
        
        layout.addLayout(btn_layout)
        
        card.setLayout(layout)
        return card
    
    def mark_as_read(self, notif_id):
        self.db.mark_notification_read(notif_id)
        self.load_notifications()
    
    def mark_all_read(self):
        self.db.mark_all_notifications_read(self.user['id'])
        self.load_notifications()
