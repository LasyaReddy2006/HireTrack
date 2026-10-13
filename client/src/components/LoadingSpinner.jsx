import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{message}</p>
    </div>
  );
}
