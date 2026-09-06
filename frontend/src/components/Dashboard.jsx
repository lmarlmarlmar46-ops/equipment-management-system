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
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="dashboard-subtitle">Real-time equipment and allocation metrics</p>
        </div>
        <div className="dashboard-refresh">
          <button className="btn-refresh" onClick={fetchStats} title="Refresh">
            🔄
          </button>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">💻</div>
          <div className="stat-content">
            <h3>{animatedStats.totalEquipment}</h3>
            <p>Total Equipment</p>
          </div>
          <div className="stat-trend">📈</div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{animatedStats.availableEquipment}</h3>
            <p>Available</p>
          </div>
          <div className="stat-trend">✨</div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{animatedStats.allocatedEquipment}</h3>
            <p>Allocated</p>
          </div>
          <div className="stat-trend">📊</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{animatedStats.activeEmployees}</h3>
            <p>Active Employees</p>
          </div>
          <div className="stat-trend">👔</div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{animatedStats.activeAllocations}</h3>
            <p>Active Allocations</p>
          </div>
          <div className="stat-trend">⚡</div>
        </div>
      </div>

      {/* Utilization Rate Card */}
      <div className="utilization-card">
        <div className="utilization-header">
          <h3>Equipment Utilization</h3>
          <span className="utilization-percentage">{utilizationRate}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${utilizationRate}%` }}
          ></div>
        </div>
        <div className="utilization-details">
          <div className="utilization-item">
            <span className="utilization-label">In Use</span>
            <span className="utilization-value">{stats.allocatedEquipment}</span>
          </div>
          <div className="utilization-item">
            <span className="utilization-label">Available</span>
            <span className="utilization-value">{stats.availableEquipment}</span>
          </div>
          <div className="utilization-item">
            <span className="utilization-label">Total</span>
            <span className="utilization-value">{stats.totalEquipment}</span>
          </div>
        </div>
      </div>

      {stats.equipmentByCategory && stats.equipmentByCategory.length > 0 && (
        <div className="category-section">
          <h3>Equipment by Category</h3>
          <div className="category-grid">
            {stats.equipmentByCategory.map((cat, index) => (
              <div key={index} className="category-card" style={{ animationDelay: `${index * 50}ms` }}>
                <span className="category-name">{cat.category}</span>
                <span className="category-count">{cat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.equipmentByCategory && stats.equipmentByCategory.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <div className="empty-state-title">No Equipment Yet</div>
          <div className="empty-state-description">
            Start by adding equipment items to track your inventory
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
