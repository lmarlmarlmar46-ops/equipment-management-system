import React from 'react';

const LoadingSkeleton = ({ type = 'table', count = 3 }) => {
  if (type === 'stats') {
    return (
      <div className="stats-grid">
        {[...Array(count)].map((_, i) => (
          <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 50}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="skeleton skeleton-circle"></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton skeleton-text short" style={{ marginBottom: '0.75rem' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i}>
                  <div className="skeleton skeleton-text short"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(count)].map((_, i) => (
              <tr key={i}>
                {[...Array(5)].map((_, j) => (
                  <td key={j}>
                    <div className="skeleton skeleton-text"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="skeleton-card">
        <div className="skeleton skeleton-header"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="skeleton-card">
        <div className="skeleton skeleton-header" style={{ marginBottom: '2rem' }}></div>
        {[...Array(count)].map((_, i) => (
          <div key={i} style={{ marginBottom: '1.5rem' }}>
            <div className="skeleton skeleton-text short" style={{ marginBottom: '0.5rem', width: '20%' }}></div>
            <div className="skeleton skeleton-text" style={{ height: '48px' }}></div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
