import React, { useState, useEffect, useRef } from 'react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedStats, setAnimatedStats] = useState({
    totalEquipment: 0,
    availableEquipment: 0,
    allocatedEquipment: 0,
    activeEmployees: 0,
    activeAllocations: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (stats) {
      // Animate counters
      animateValue('totalEquipment', 0, stats.totalEquipment || 0, 1000);
      animateValue('availableEquipment', 0, stats.availableEquipment || 0, 1000);
      animateValue('allocatedEquipment', 0, stats.allocatedEquipment || 0, 1000);
      animateValue('activeEmployees', 0, stats.activeEmployees || 0, 1000);
      animateValue('activeAllocations', 0, stats.activeAllocations || 0, 1000);
    }
  }, [stats]);

  const animateValue = (key, start, end, duration) => {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      const current = Math.floor(start + (end - start) * easeOutQuad);
      
      setAnimatedStats(prev => ({ ...prev, [key]: current }));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error">
        <div className="error-icon">⚠️</div>
        <div className="error-text">Failed to load dashboard data</div>
      </div>
    );
  }

  const utilizationRate = stats.totalEquipment > 0 
    ? Math.round((stats.allocatedEquipment / stats.totalEquipment) * 100) 
    : 0;

  return (
    <div className="dashboard">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Dashboard Overview</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Real-time equipment and allocation metrics
            </p>
          </div>
          <div className="page-header-actions">
            <button className="btn btn-secondary btn-icon" onClick={fetchStats} title="Refresh dashboard">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4V10H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M23 20V14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 9C19.9828 7.56678 19.1209 6.28536 17.9845 5.27541C16.8482 4.26546 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7345 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="14" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Equipment</div>
            <div className="stat-value">{animatedStats.totalEquipment}</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Available</div>
            <div className="stat-value">{animatedStats.availableEquipment}</div>
            <div className="stat-change is-positive">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ready to use
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V16C3 17.1046 3.89543 18 5 18H19C20.1046 18 21 17.1046 21 16Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Allocated</div>
            <div className="stat-value">{animatedStats.allocatedEquipment}</div>
            <div className="stat-change is-neutral">
              In use
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Employees</div>
            <div className="stat-value">{animatedStats.activeEmployees}</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Active Allocations</div>
            <div className="stat-value">{animatedStats.activeAllocations}</div>
          </div>
        </div>
      </div>

      {/* Utilization Rate Card */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <div>
            <h3 className="card-header-title">Equipment Utilization</h3>
            <p className="card-header-subtitle">Overall equipment usage rate</p>
          </div>
          <div className="badge badge-primary badge-lg">{utilizationRate}%</div>
        </div>
        <div className="card-body">
          <div className="progress-with-label" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="progress-wrapper">
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${
                    utilizationRate >= 80 ? 'progress-fill-success' :
                    utilizationRate >= 50 ? 'progress-fill-warning' :
                    'progress-fill-error'
                  }`}
                  style={{ width: `${utilizationRate}%` }}
                ></div>
              </div>
            </div>
            <div className="progress-label">{utilizationRate}%</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                In Use
              </div>
              <div className="heading-4" style={{ color: 'var(--warning)' }}>
                {stats.allocatedEquipment}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                Available
              </div>
              <div className="heading-4" style={{ color: 'var(--success)' }}>
                {stats.availableEquipment}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="body-small" style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                Total
              </div>
              <div className="heading-4" style={{ color: 'var(--brand-primary)' }}>
                {stats.totalEquipment}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipment by Category */}
      {stats.equipmentByCategory && stats.equipmentByCategory.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-header-title">Equipment by Category</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {stats.equipmentByCategory.map((cat, index) => (
                <div 
                  key={index} 
                  className="card card-outlined"
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp var(--duration-medium) var(--ease-out) backwards'
                  }}
                >
                  <div className="card-body card-body-compact">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className="body-base" style={{ fontWeight: 'var(--font-medium)' }}>
                        {cat.category}
                      </div>
                      <div className="badge badge-primary">
                        {cat.count}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {stats.equipmentByCategory && stats.equipmentByCategory.length === 0 && (
        <div className="card">
          <div className="card-body">
            <div className="table-empty">
              <svg className="table-empty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
                <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 className="table-empty-title">No Equipment Yet</h3>
              <p className="table-empty-message">
                Start by adding equipment items to track your inventory
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
