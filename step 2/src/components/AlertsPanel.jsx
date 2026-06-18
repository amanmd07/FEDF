import React from 'react';
import { useHospital } from '../context/HospitalContext';
import { Bell, X, AlertTriangle, AlertCircle, Info, CheckCircle2, Trash2 } from 'lucide-react';

const AlertsPanel = () => {
  const { alerts, dismissAlert, clearAllAlerts } = useHospital();

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <AlertCircle size={18} color="var(--color-critical)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--color-cleaning)" />;
      case 'success':
        return <CheckCircle2 size={18} color="var(--color-vacant)" />;
      default:
        return <Info size={18} color="var(--color-occupied)" />;
    }
  };

  const getAlertStyle = (alert) => {
    if (!alert.unread) {
      return {
        ...styles.alertCard,
        opacity: 0.6,
      };
    }

    switch (alert.type) {
      case 'danger':
        return {
          ...styles.alertCard,
          borderLeft: '4px solid var(--color-critical)',
          background: 'rgba(239, 68, 68, 0.06)',
          boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)',
        };
      case 'warning':
        return {
          ...styles.alertCard,
          borderLeft: '4px solid var(--color-cleaning)',
          background: 'rgba(245, 158, 11, 0.05)',
        };
      case 'success':
        return {
          ...styles.alertCard,
          borderLeft: '4px solid var(--color-vacant)',
          background: 'rgba(16, 185, 129, 0.05)',
        };
      default:
        return {
          ...styles.alertCard,
          borderLeft: '4px solid var(--color-occupied)',
          background: 'rgba(59, 130, 246, 0.05)',
        };
    }
  };

  return (
    <aside style={styles.sidebar} className="glass-card">
      <div style={styles.header}>
        <div style={styles.titleGroup}>
          <Bell size={20} color="#4f6ef2" />
          <h2 style={styles.title}>Real-Time Feed</h2>
          {alerts.filter(a => a.unread).length > 0 && (
            <span style={styles.badgeCount}>
              {alerts.filter(a => a.unread).length}
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button onClick={clearAllAlerts} style={styles.clearBtn} title="Clear All Alerts">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div style={styles.alertList}>
        {alerts.length === 0 ? (
          <div style={styles.emptyState}>
            <Bell size={32} color="#64748b" style={{ marginBottom: 12, opacity: 0.5 }} />
            <div style={styles.emptyText}>No active alerts</div>
            <div style={styles.emptySubtext}>System running stable. Telemetry signals clear.</div>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} style={getAlertStyle(alert)}>
              <div style={styles.alertHeader}>
                <div style={styles.iconAndTitle}>
                  {getAlertIcon(alert.type)}
                  <span style={styles.alertTime}>{alert.timestamp}</span>
                </div>
                {alert.unread && (
                  <button 
                    onClick={() => dismissAlert(alert.id)} 
                    style={styles.dismissBtn}
                    title="Mark as Read"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <div style={styles.alertMessage}>{alert.message}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '340px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 'calc(100vh - 120px)',
    padding: '20px',
    background: 'rgba(15, 21, 38, 0.7)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  title: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#fff',
  },
  badgeCount: {
    background: 'var(--color-critical)',
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '8px',
  },
  clearBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  alertCard: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(255, 255, 255, 0.01)',
    transition: 'all 0.2s ease',
  },
  alertHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  iconAndTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  alertTime: {
    fontSize: '0.7rem',
    color: '#64748b',
    fontWeight: '500',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  alertMessage: {
    fontSize: '0.8rem',
    color: '#f8fafc',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
    flex: 1,
  },
  emptyText: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptySubtext: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '4px',
    lineHeight: '1.4',
  }
};

export default AlertsPanel;
