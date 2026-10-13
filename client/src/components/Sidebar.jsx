import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">H</div>
        <div>
          <span className="brand-title">HireTrack</span>
          <span className="brand-badge">PRO</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          {/* Dashboard Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink 
          to="/applications" 
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          {/* Applications Table Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          My Applications
        </NavLink>

        <NavLink 
          to="/applications/new" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          {/* Plus / Add Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add Application
        </NavLink>

        <NavLink 
          to="/jobs" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          {/* Job Board Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
          Job Listings
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          {/* Profile User Icon */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          My Profile
        </NavLink>
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="avatar-circle">{initial}</div>
          <div className="user-profile-info">
            <div className="user-name">{user?.name || 'Student'}</div>
            <div className="user-email">{user?.email || ''}</div>
          </div>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={handleLogout} 
            title="Log out"
            aria-label="Log out"
          >
            {/* Logout Icon */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
