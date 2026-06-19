import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import logoIcon from '@img/fourthdimension_logo.png';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let loggedUser;
      if (isLogin) {
        loggedUser = await authService.login(formData.email, formData.password);
      } else {
        // O role é sempre 'customer' no registo público
        const role = 'customer';
        const data = await authService.register(formData.email, formData.password, formData.fullName, role);
        loggedUser = data.user;
      }
      
      // Atualiza o estado global no Zustand
      setUser(loggedUser);
      
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError(null);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <img src={logoIcon} alt="The Fourth Lobby" className="login-logo" />
          <p className="login-subtitle">The Fourth Lobby</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-tabs">
              <button
                type="button"
                className={`tab ${isLogin ? 'active' : ''}`}
                onClick={() => handleTabSwitch(true)}
              >
                Login
              </button>
              <button
                type="button"
                className={`tab ${!isLogin ? 'active' : ''}`}
                onClick={() => handleTabSwitch(false)}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}



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

          {/* Links discretos abaixo do botão principal */}
          <div className="auth-links">
            {isLogin && (
              <p className="forgot-password">
                <a href="#forgot">Forgot your password?</a>
              </p>
            )}


          </div>

          <p className="login-note">
            {isLogin
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              type="button"
              onClick={() => handleTabSwitch(!isLogin)}
              className="toggle-link"
              disabled={loading}
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
