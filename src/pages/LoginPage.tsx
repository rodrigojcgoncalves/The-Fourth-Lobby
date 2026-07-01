import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';
import logoIcon from '@img/fourthdimension_logo.png';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  // Validação de password
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'A password deve ter no mínimo 8 caracteres.';
    if (!/[A-Z]/.test(password)) return 'A password deve conter pelo menos uma letra maiúscula.';
    if (!/[0-9]/.test(password)) return 'A password deve conter pelo menos um número.';
    return null;
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
        // Validar segurança da password antes do registo
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }
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
          <p className="login-subtitle">{t('login.title')}</p>

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
                <label htmlFor="email">{t('login.email')}</label>
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
                <label htmlFor="password">{t('login.password')}</label>
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
                {!isLogin && formData.password.length > 0 && (
                  <div className="password-requirements">
                    <p style={{ color: formData.password.length >= 8 ? '#4ade80' : '#ff6b6b', fontSize: '0.8rem', margin: '0.25rem 0' }}>
                      {formData.password.length >= 8 ? '✓' : '✗'} Mínimo 8 caracteres
                    </p>
                    <p style={{ color: /[A-Z]/.test(formData.password) ? '#4ade80' : '#ff6b6b', fontSize: '0.8rem', margin: '0.25rem 0' }}>
                      {/[A-Z]/.test(formData.password) ? '✓' : '✗'} Pelo menos uma maiúscula
                    </p>
                    <p style={{ color: /[0-9]/.test(formData.password) ? '#4ade80' : '#ff6b6b', fontSize: '0.8rem', margin: '0.25rem 0' }}>
                      {/[0-9]/.test(formData.password) ? '✓' : '✗'} Pelo menos um número
                    </p>
                  </div>
                )}
              </div>
            </fieldset>

            {isLogin && (
              <label className="checkbox">
                <input type="checkbox" disabled={loading} />
                <span>Remember me</span>
              </label>
            )}

            <button type="submit" className="btn-primary btn-large" disabled={loading}>
              {loading ? t('login.logging_in') : (isLogin ? t('login.btn_login') : 'Register')}
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
