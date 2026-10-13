import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status updating state
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationService.getApplicationById(id);
      if (data.success) {
        setApplication(data.application);
      }
    } catch (err) {
      console.error('Error fetching application details:', err);
      setError(err.response?.data?.message || 'Application not found or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!application || application.status === newStatus) return;
    try {
      setStatusUpdating(true);
      await applicationService.updateApplication(id, {
        ...application,
        status: newStatus
      });
      setApplication((prev) => ({ ...prev, status: newStatus }));
      setSuccessMsg(`Status updated to "${newStatus}"!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to change status:', err);
      setError('Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await applicationService.deleteApplication(id);
      navigate('/applications');
    } catch (err) {
      console.error('Error deleting application:', err);
      setError('Failed to delete application.');
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching application details..." />;
  }

  if (error || !application) {
    return (
      <div style={{ maxWidth: '700px', margin: '40px auto' }}>
        <Alert type="danger" message={error || 'Application not found.'} />
        <Link to="/applications" className="btn btn-secondary">
          &larr; Return to Applications
        </Link>
      </div>
    );
  }

  const allStatuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'];

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Top Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/applications" className="btn btn-secondary btn-sm">
          &larr; Back to Applications
        </Link>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/applications/edit/${id}`} className="btn btn-secondary btn-sm">
            Edit Application
          </Link>
          <button 
            type="button" 
            className="btn btn-danger btn-sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </button>
        </div>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Main Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
          <div>
            <span className="tag" style={{ marginBottom: '8px' }}>{application.job_type}</span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
              {application.job_title}
            </h2>
            <div style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 600, marginTop: '2px' }}>
              🏢 {application.company_name}
            </div>
          </div>
          <div>
            <Badge status={application.status} />
          </div>
        </div>

        {/* Quick Status Bar */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Quick Status Update
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {allStatuses.map((st) => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${application.status === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleStatusChange(st)}
                disabled={statusUpdating || application.status === st}
              >
                {application.status === st ? `✓ ${st}` : st}
              </button>
            ))}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>📍 {application.location}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Application Date</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>📅 {application.application_date}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Salary / Package</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '4px' }}>
              💰 {application.salary || 'Not specified'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Job Posting Link</div>
            <div style={{ fontSize: '0.95rem', marginTop: '4px' }}>
              {application.job_url ? (
                <a href={application.job_url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', wordBreak: 'break-all' }}>
                  View Job Post &nearr;
                </a>
              ) : (
                <span style={{ color: 'var(--text-light)' }}>No URL provided</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes & Interview Preparation Log */}
        <div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>
            Interview Notes & Rounds Log
          </div>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', minHeight: '80px', whiteSpace: 'pre-wrap', fontSize: '0.9rem', color: application.notes ? 'var(--text-main)' : 'var(--text-light)' }}>
            {application.notes || 'No notes added yet. Click "Edit Application" to add interview rounds, feedback, or recruiter contacts.'}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Application"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </>
        }
      >
        <p>Are you sure you want to delete this application for <strong>{application.company_name}</strong>?</p>
      </Modal>
    </div>
  );
}
