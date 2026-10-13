import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobService } from '../services/jobService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function JobListings() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Tracking state to show button spinner
  const [trackingId, setTrackingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [search, jobType, locationFilter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await jobService.getJobListings({
        search,
        job_type: jobType,
        location: locationFilter
      });
      if (data.success) {
        setListings(data.listings);
      }
    } catch (err) {
      console.error('Error fetching job listings:', err);
      setError('Failed to fetch job listings from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackDirectly = async (job) => {
    try {
      setTrackingId(job.id);
      const res = await jobService.trackJob(job.id);
      setSuccessMsg(`🎉 Added "${job.company_name} - ${job.job_title}" to your Applications!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Error tracking job:', err);
      const msg = err.response?.data?.message || 'Failed to add job to tracker.';
      setError(msg);
      setTimeout(() => setError(''), 4000);
    } finally {
      setTrackingId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Curated Job & Placement Listings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Explore curated campus & off-campus opportunities. You can apply directly or track them in your dashboard.
        </p>
      </div>

      {/* Transparency Banner */}
      <div className="alert alert-info" style={{ marginBottom: '24px' }}>
        <span>
          ℹ️ <strong>CSE Portfolio Sample Openings:</strong> The openings listed here are sample campus opportunities seeded into your MySQL database for placement presentation and tracking demonstration.
        </span>
      </div>

      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div className="filter-bar">
          <div className="filter-group">
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search company, role, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="form-select"
              style={{ width: '160px' }}
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="All">All Job Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Internship">Internship</option>
              <option value="Part-time">Part-time</option>
            </select>

            <select
              className="form-select"
              style={{ width: '180px' }}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Bangalore">Bangalore</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Chennai">Chennai</option>
              <option value="Remote">Remote / Pan-India</option>
            </select>
          </div>

          {(search || jobType !== 'All' || locationFilter !== 'All') && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setJobType('All');
                setLocationFilter('All');
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <LoadingSpinner message="Loading job listings..." />
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💼</div>
          <h4 className="empty-title">No listings match your search</h4>
          <p className="empty-desc">Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {listings.map((job) => (
            <div key={job.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="tag">{job.job_type}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 {job.location}</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {job.job_title}
                </h3>
                <div style={{ fontSize: '0.92rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '12px' }}>
                  🏢 {job.company_name}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                    Required Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {job.required_skills.split(',').map((skill, idx) => (
                      <span key={idx} style={{ background: '#f1f5f9', color: '#334155', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 }}>
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '12px' }}>
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                >
                  Careers Page &nearr;
                </a>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1.2 }}
                  onClick={() => handleTrackDirectly(job)}
                  disabled={trackingId === job.id}
                >
                  {trackingId === job.id ? 'Adding...' : '+ Track in My Apps'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
