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
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Contacts</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Get in touch with IT support and department contacts
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        {contacts.map((contact) => (
          <div key={contact.id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-xl)',
                  fontWeight: '700',
                  color: 'white',
                  flexShrink: 0
                }}>
                  {contact.name.charAt(0)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: contact.available ? 'var(--success)' : 'var(--warning)',
                    display: 'inline-block'
                  }}></span>
                  <span className="caption" style={{ color: 'var(--text-tertiary)' }}>
                    {contact.available ? 'Available' : 'Busy'}
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h3 className="heading-5" style={{ marginBottom: 'var(--space-1)' }}>{contact.name}</h3>
                <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{contact.role}</p>
                <span className="badge badge-neutral" style={{ fontSize: 'var(--text-xs)' }}>{contact.department}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <a href={`mailto:${contact.email}`} className="caption" style={{ color: 'var(--brand-primary)', textDecoration: 'none', wordBreak: 'break-all' }}>
                    {contact.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <a href={`tel:${contact.phone}`} className="caption" style={{ color: 'var(--brand-primary)', textDecoration: 'none' }}>
                    {contact.phone}
                  </a>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                <button className="btn btn-sm btn-secondary" onClick={() => window.location.href = `mailto:${contact.email}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Email
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => window.location.href = `tel:${contact.phone}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Call
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
        <div className="card-header">
          <h2 className="card-header-title">Need Help?</h2>
        </div>
        <div className="card-body">
          <p className="body-base" style={{ marginBottom: 'var(--space-6)' }}>
            For urgent issues or emergencies, please contact IT Support immediately at <strong style={{ color: 'var(--brand-primary)' }}>+1 (555) 123-4567</strong>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
              <h3 className="heading-6" style={{ marginBottom: 'var(--space-2)' }}>Equipment Issues</h3>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Report hardware problems, software bugs, or request repairs
              </p>
              <a href="mailto:support@equiptrack.com" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Contact IT Support
              </a>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
              <h3 className="heading-6" style={{ marginBottom: 'var(--space-2)' }}>New Equipment Requests</h3>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Submit requests for new equipment or upgrades
              </p>
              <a href="mailto:assets@equiptrack.com" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Contact Asset Management
              </a>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
              <h3 className="heading-6" style={{ marginBottom: 'var(--space-2)' }}>Account Questions</h3>
              <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                Issues with your account, permissions, or access
              </p>
              <a href="mailto:admin@equiptrack.com" className="btn btn-sm btn-primary" style={{ display: 'inline-flex', textDecoration: 'none' }}>
                Contact System Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
