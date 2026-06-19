import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, role, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="container">
        <p>Please login first</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-info">
          <h1>{user.fullName || user.email}</h1>
          <p className="role-badge">{(role || 'customer').toUpperCase()}</p>
          <p className="email">{user.email}</p>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Settings
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Purchase History
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Security
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <form className="profile-form">
            <fieldset>
              <legend>Personal Information</legend>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue={user.fullName || ''} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue={user.email || ''} disabled />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea placeholder="Tell us about yourself"></textarea>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" placeholder="+351 XXX XXX XXX" />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </fieldset>
          </form>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <h2>Purchase History</h2>
            <p>You haven't made any purchases yet.</p>
          </div>
        )}

        {activeTab === 'security' && (
          <form className="profile-form">
            <fieldset>
              <legend>Security Settings</legend>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" />
              </div>
              <button type="submit" className="btn-primary">Change Password</button>
            </fieldset>
            <button type="button" onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
