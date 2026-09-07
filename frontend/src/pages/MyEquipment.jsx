import { useState, useEffect } from 'react';
import { allocationsAPI, workflowAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format, differenceInDays } from 'date-fns';
import '../styles/EmployeePortal.css';

const MyEquipment = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initiatingReturn, setInitiatingReturn] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMyEquipment();
  }, [user]);

  const loadMyEquipment = async () => {
    try {
      setLoading(true);
      // Get allocations for current user's employee_id
      const response = await allocationsAPI.getAll({
        employee_id: user?.employee_id,
        status: 'active'
      });
      setAllocations(response.data);
    } catch (error) {
      console.error('Failed to load equipment:', error);
      toast.error('Failed to load your equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateReturn = async (allocation) => {
    if (!window.confirm(`Are you sure you want to return ${allocation.equipment_name}?`)) {
      return;
    }

    setInitiatingReturn(allocation.id);

    try {
      await workflowAPI.initiateReturn({
        allocation_id: allocation.id,
        notes: 'Equipment no longer needed'
      });

      toast.success('Return request submitted. Please bring equipment to IT department.');
      loadMyEquipment();
    } catch (error) {
      console.error('Failed to initiate return:', error);
      toast.error(error.response?.data?.error || 'Failed to initiate return');
    } finally {
      setInitiatingReturn(null);
    }
  };

  const getDaysUntilReturn = (expectedReturnDate) => {
    return differenceInDays(new Date(expectedReturnDate), new Date());
  };

  const getReturnStatus = (expectedReturnDate, status) => {
    if (status === 'return_pending') {
      return {
        text: '🔄 Return Pending',
        class: 'return-pending',
        message: 'Please bring this equipment to IT department'
      };
    }

    const days = getDaysUntilReturn(expectedReturnDate);
    
    if (days < 0) {
      return {
        text: `⚠️ ${Math.abs(days)} days overdue`,
        class: 'overdue',
        message: 'This equipment is overdue for return!'
      };
    } else if (days <= 7) {
      return {
        text: `⏰ ${days} days until return`,
        class: 'due-soon',
        message: 'Return due soon'
      };
    } else {
      return {
        text: `✅ ${days} days remaining`,
        class: 'active',
        message: 'Equipment in good standing'
      };
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: 'var(--space-4)' }}>
        <div className="loading-spinner"></div>
        <p className="body-base" style={{ color: 'var(--text-secondary)' }}>Loading your equipment...</p>
      </div>
    );
  }

  return (
    <div className="employee-portal">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">My Equipment</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              View and manage equipment allocated to you
            </p>
          </div>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-tertiary)', margin: '0 auto var(--space-4)' }}>
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>No equipment allocated</h3>
            <p className="body-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
              You don't have any equipment assigned to you
            </p>
            <button className="btn btn-primary" onClick={() => window.location.href = '/request-equipment'}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Request Equipment
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          {allocations.map(allocation => {
            const returnStatus = getReturnStatus(allocation.expected_return_date, allocation.status);
            
            return (
              <div key={allocation.id} className="card">
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ flexShrink: 0, width: '48px', height: '48px', background: 'var(--brand-primary-alpha)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--brand-primary)' }}>
                        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 className="heading-5" style={{ marginBottom: 'var(--space-1)' }}>{allocation.equipment_name}</h3>
                      <span className="badge badge-info" style={{ fontSize: 'var(--text-xs)' }}>{allocation.equipment_category}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="caption" style={{ color: 'var(--text-tertiary)' }}>Serial Number</span>
                      <code style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{allocation.equipment_serial}</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="caption" style={{ color: 'var(--text-tertiary)' }}>Issued Date</span>
                      <span className="body-sm">{format(new Date(allocation.allocated_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="caption" style={{ color: 'var(--text-tertiary)' }}>Return By</span>
                      <span className="body-sm">{format(new Date(allocation.expected_return_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>

                  <div style={{ 
                    padding: 'var(--space-3)', 
                    background: returnStatus.class === 'overdue' ? 'var(--error-alpha)' : 
                                returnStatus.class === 'due-soon' ? 'var(--warning-alpha)' : 
                                returnStatus.class === 'return-pending' ? 'var(--info-alpha)' : 
                                'var(--success-alpha)',
                    border: `1px solid ${returnStatus.class === 'overdue' ? 'var(--error)' : 
                                          returnStatus.class === 'due-soon' ? 'var(--warning)' : 
                                          returnStatus.class === 'return-pending' ? 'var(--info)' : 
                                          'var(--success)'}`,
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)'
                  }}>
                    <strong className="body-sm">{returnStatus.text}</strong>
                    <span className="caption" style={{ color: 'var(--text-secondary)' }}>{returnStatus.message}</span>
                  </div>

                  {allocation.notes && (
                    <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                      <strong className="caption" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-1)' }}>Notes</strong>
                      <p className="body-sm">{allocation.notes}</p>
                    </div>
                  )}

                  <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)' }}>
                    {allocation.status === 'return_pending' ? (
                      <div style={{ textAlign: 'center', padding: 'var(--space-3)', background: 'var(--success-alpha)', borderRadius: 'var(--radius-md)', border: '1px solid var(--success)' }}>
                        <p className="body-sm" style={{ fontWeight: '500', marginBottom: 'var(--space-1)' }}>Return initiated</p>
                        <span className="caption" style={{ color: 'var(--text-secondary)' }}>Please bring equipment to IT department</span>
                      </div>
                    ) : (
                      <button
                        className={`btn btn-secondary ${initiatingReturn === allocation.id ? 'is-loading' : ''}`}
                        style={{ width: '100%' }}
                        onClick={() => handleInitiateReturn(allocation)}
                        disabled={initiatingReturn === allocation.id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 14L4 9L9 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 9H14C16.2091 9 18.3436 9.87498 19.9246 11.4555C21.5057 13.0361 22.3807 15.1705 22.3807 17.3796" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {initiatingReturn === allocation.id ? 'Processing...' : 'Initiate Return'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
        <div className="card-header">
          <h3 className="card-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            Equipment Care Guidelines
          </h3>
        </div>
        <div className="card-body">
          <ul style={{ margin: 0, padding: '0 0 0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li className="body-sm">Keep your equipment clean and in good condition</li>
            <li className="body-sm">Report any damage or issues to IT immediately</li>
            <li className="body-sm">Do not lend equipment to other employees</li>
            <li className="body-sm">Return equipment by the due date</li>
            <li className="body-sm">Use the "Initiate Return" button when ready to return</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MyEquipment;
