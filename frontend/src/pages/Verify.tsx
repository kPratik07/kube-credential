import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { verifyCredential, getVerificationHistory } from '../services/api';
import type { Credential, VerifyResponse, VerificationRecord } from '../services/api';
import './Pages.css';

interface ValidationErrors {
  name?: string;
  email?: string;
  course?: string;
}

function Verify() {
  const [formData, setFormData] = useState<Credential>({
    name: '',
    email: '',
    course: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<VerifyResponse | null>(null);
  const [history, setHistory] = useState<VerificationRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const fetchHistory = async () => {
    const result = await getVerificationHistory();
    if (result.success) {
      setHistory(result.history);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Student name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name must not exceed 100 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!formData.email.trim().match(/\.(com|org|edu|net|gov|mil|info|biz|io|in|uk|us|ca|au|de|fr|jp|cn)$/i)) {
      newErrors.email = 'Email must end with a valid domain (e.g., .com, .org, .edu, .net)';
    } else if (formData.email.trim().length > 254) {
      newErrors.email = 'Email address is too long';
    }

    // Course validation
    if (!formData.course.trim()) {
      newErrors.course = 'Course name is required';
    } else if (formData.course.trim().length < 3) {
      newErrors.course = 'Course name must be at least 3 characters';
    } else if (formData.course.trim().length > 100) {
      newErrors.course = 'Course name must not exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResponse(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const result = await verifyCredential(formData);
      setResponse(result);
      
      // Refresh history after verification
      await fetchHistory();
      
      // Clear form and errors on success
      if (result.success) {
        setFormData({ name: '', email: '', course: '' });
        setErrors({});
      }
    } catch (error) {
      setResponse({
        success: false,
        valid: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="card-title">🔍 Verify Credential</h2>
        <p className="card-description">
          Verify if a credential has been issued and is valid.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Student Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="Enter student name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <span className="error-message" id="name-error">
                {errors.name}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="student@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span className="error-message" id="email-error">
                {errors.email}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="course" className="form-label">
              Course Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`form-input ${errors.course ? 'input-error' : ''}`}
              placeholder="e.g., Kubernetes Fundamentals"
              aria-invalid={!!errors.course}
              aria-describedby={errors.course ? 'course-error' : undefined}
            />
            {errors.course && (
              <span className="error-message" id="course-error">
                {errors.course}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Verifying...' : '🔍 Verify Credential'}
          </button>
        </form>

        {response && (
          <div className={`alert ${response.valid ? 'alert-success' : 'alert-error'}`}>
            <div className="alert-title">
              {response.valid ? '✅ Valid Credential' : '❌ Invalid Credential'}
            </div>
            <div className="alert-message">{response.message}</div>
            {response.valid && (
              <div className="alert-details">
                <p><strong>Issued By:</strong> {response.issuedBy}</p>
                <p><strong>Issued At:</strong> {formatDate(response.issuedAt || '')}</p>
                <p><strong>Verified By:</strong> {response.verifiedBy}</p>
                <p><strong>Verified At:</strong> {formatDate(response.verifiedAt || '')}</p>
              </div>
            )}
            {!response.valid && response.verifiedBy && (
              <div className="alert-details">
                <p><strong>Verified By:</strong> {response.verifiedBy}</p>
                <p><strong>Verified At:</strong> {formatDate(response.verifiedAt || '')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-card">
        <div className="info-header">
          <h3>📊 Verification History</h3>
          <button
            className="btn btn-secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? '👁️ Hide' : '👁️ Show'} History
          </button>
        </div>

        {showHistory && (
          <div className="history-container">
            {history.length === 0 ? (
              <p className="no-history">No verification history available</p>
            ) : (
              <div className="history-list">
                {history.map((record) => {
                  const credData = JSON.parse(record.credential_data);
                  return (
                    <div key={record.id} className="history-item">
                      <div className="history-status">
                        {record.is_valid ? '✅' : '❌'}
                      </div>
                      <div className="history-content">
                        <p className="history-name"><strong>{credData.name}</strong></p>
                        <p className="history-detail">{credData.email} • {credData.course}</p>
                        <p className="history-meta">
                          Verified by {record.verified_by} at {formatDate(record.verified_at)}
                        </p>
                        {record.issued_by && (
                          <p className="history-meta">
                            Originally issued by {record.issued_by}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="info-section">
          <h4>ℹ️ How It Works</h4>
          <ul>
            <li>Enter the exact credential details to verify</li>
            <li>The system checks against the Issuance Service</li>
            <li>All verification attempts are logged</li>
            <li>View history to see past verifications</li>
            <li>Each verification is tracked with worker ID</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Verify;
