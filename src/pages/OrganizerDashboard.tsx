import './OrganizerDashboard.css';

export default function OrganizerDashboard() {
  const stats = {
    totalEvents: 18,
    ticketsSold: 8920,
    revenue: 89200,
    capacity: 94
  };

  return (
    <div className="container dashboard">
      <h1>Organizer Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎪</div>
          <div className="stat-content">
            <p className="stat-label">Total Events</p>
            <p className="stat-value">{stats.totalEvents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <p className="stat-label">Tickets Sold</p>
            <p className="stat-value">{stats.ticketsSold}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">€{stats.revenue}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Capacity Used</p>
            <p className="stat-value">{stats.capacity}%</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Platform Statistics</h2>
        <div className="stats-details">
          <div className="detail-item">
            <span>Average Event Attendance:</span>
            <span>495 people</span>
          </div>
          <div className="detail-item">
            <span>Most Popular Genre:</span>
            <span>HardTechno</span>
          </div>
          <div className="detail-item">
            <span>Total Platform Users:</span>
            <span>1,250+</span>
          </div>
          <div className="detail-item">
            <span>Events This Month:</span>
            <span>6</span>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Recent Events</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Organizer</th>
              <th>Date</th>
              <th>Capacity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DIMENSION IV: The Awakening</td>
              <td>The Fourth Lobby</td>
              <td>Apr 15, 2026</td>
              <td>1,000</td>
              <td><span className="badge upcoming">Upcoming</span></td>
            </tr>
            <tr>
              <td>Techno Nights Vol. 3</td>
              <td>Porto Beats</td>
              <td>Apr 22, 2026</td>
              <td>800</td>
              <td><span className="badge upcoming">Upcoming</span></td>
            </tr>
            <tr>
              <td>Underground Sessions</td>
              <td>The Fourth Lobby</td>
              <td>Mar 30, 2026</td>
              <td>500</td>
              <td><span className="badge finished">Finished</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
