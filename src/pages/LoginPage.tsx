import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserRole } from '../store/authStore';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(formData.email, formData.password);
      } else {
        await authService.register(formData.email, formData.password, formData.fullName, selectedRole);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>The Fourth Lobby</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-tabs">
              <button
                type="button"
                className={`tab ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`tab ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

            {error && <div className="error-message" style={{ color: '#ff0055', marginBottom: '1rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(255, 0, 85, 0.1)', border: '1px solid #ff0055' }}>{error}</div>}

            <fieldset>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="role">Account Type</label>
                    <select
                      id="role"
                      value={selectedRole || ''}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      disabled={loading}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        background: 'rgba(0, 0, 0, 0.5)',
                        color: '#00d4ff',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}
                    >
                      <option value="customer">Customer</option>
                      <option value="promoter">Promoter (RP)</option>
                      <option value="organizer">Organizer</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </fieldset>

            {isLogin && (
              <label className="checkbox">
                <input type="checkbox" disabled={loading} />
                <span>Remember me</span>
              </label>
            )}

            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          {isLogin && (
            <p className="forgot-password">
              <a href="#forgot">Forgot your password?</a>
            </p>
          )}

          <div className="divider">OR</div>

          <div className="social-login">
            <button type="button" className="social-btn" disabled={loading}>
              <span>Continue with Google</span>
            </button>
            <button type="button" className="social-btn" disabled={loading}>
              <span>Continue with Discord</span>
            </button>
          </div>

          <p className="login-note">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="toggle-link"
              disabled={loading}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>

        <div className="login-info">
          <div className="info-card">
            <h3>🎵 Experience Techno</h3>
            <p>Discover the hardest beats and darkest nights with The Fourth Lobby</p>
          </div>
          <div className="info-card">
            <h3>🎫 Easy Ticketing</h3>
            <p>Purchase tickets securely and manage your events in one place</p>
          </div>
          <div className="info-card">
            <h3>👥 Community</h3>
            <p>Join thousands of techno enthusiasts from around the world</p>
          </div>
        </div>
      </div>
    </div>
  );
}
