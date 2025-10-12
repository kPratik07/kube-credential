import { useState } from 'react';
import type { FormEvent } from 'react';
import { issueCredential } from '../services/api';
import type { Credential, IssueResponse } from '../services/api';
import './Pages.css';

interface ValidationErrors {
  name?: string;
  email?: string;
  course?: string;
}

function Issue() {
  const [formData, setFormData] = useState<Credential>({
    name: '',
    email: '',
    course: '',
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<IssueResponse | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

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
      const result = await issueCredential(formData);
      setResponse(result);
      
      // Clear form and errors on success
      if (result.success) {
        setFormData({ name: '', email: '', course: '' });
        setErrors({});
      }
    } catch (error) {
      setResponse({
        success: false,
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

  return (
    <div className="page-container">
      <div className="card">
        <h2 className="card-title">📝 Issue Credential</h2>
        <p className="card-description">
          Issue a new credential for a student who has completed a course.
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
            {loading ? '⏳ Issuing...' : '✅ Issue Credential'}
          </button>
        </form>

        {response && (
          <div className={`alert ${response.success ? 'alert-success' : 'alert-error'}`}>
            <div className="alert-title">
              {response.success ? '✅ Success' : '❌ Error'}
            </div>
            <div className="alert-message">{response.message}</div>
            {response.success && response.issuedBy && (
              <div className="alert-details">
                <p><strong>Issued By:</strong> {response.issuedBy}</p>
                <p><strong>Timestamp:</strong> {response.timestamp}</p>
              </div>
            )}
            {!response.success && response.error && (
              <div className="alert-details">
                <p><strong>Error:</strong> {response.error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-card">
        <h3>ℹ️ How It Works</h3>
        <ul>
          <li>Enter the student's details and course information</li>
          <li>The credential will be issued by the Issuance Service</li>
          <li>Each credential is unique and stored in the database</li>
          <li>Duplicate credentials cannot be issued</li>
          <li>The issuing worker ID is recorded for tracking</li>
        </ul>
      </div>
    </div>
  );
}

export default Issue;
