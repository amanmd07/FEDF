import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { LogOut, Clock, Activity, User, Bed } from 'lucide-react';

const Header = () => {
  const { user, logout, beds, patients } = useHospital();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute live statistics
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'occupied').length;
  const vacantBeds = beds.filter(b => b.status === 'vacant').length;
  const cleaningBeds = beds.filter(b => b.status === 'cleaning').length;
  const criticalPatients = patients.filter(p => p.severity === 'Critical').length;

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'reception': return 'badge-occupied';
      case 'nurse': return 'badge-cleaning';
      case 'doctor': return 'badge-critical';
      default: return 'badge-maintenance';
    }
  };

  const getHeaderThemeClass = (role) => {
    switch (role) {
      case 'reception': return 'glow-border-reception';
      case 'nurse': return 'glow-border-nurse';
      case 'doctor': return 'glow-border-doctor';
      default: return '';
    }
  };

  return (
    <header style={styles.header} className={`glass-card ${getHeaderThemeClass(user?.role)}`}>
      {/* Brand Logo & Clock */}
      <div style={styles.brandSection}>
        <div style={styles.logoContainer}>
          <Activity size={24} color="#4f6ef2" />
        </div>
        <div>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>LIFELINE</h1>
            <span style={styles.systemBadge}>LIVE telemetries</span>
          </div>
          <div style={styles.timeContainer}>
            <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
            <span style={styles.timeText}>
              {time.toLocaleDateString()} {time.toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Live System Stats */}
      <div style={styles.statsContainer}>
        <div style={styles.statItem}>
          <Bed size={16} color="#64748b" />
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Total Beds</div>
            <div style={styles.statValue}>{totalBeds}</div>
          </div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={{ ...styles.statusDot, backgroundColor: 'var(--color-occupied)' }} />
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Occupied</div>
            <div style={styles.statValue}>{occupiedBeds}</div>
          </div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={{ ...styles.statusDot, backgroundColor: 'var(--color-vacant)' }} />
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Vacant</div>
            <div style={styles.statValue}>{vacantBeds}</div>
          </div>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={{ ...styles.statusDot, backgroundColor: 'var(--color-cleaning)' }} />
          <div style={styles.statInfo}>
            <div style={styles.statLabel}>Cleaning</div>
            <div style={styles.statValue}>{cleaningBeds}</div>
          </div>
        </div>
        {criticalPatients > 0 && (
          <>
            <div style={styles.statDivider} />
            <div style={{ ...styles.statItem, animation: 'pulse-glow 2s infinite', padding: '4px 8px', borderRadius: '8px' }}>
              <span style={{ ...styles.statusDot, backgroundColor: 'var(--color-critical)' }} />
              <div style={styles.statInfo}>
                <div style={{ ...styles.statLabel, color: 'var(--color-critical)', fontWeight: 'bold' }}>Critical Patients</div>
                <div style={{ ...styles.statValue, color: 'var(--color-critical)' }}>{criticalPatients}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* User Session & Logout */}
      <div style={styles.userSection}>
        <div style={styles.userInfo}>
          <div style={styles.userName}>
            <User size={14} color="#94a3b8" style={{ marginRight: 6 }} />
            {user?.username}
          </div>
          <span className={`badge ${getRoleBadgeClass(user?.role)}`} style={styles.roleBadge}>
            {user?.role} portal
          </span>
        </div>
        
        <button onClick={logout} className="btn btn-secondary" style={styles.logoutBtn} title="Sign Out">
          <LogOut size={16} />
          <span style={styles.logoutText}>Logout</span>
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 28px',
    borderRadius: '0px 0px 16px 16px',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    width: '100%',
    zIndex: 10,
    background: 'rgba(15, 21, 38, 0.8)',
  },
  brandSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoContainer: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'rgba(79, 110, 242, 0.15)',
    border: '1px solid rgba(79, 110, 242, 0.25)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '800',
    letterSpacing: '1px',
    color: '#fff',
  },
  systemBadge: {
    fontSize: '0.6rem',
    fontWeight: '700',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: 'var(--color-vacant)',
    padding: '2px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  timeContainer: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '2px',
  },
  timeText: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500',
  },
  statsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'rgba(10, 15, 30, 0.4)',
    border: '1px solid var(--border-light)',
    padding: '8px 20px',
    borderRadius: '12px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#f8fafc',
    lineHeight: '1.1',
  },
  statDivider: {
    width: '1px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
  },
  roleBadge: {
    marginTop: '4px',
    letterSpacing: '0.5px',
  },
  logoutBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
  },
  logoutText: {
    fontSize: '0.8rem',
    fontWeight: '600',
  }
};

export default Header;
