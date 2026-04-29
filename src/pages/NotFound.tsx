import { useNavigate } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1 className="error-code">404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>

        <div className="not-found-illustration">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="2"/>
            <circle cx="75" cy="85" r="8" fill="currentColor"/>
            <circle cx="125" cy="85" r="8" fill="currentColor"/>
            <path d="M75 130 Q100 145 125 130" stroke="currentColor" strokeWidth="3" fill="none"/>
          </svg>
        </div>

        <div className="actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back Home
          </button>
          <button onClick={() => navigate(-1)} className="btn-secondary">
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
