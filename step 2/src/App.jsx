import React from 'react';
import { useHospital } from './context/HospitalContext';
import Login from './components/Login';
import Header from './components/Header';
import ReceptionDashboard from './components/ReceptionDashboard';
import NurseDashboard from './components/NurseDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AlertsPanel from './components/AlertsPanel';

function App() {
  const { user } = useHospital();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Header />
      
      <main className="dashboard-main">
        <div className="dashboard-content">
          {user.role === 'reception' && <ReceptionDashboard />}
          {user.role === 'nurse' && <NurseDashboard />}
          {user.role === 'doctor' && <DoctorDashboard />}
        </div>
        
        <AlertsPanel />
      </main>
    </div>
  );
}

export default App;
