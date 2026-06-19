import './Header.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>The Fourth Lobby is a independent project, based in covilhã. They are bringing the dark, fast and heavy techno to the underground scene. </p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/tickets">Tickets</a></li>
            <li><a href="/#events">Events</a></li>
            <li><a href="/#contact">Contact</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: fourth@dimensionevents.pt</p>
          <p>Phone: +351 925 361 469</p>
          <p>Location: Covilhã, Portugal</p>
        </div>

        <div className="footer-section">
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="Facebook">Facebook</a>
            <a href="#" aria-label="Twitter">Twitter</a>
            <a href="#" aria-label="YouTube">YouTube</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} The Fourth Lobby - Fourth Dimension. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#cookies">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
