import React, { useState, useEffect } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Profile() {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await profileService.getProfile();
      if (data.success) {
        setProfile(data.profile);
        setName(data.profile.name);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch user profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await profileService.updateProfile({ name: name.trim() });
      if (res.success) {
        setSuccessMsg('Your profile name was successfully updated!');
        updateUser(res.user);
        setProfile((prev) => ({ ...prev, name: res.user.name }));
      }
    } catch (err) {
      console.error('Error updating name:', err);
      setError(err.response?.data?.message || 'Failed to update profile name.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setSavingPassword(true);
      const res = await profileService.updateProfile({
        name: profile.name,
        currentPassword,
        newPassword
      });

      if (res.success) {
        setPasswordSuccess('Password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your profile..." />;
  }

  const initial = profile?.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>My Profile & Settings</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Manage your personal details and account credentials
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div className="avatar-circle" style={{ width: '64px', height: '64px', fontSize: '1.6rem' }}>
            {initial}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {profile?.name}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              ✉️ {profile?.email}
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', marginTop: '4px' }}>
              Member since: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Mini stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#2563eb' }}>
              {profile?.stats?.totalApplications || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Applications</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#d97706' }}>
              {profile?.stats?.totalInterviews || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Interviews</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#16a34a' }}>
              {profile?.stats?.totalOffers || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Offers</div>
          </div>
          <div style={{ textAlign: 'center', background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#dc2626' }}>
              {profile?.stats?.totalRejected || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rejections</div>
          </div>
        </div>
      </div>

      {/* Edit Name Section */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>Update Personal Information</h3>

        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}
        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleUpdateName}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={profile?.email || ''}
              disabled
              style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
            />
            <div className="form-help">Email cannot be modified as it acts as your primary account identifier</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? 'Updating...' : 'Save Name'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Section */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '14px' }}>Change Account Password</h3>

        {passwordSuccess && <Alert type="success" message={passwordSuccess} onClose={() => setPasswordSuccess('')} />}
        {passwordError && <Alert type="danger" message={passwordError} onClose={() => setPasswordError('')} />}

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label" htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingPassword}>
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
