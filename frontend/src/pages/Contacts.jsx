import '../styles/Contacts.css';

const Contacts = () => {
  const contacts = [
    {
      id: 1,
      name: 'IT Support',
      role: 'Technical Support',
      email: 'support@equiptrack.com',
      phone: '+1 (555) 123-4567',
      department: 'IT Department',
      available: true,
    },
    {
      id: 2,
      name: 'Equipment Manager',
      role: 'Asset Management',
      email: 'assets@equiptrack.com',
      phone: '+1 (555) 123-4568',
      department: 'IT Department',
      available: true,
    },
    {
      id: 3,
      name: 'HR Department',
      role: 'Human Resources',
      email: 'hr@equiptrack.com',
      phone: '+1 (555) 123-4569',
      department: 'Human Resources',
      available: true,
    },
    {
      id: 4,
      name: 'System Administrator',
      role: 'System Admin',
      email: 'admin@equiptrack.com',
      phone: '+1 (555) 123-4570',
      department: 'IT Department',
      available: false,
    },
    {
      id: 5,
      name: 'Procurement Team',
      role: 'Equipment Procurement',
      email: 'procurement@equiptrack.com',
      phone: '+1 (555) 123-4571',
      department: 'Finance',
      available: true,
    },
  ];

  return (
    <div className="contacts-page">
      <div className="page-header">
        <h1>Contacts</h1>
        <p>Get in touch with IT support and department contacts</p>
      </div>

      <div className="contacts-grid">
        {contacts.map((contact) => (
          <div key={contact.id} className="contact-card">
            <div className="contact-header">
              <div className="contact-avatar">
                {contact.name.charAt(0)}
              </div>
              <div className="contact-status">
                <span className={`status-indicator ${contact.available ? 'available' : 'unavailable'}`}></span>
                <span className="status-text">{contact.available ? 'Available' : 'Busy'}</span>
              </div>
            </div>
            
            <div className="contact-body">
              <h3>{contact.name}</h3>
              <p className="contact-role">{contact.role}</p>
              <span className="contact-department">{contact.department}</span>
            </div>

            <div className="contact-footer">
              <div className="contact-info">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>
              <div className="contact-info">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <a href={`tel:${contact.phone}`}>{contact.phone}</a>
              </div>
            </div>

            <div className="contact-actions">
              <button className="btn-contact" onClick={() => window.location.href = `mailto:${contact.email}`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Send Email
              </button>
              <button className="btn-contact" onClick={() => window.location.href = `tel:${contact.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Call
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="help-section">
        <h2>Need Help?</h2>
        <p>For urgent issues or emergencies, please contact IT Support immediately at <strong>+1 (555) 123-4567</strong></p>
        <div className="help-cards">
          <div className="help-card">
            <h3>Equipment Issues</h3>
            <p>Report hardware problems, software bugs, or request repairs</p>
            <a href="mailto:support@equiptrack.com" className="help-link">Contact IT Support</a>
          </div>
          <div className="help-card">
            <h3>New Equipment Requests</h3>
            <p>Submit requests for new equipment or upgrades</p>
            <a href="mailto:assets@equiptrack.com" className="help-link">Contact Asset Management</a>
          </div>
          <div className="help-card">
            <h3>Account Questions</h3>
            <p>Issues with your account, permissions, or access</p>
            <a href="mailto:admin@equiptrack.com" className="help-link">Contact System Admin</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
