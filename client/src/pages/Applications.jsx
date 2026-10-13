import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Applications() {
  const navigate = useNavigate();

  // State for applications list and pagination
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search, filter, and sorting states
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Modal state for delete confirmation
  const [appToDelete, setAppToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch applications whenever filter/page parameters change
  useEffect(() => {
    fetchApplications();
  }, [search, status, jobType, sortBy, page]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationService.getApplications({
        search,
        status,
        job_type: jobType,
        sortBy,
        page,
        limit: 10
      });

      if (data.success) {
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return;
    try {
      setDeleteLoading(true);
      await applicationService.deleteApplication(appToDelete.id);
      setSuccessMsg(`Successfully deleted application for ${appToDelete.company_name}.`);
      setAppToDelete(null);
      fetchApplications();
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err.response?.data?.message || 'Failed to delete application.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setJobType('All');
    setSortBy('date_desc');
    setPage(1);
  };

  return (
    <div>
      {/* Header and Add Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>My Applications</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage, filter, and track all your submitted job applications
          </p>
        </div>
        <Link to="/applications/new" className="btn btn-primary">
          + Add Application
        </Link>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div className="filter-bar">
          <div className="filter-group">
            {/* Search Input */}
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search company or job title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            {/* Status Filter */}
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>

            {/* Job Type Filter */}
            <select
              className="form-select"
              style={{ width: '160px' }}
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
            </select>

            {/* Sort Dropdown */}
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="date_desc">Applied Date: Newest</option>
              <option value="date_asc">Applied Date: Oldest</option>
              <option value="company_asc">Company (A-Z)</option>
              <option value="company_desc">Company (Z-A)</option>
            </select>
          </div>

          {(search || status !== 'All' || jobType !== 'All' || sortBy !== 'date_desc') && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Applications Data Table */}
      {loading ? (
        <LoadingSpinner message="Loading applications..." />
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h4 className="empty-title">No applications found</h4>
          <p className="empty-desc">
            {search || status !== 'All' || jobType !== 'All'
              ? 'No applications match your active search or filters. Try adjusting your search query.'
              : 'You haven\'t added any job applications yet. Click below to add your first one!'}
          </p>
          {search || status !== 'All' || jobType !== 'All' ? (
            <button className="btn btn-secondary" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          ) : (
            <Link to="/applications/new" className="btn btn-primary">
              + Add First Application
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Applied Date</th>
                  <th>Package / Salary</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <strong>{app.company_name}</strong>
                    </td>
                    <td>{app.job_title}</td>
                    <td>{app.location}</td>
                    <td>
                      <span className="tag">{app.job_type}</span>
                    </td>
                    <td>{app.application_date}</td>
                    <td>{app.salary || <span style={{ color: 'var(--text-light)' }}>—</span>}</td>
                    <td>
                      <Badge status={app.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <Link
                          to={`/applications/${app.id}`}
                          className="btn btn-secondary btn-sm"
                          title="View Details"
                        >
                          View
                        </Link>
                        <Link
                          to={`/applications/edit/${app.id}`}
                          className="btn btn-secondary btn-sm"
                          title="Edit"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => setAppToDelete(app)}
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', padding: '0 8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total applications)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  &larr; Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next &rarr;
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(appToDelete)}
        onClose={() => setAppToDelete(null)}
        title="Confirm Delete Application"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setAppToDelete(null)}
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Application'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', fontSize: '0.92rem' }}>
          Are you sure you want to delete your application for{' '}
          <strong>{appToDelete?.company_name}</strong> - <strong>{appToDelete?.job_title}</strong>?
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '8px' }}>
          This will permanently remove this record from your MySQL database. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
