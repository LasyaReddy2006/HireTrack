import React from 'react';

/**
 * Metric Card for Dashboard Overview
 */
export default function StatCard({ label, value, icon, variant = 'total' }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
      <div className={`stat-icon ${variant}`}>
        {icon}
      </div>
    </div>
  );
}
