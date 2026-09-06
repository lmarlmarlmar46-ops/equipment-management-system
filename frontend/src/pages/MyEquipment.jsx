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
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your equipment...</p>
      </div>
    );
  }

  return (
    <div className="employee-portal">
      <div className="portal-header">
        <div>
          <h1>📦 My Equipment</h1>
          <p>View and manage equipment allocated to you</p>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="empty-state">
          <p>📭 No equipment allocated</p>
          <small>You don't have any equipment assigned to you</small>
          <button className="btn-primary" onClick={() => window.location.href = '/request-equipment'}>
            Request Equipment
          </button>
        </div>
      ) : (
        <div className="equipment-grid">
          {allocations.map(allocation => {
            const returnStatus = getReturnStatus(allocation.expected_return_date, allocation.status);
            
            return (
              <div key={allocation.id} className={`equipment-card ${returnStatus.class}`}>
                <div className="equipment-icon">💻</div>
                
                <div className="equipment-details">
                  <h3>{allocation.equipment_name}</h3>
                  <p className="equipment-category">{allocation.equipment_category}</p>
                  
                  <div className="equipment-info">
                    <div className="info-item">
                      <span className="info-label">Serial Number:</span>
                      <span className="info-value">{allocation.equipment_serial}</span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Issued Date:</span>
                      <span className="info-value">
                        {format(new Date(allocation.allocated_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    
                    <div className="info-item">
                      <span className="info-label">Return By:</span>
                      <span className="info-value">
                        {format(new Date(allocation.expected_return_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  <div className={`return-status-banner ${returnStatus.class}`}>
                    <strong>{returnStatus.text}</strong>
                    <small>{returnStatus.message}</small>
                  </div>

                  {allocation.notes && (
                    <div className="equipment-notes">
                      <strong>Notes:</strong>
                      <p>{allocation.notes}</p>
                    </div>
                  )}
                </div>

                <div className="equipment-actions">
                  {allocation.status === 'return_pending' ? (
                    <div className="return-pending-message">
                      <p>✅ Return initiated</p>
                      <small>Please bring equipment to IT department</small>
                    </div>
                  ) : (
                    <button
                      className="btn-return"
                      onClick={() => handleInitiateReturn(allocation)}
                      disabled={initiatingReturn === allocation.id}
                    >
                      {initiatingReturn === allocation.id ? (
                        <>
                          <span className="spinner"></span>
                          Processing...
                        </>
                      ) : (
                        '🔄 Initiate Return'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="portal-info">
        <h3>ℹ️ Equipment Care Guidelines</h3>
        <ul>
          <li>Keep your equipment clean and in good condition</li>
          <li>Report any damage or issues to IT immediately</li>
          <li>Do not lend equipment to other employees</li>
          <li>Return equipment by the due date</li>
          <li>Use the "Initiate Return" button when ready to return</li>
        </ul>
      </div>
    </div>
  );
};

export default MyEquipment;
