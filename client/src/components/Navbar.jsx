import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();

  // Dynamic page title based on pathname
  const getPageTitle = (pathname) => {
    if (pathname === '/dashboard') return 'Overview Dashboard';
    if (pathname === '/applications') return 'Job Applications';
    if (pathname === '/applications/new') return 'Add New Application';
    if (pathname.startsWith('/applications/edit')) return 'Edit Application';
    if (pathname.startsWith('/applications/')) return 'Application Details';
    if (pathname === '/jobs') return 'Campus & Placement Job Listings';
    if (pathname === '/profile') return 'My Profile & Account';
    return 'HireTrack Portal';
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Mobile menu hamburger toggle */}
        <button 
          type="button" 
          className="btn-icon mobile-toggle" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          style={{ display: 'inline-flex' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="navbar-page-title">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="navbar-actions">
        {/* Quick action: Add Application */}
        <Link to="/applications/new" className="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Application
        </Link>

        {/* User mini status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
            {initial}
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-main)' }}>
            {user?.name ? user.name.split(' ')[0] : 'User'}
          </span>
        </div>
      </div>
    </header>
  );
}
