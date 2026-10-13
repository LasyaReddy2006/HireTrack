import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationService } from '../services/applicationService';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await applicationService.getDashboardStats();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(
        err.response?.data?.message || 
        'Unable to load dashboard statistics. Ensure your MySQL database is initialized and server is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating your application statistics..." />;
  }

  // Calculate percentages for status breakdown bar
  const total = stats?.total || 0;
  const appliedPct = total ? Math.round((stats.awaitingResponse / total) * 100) : 0;
  const interviewPct = total ? Math.round((stats.interviews / total) * 100) : 0;
  const offerPct = total ? Math.round((stats.offers / total) * 100) : 0;
  const rejectedPct = total ? Math.round((stats.rejected / total) * 100) : 0;

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Welcome back, {user?.name || 'Student'}! 👋
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Here is a real-time summary of your placements and job applications.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/applications/new" className="btn btn-primary">
            + Add Application
          </Link>
          <Link to="/jobs" className="btn btn-secondary">
            Browse Job Openings
          </Link>
        </div>
      </div>

      {error && <Alert type="danger" message={error} />}

      {/* 5 Key Metric Cards */}
      <div className="stats-grid">
        <StatCard
          label="Total Applications"
          value={stats?.total || 0}
          icon="📁"
          variant="total"
        />
        <StatCard
          label="Awaiting Response"
          value={stats?.awaitingResponse || 0}
          icon="⏳"
          variant="applied"
        />
        <StatCard
          label="Interviews Scheduled"
          value={stats?.interviews || 0}
          icon="🎯"
          variant="interview"
        />
        <StatCard
          label="Offers Received"
          value={stats?.offers || 0}
          icon="🏆"
          variant="offer"
        />
        <StatCard
          label="Rejections"
          value={stats?.rejected || 0}
          icon="📉"
          variant="rejected"
        />
      </div>

      {/* Application Status Summary Bar */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Application Funnel Summary</h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Based on {total} recorded {total === 1 ? 'application' : 'applications'}
          </span>
        </div>

        {total === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No applications recorded yet. Once you add job applications, your progress breakdown will appear here.
          </p>
        ) : (
          <div>
            {/* Visual stacked progress bar */}
            <div style={{ height: '14px', borderRadius: '7px', display: 'flex', overflow: 'hidden', background: '#e2e8f0', marginBottom: '16px' }}>
              {appliedPct > 0 && <div style={{ width: `${appliedPct}%`, background: '#2563eb' }} title={`Applied: ${appliedPct}%`} />}
              {interviewPct > 0 && <div style={{ width: `${interviewPct}%`, background: '#d97706' }} title={`Interview: ${interviewPct}%`} />}
              {offerPct > 0 && <div style={{ width: `${offerPct}%`, background: '#16a34a' }} title={`Offer: ${offerPct}%`} />}
              {rejectedPct > 0 && <div style={{ width: `${rejectedPct}%`, background: '#dc2626' }} title={`Rejected: ${rejectedPct}%`} />}
            </div>

            {/* Legend badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }}></span>
                <span>Applied / Under Review: <strong>{stats?.awaitingResponse}</strong> ({appliedPct}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }}></span>
                <span>Interview Round: <strong>{stats?.interviews}</strong> ({interviewPct}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }}></span>
                <span>Offer Letter: <strong>{stats?.offers}</strong> ({offerPct}%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }}></span>
                <span>Rejected: <strong>{stats?.rejected}</strong> ({rejectedPct}%)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Recent Applications</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '2px' }}>
              Latest 5 applications added to your portfolio
            </p>
          </div>
          <Link to="/applications" className="btn btn-secondary btn-sm">
            View All Applications &rarr;
          </Link>
        </div>

        {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h4 className="empty-title">No applications added yet</h4>
            <p className="empty-desc">
              Start building your placement tracker by recording the companies and roles you have applied for.
            </p>
            <Link to="/applications/new" className="btn btn-primary">
              + Add First Application
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Job Type</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td><strong>{app.company_name}</strong></td>
                    <td>{app.job_title}</td>
                    <td>{app.location}</td>
                    <td><span className="tag">{app.job_type}</span></td>
                    <td>{app.application_date}</td>
                    <td><Badge status={app.status} /></td>
                    <td>
                      <Link to={`/applications/${app.id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
