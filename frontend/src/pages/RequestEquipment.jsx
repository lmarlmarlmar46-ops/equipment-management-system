import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workflowAPI } from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/EmployeePortal.css';

const RequestEquipment = () => {
  const [formData, setFormData] = useState({
    equipment_type: '',
    justification: '',
    priority: 'medium',
    required_by_date: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await workflowAPI.requestEquipment(formData);
      toast.success('Equipment request submitted successfully!');
      navigate('/my-requests');
    } catch (error) {
      console.error('Failed to submit request:', error);
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="employee-portal">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div>
            <h1 className="heading-2">Request Equipment</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Submit a new equipment request to IT Operations
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-header-title">Equipment Request Form</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <div className="form-group">
                <label htmlFor="equipment_type" className="form-label is-required">
                  Equipment Type
                </label>
                <input
                  type="text"
                  id="equipment_type"
                  name="equipment_type"
                  className="form-input"
                  value={formData.equipment_type}
                  onChange={handleChange}
                  placeholder="e.g., Laptop, Monitor, Keyboard, Mouse"
                  required
                  disabled={submitting}
                />
                <small className="caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', display: 'block' }}>
                  Specify the type of equipment you need
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="justification" className="form-label is-required">
                  Justification
                </label>
                <textarea
                  id="justification"
                  name="justification"
                  className="form-textarea"
                  value={formData.justification}
                  onChange={handleChange}
                  placeholder="Explain why you need this equipment..."
                  rows="5"
                  required
                  disabled={submitting}
                />
                <small className="caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)', display: 'block' }}>
                  Provide details about why this equipment is needed
                </small>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                  <label htmlFor="priority" className="form-label">Priority Level</label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="low">Low - Can wait</option>
                    <option value="medium">Medium - Standard request</option>
                    <option value="high">High - Needed soon</option>
                    <option value="critical">Critical - Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="required_by_date" className="form-label">Required By (Optional)</label>
                  <input
                    type="date"
                    id="required_by_date"
                    name="required_by_date"
                    className="form-input"
                    value={formData.required_by_date}
                    onChange={handleChange}
                    disabled={submitting}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-primary)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/my-requests')}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className={`btn btn-primary ${submitting ? 'is-loading' : ''}`} disabled={submitting}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
          <div className="card-header">
            <h3 className="card-header-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginRight: 'var(--space-2)' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tips for Your Request
            </h3>
          </div>
          <div className="card-body">
            <ul style={{ margin: 0, padding: '0 0 0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li className="body-sm">Be specific about the equipment type you need</li>
              <li className="body-sm">Provide clear justification for your request</li>
              <li className="body-sm">Set appropriate priority based on urgency</li>
              <li className="body-sm">Include any special requirements or preferences</li>
              <li className="body-sm">IT will review and respond within 1-2 business days</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestEquipment;
