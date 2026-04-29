import './PromoterDashboard.css';

export default function PromoterDashboard() {
  const stats = {
    activeEvents: 5,
    totalSales: 2340,
    revenue: 11700,
    occupancy: 88
  };

  return (
    <div className="container dashboard">
      <div className="dashboard-header">
        <h1>Promoter Dashboard</h1>
        <button className="btn-primary">Create Event</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <p className="stat-label">Active Events</p>
            <p className="stat-value">{stats.activeEvents}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <p className="stat-label">Tickets Sold</p>
            <p className="stat-value">{stats.totalSales}</p>
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
            <p className="stat-label">Avg Occupancy</p>
            <p className="stat-value">{stats.occupancy}%</p>
          </div>
        </div>
      </div>

      <section className="dashboard-section">
        <h2>Your Events</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Tickets</th>
              <th>Revenue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>DIMENSION IV: The Awakening</td>
              <td>Apr 15, 2026</td>
              <td>892</td>
              <td>€8,470</td>
              <td><span className="badge upcoming">Upcoming</span></td>
            </tr>
            <tr>
              <td>Techno Nights Vol. 3</td>
              <td>Apr 22, 2026</td>
              <td>645</td>
              <td>€6,122</td>
              <td><span className="badge upcoming">Upcoming</span></td>
            </tr>
            <tr>
              <td>Underground Sessions</td>
              <td>Mar 30, 2026</td>
              <td>803</td>
              <td>€7,630</td>
              <td><span className="badge finished">Finished</span></td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
