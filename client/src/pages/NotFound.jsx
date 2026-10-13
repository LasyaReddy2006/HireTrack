import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>404</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '8px 0 12px 0' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '420px', marginBottom: '24px' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
}
