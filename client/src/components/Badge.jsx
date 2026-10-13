import React from 'react';

/**
 * Reusable Status Badge Component
 * Displays application status with dedicated color styling and indicator dot
 */
export default function Badge({ status }) {
  const normalizedStatus = (status || 'Applied').toLowerCase();
  
  return (
    <span className={`badge badge-${normalizedStatus}`}>
      <span className="badge-dot"></span>
      {status}
    </span>
  );
}
