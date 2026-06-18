import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { ClipboardList, HeartPulse, Stethoscope, Activity } from 'lucide-react';

const Login = () => {
  const { login } = useHospital();
  const [selectedRole, setSelectedRole] = useState('reception');
  const [username, setUsername] = useState('receptionist');
  const [password, setPassword] = useState('••••••••');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (role === 'reception') {
      setUsername('receptionist');
    } else if (role === 'nurse') {
      setUsername('nurse_sara');
    } else if (role === 'doctor') {
      setUsername('dr_house');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, selectedRole);
  };

  return (
    <div style={styles.loginContainer}>
      <div style={styles.loginBox} className="glass-card">
        {/* Brand Header */}
        <div style={styles.brandContainer}>
          <div style={styles.logoCircle}>
            <Activity size={28} color="#4f6ef2" />
          </div>
          <div>
            <h1 style={styles.brandTitle}>LIFELINE</h1>
            <p style={styles.brandSubtitle}>HOSPITAL SYSTEM</p>
          </div>
        </div>

        <h2 style={styles.welcomeText}>System Access Portal</h2>
        <p style={styles.tagline}>Select your operational department to sign in.</p>

        {/* Role Cards */}
        <div style={styles.roleGrid}>
          <div 
            onClick={() => handleRoleSelect('reception')}
            style={{
              ...styles.roleCard, 
              ...(selectedRole === 'reception' ? styles.activeRoleReception : {})
            }}
          >
            <ClipboardList size={28} color={selectedRole === 'reception' ? '#3b82f6' : '#94a3b8'} />
            <div style={styles.roleCardTitle}>Reception</div>
            <div style={styles.roleCardDesc}>Admissions & beds</div>
          </div>

          <div 
            onClick={() => handleRoleSelect('nurse')}
            style={{
              ...styles.roleCard, 
              ...(selectedRole === 'nurse' ? styles.activeRoleNurse : {})
            }}
          >
            <HeartPulse size={28} color={selectedRole === 'nurse' ? '#f59e0b' : '#94a3b8'} />
            <div style={styles.roleCardTitle}>Nurse</div>
            <div style={styles.roleCardDesc}>Vitals & care plans</div>
          </div>

          <div 
            onClick={() => handleRoleSelect('doctor')}
            style={{
              ...styles.roleCard, 
              ...(selectedRole === 'doctor' ? styles.activeRoleDoctor : {})
            }}
          >
            <Stethoscope size={28} color={selectedRole === 'doctor' ? '#ef4444' : '#94a3b8'} />
            <div style={styles.roleCardTitle}>Doctor</div>
            <div style={styles.roleCardDesc}>Diagnostics & Rx</div>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ marginBottom: 16 }}>
            <label className="label">Operator ID / Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label className="label">Security Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
            Authorize Sign In
          </button>
        </form>

        <div style={styles.footerText}>
          Authorized access only. All actions are logged and audited.
        </div>
      </div>
    </div>
  );
};

const styles = {
  loginContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '24px',
  },
  loginBox: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px 32px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  logoCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    background: 'rgba(79, 110, 242, 0.15)',
    border: '1px solid rgba(79, 110, 242, 0.3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 0 15px rgba(79, 110, 242, 0.2)',
  },
  brandTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    letterSpacing: '2px',
    color: '#fff',
    lineHeight: 1.1,
  },
  brandSubtitle: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#4f6ef2',
    letterSpacing: '3px',
  },
  welcomeText: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '6px',
  },
  tagline: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    marginBottom: '28px',
  },
  roleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
    marginBottom: '28px',
  },
  roleCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
  },
  roleCardTitle: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginTop: '10px',
  },
  roleCardDesc: {
    fontSize: '0.65rem',
    color: '#64748b',
    marginTop: '2px',
  },
  activeRoleReception: {
    border: '1px solid rgba(59, 130, 246, 0.6)',
    background: 'rgba(59, 130, 246, 0.08)',
    boxShadow: '0 0 15px rgba(59, 130, 246, 0.15)',
  },
  activeRoleNurse: {
    border: '1px solid rgba(245, 158, 11, 0.6)',
    background: 'rgba(245, 158, 11, 0.08)',
    boxShadow: '0 0 15px rgba(245, 158, 11, 0.15)',
  },
  activeRoleDoctor: {
    border: '1px solid rgba(239, 68, 68, 0.6)',
    background: 'rgba(239, 68, 68, 0.08)',
    boxShadow: '0 0 15px rgba(239, 68, 68, 0.15)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '0.95rem',
    marginTop: '8px',
  },
  footerText: {
    fontSize: '0.7rem',
    color: '#64748b',
    textAlign: 'center',
    marginTop: '24px',
  }
};

export default Login;
