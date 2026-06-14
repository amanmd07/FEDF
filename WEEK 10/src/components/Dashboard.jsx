import { Link, useNavigate } from "react-router-dom";

function Dashboard({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="page-wrapper dashboard-wrapper">
      <div className="glass-panel dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-title-area">
            <h2>Librarian Control Center</h2>
            <p>System Hub & Library Inventory Operations</p>
          </div>
          <div className="status-badge">
            <span className="status-dot"></span>
            Server: Connected
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-val">03</div>
            <div className="stat-label">Total Titles</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">100%</div>
            <div className="stat-label">DB Integrity</div>
          </div>
          <div className="stat-item">
            <div className="stat-val">Secured</div>
            <div className="stat-label">Security Protocol</div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="menu-grid">
          <Link to="/deletebook" className="menu-card">
            <div className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </div>
            <div>
              <h3 className="menu-title">Deaccession Inventory</h3>
              <p className="menu-desc">Permanently remove records and books from the active collection registry.</p>
            </div>
          </Link>

          <div className="menu-card disabled-card" onClick={(e) => e.preventDefault()}>
            <div className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </div>
            <div>
              <h3 className="menu-title">Catalog Editor</h3>
              <p className="menu-desc">Create or update metadata, author profiles, and Dewey classification tags.</p>
            </div>
          </div>

          <div className="menu-card disabled-card" onClick={(e) => e.preventDefault()}>
            <div className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <h3 className="menu-title">Patron Hub</h3>
              <p className="menu-desc">Manage student profiles, circulation clearance, outstanding fees, and loans.</p>
            </div>
          </div>

          <div className="menu-card disabled-card" onClick={(e) => e.preventDefault()}>
            <div className="menu-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>
            <div>
              <h3 className="menu-title">Terminal Settings</h3>
              <p className="menu-desc">Adjust server endpoints, auto-backup options, and administrator credentials.</p>
            </div>
          </div>
        </div>

        <div className="dashboard-footer">
          <button onClick={handleLogout} className="btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            De-authenticate Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
