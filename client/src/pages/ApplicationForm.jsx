import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ApplicationForm() {
  const { id } = useParams(); // If present, we are in Edit mode
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form input state
  const [formData, setFormData] = useState({
    company_name: searchParams.get('company') || '',
    job_title: searchParams.get('title') || '',
    location: searchParams.get('location') || '',
    job_type: searchParams.get('type') || 'Full-time',
    status: 'Applied',
    application_date: new Date().toISOString().split('T')[0],
    job_url: searchParams.get('url') || '',
    salary: '',
    notes: ''
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // If editing, load the application's current values
  useEffect(() => {
    if (isEditMode) {
      async function loadApplication() {
        try {
          setLoading(true);
          const data = await applicationService.getApplicationById(id);
          if (data.success && data.application) {
            const app = data.application;
            setFormData({
              company_name: app.company_name || '',
              job_title: app.job_title || '',
              location: app.location || '',
              job_type: app.job_type || 'Full-time',
              status: app.status || 'Applied',
              application_date: app.application_date || new Date().toISOString().split('T')[0],
              job_url: app.job_url || '',
              salary: app.salary || '',
              notes: app.notes || ''
            });
          }
        } catch (err) {
          console.error('Error loading application for editing:', err);
          setError(err.response?.data?.message || 'Could not find the application to edit.');
        } finally {
          setLoading(false);
        }
      }
      loadApplication();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.company_name.trim() || !formData.job_title.trim() || !formData.location.trim()) {
      setError('Company name, job title, and location are required.');
      return;
    }

    if (!formData.application_date) {
      setError('Please provide a valid application date.');
      return;
    }

    try {
      setSaving(true);
      if (isEditMode) {
        await applicationService.updateApplication(id, formData);
        navigate(`/applications/${id}`);
      } else {
        const res = await applicationService.createApplication(formData);
        navigate('/applications');
      }
    } catch (err) {
      console.error('Error saving application:', err);
      setError(err.response?.data?.message || 'Failed to save application. Please verify your inputs.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application details..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            {isEditMode ? 'Edit Job Application' : 'Add New Job Application'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {isEditMode
              ? 'Update interview rounds, compensation details, or notes'
              : 'Record a new company application to track in your placement journey'}
          </p>
        </div>
        <Link to="/applications" className="btn btn-secondary btn-sm">
          &larr; Back to Applications
        </Link>
      </div>

      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* Row 1: Company Name & Job Title */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="company_name">Company Name *</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                className="form-input"
                placeholder="e.g. Google, Microsoft, Zoho"
                value={formData.company_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job_title">Job Title / Role *</label>
              <input
                id="job_title"
                name="job_title"
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineer, Backend Intern"
                value={formData.job_title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Location & Job Type */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="location">Job Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                className="form-input"
                placeholder="e.g. Bangalore, Hyderabad, Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job_type">Employment Type</label>
              <select
                id="job_type"
                name="job_type"
                className="form-select"
                value={formData.job_type}
                onChange={handleChange}
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          {/* Row 3: Status & Application Date */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="status">Application Status</label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Applied">Applied (Awaiting Response)</option>
                <option value="Interview">Interview Scheduled / In Progress</option>
                <option value="Offer">Offer Received 🎉</option>
                <option value="Rejected">Rejected</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="application_date">Application Date *</label>
              <input
                id="application_date"
                name="application_date"
                type="date"
                className="form-input"
                value={formData.application_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 4: Salary & Job URL */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="salary">Salary / Package (Optional)</label>
              <input
                id="salary"
                name="salary"
                type="text"
                className="form-input"
                placeholder="e.g. ₹14 LPA, ₹35,000/month stipend"
                value={formData.salary}
                onChange={handleChange}
              />
              <div className="form-help">CTC or stipend offered/expected</div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="job_url">Job Post URL (Optional)</label>
              <input
                id="job_url"
                name="job_url"
                type="url"
                className="form-input"
                placeholder="https://careers.company.com/job/123"
                value={formData.job_url}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 5: Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">Interview Notes & Highlights (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              className="form-textarea"
              placeholder="e.g. Round 1 DSA: Questions on Binary Trees and Dynamic Programming. Recruiter email: recruiter@company.com"
              value={formData.notes}
              onChange={handleChange}
            />
            <div className="form-help">Keep track of interview rounds, questions asked, or referral contacts</div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '18px' }}>
            <Link to="/applications" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Application' : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
