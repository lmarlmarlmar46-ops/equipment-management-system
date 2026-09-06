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
      <div className="portal-header">
        <h1>➕ Request Equipment</h1>
        <p>Submit a new equipment request to IT Operations</p>
      </div>

      <div className="request-form-container">
        <form onSubmit={handleSubmit} className="request-form">
          <div className="form-group">
            <label htmlFor="equipment_type">
              Equipment Type <span className="required">*</span>
            </label>
            <input
              type="text"
              id="equipment_type"
              name="equipment_type"
              value={formData.equipment_type}
              onChange={handleChange}
              placeholder="e.g., Laptop, Monitor, Keyboard, Mouse"
              required
              disabled={submitting}
            />
            <small className="form-hint">
              Specify the type of equipment you need
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="justification">
              Justification <span className="required">*</span>
            </label>
            <textarea
              id="justification"
              name="justification"
              value={formData.justification}
              onChange={handleChange}
              placeholder="Explain why you need this equipment..."
              rows="5"
              required
              disabled={submitting}
            />
            <small className="form-hint">
              Provide details about why this equipment is needed
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority Level</label>
              <select
                id="priority"
                name="priority"
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
              <label htmlFor="required_by_date">Required By (Optional)</label>
              <input
                type="date"
                id="required_by_date"
                name="required_by_date"
                value={formData.required_by_date}
                onChange={handleChange}
                disabled={submitting}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/my-requests')}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                '📤 Submit Request'
              )}
            </button>
          </div>
        </form>

        <div className="request-tips">
          <h3>💡 Tips for Your Request</h3>
          <ul>
            <li>Be specific about the equipment type you need</li>
            <li>Provide clear justification for your request</li>
            <li>Set appropriate priority based on urgency</li>
            <li>Include any special requirements or preferences</li>
            <li>IT will review and respond within 1-2 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RequestEquipment;
