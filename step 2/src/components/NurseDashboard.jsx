import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { HeartPulse, CheckSquare, Square, Plus, Thermometer, Droplet, Clock, Activity, Edit2 } from 'lucide-react';

const NurseDashboard = () => {
  const { 
    beds, 
    patients, 
    nurseTasks, 
    toggleTask, 
    addNurseTask, 
    updateVitals, 
    updateBedStatus 
  } = useHospital();

  const [activeTab, setActiveTab] = useState('vitals'); // 'vitals', 'sanitation', 'tasks'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Vitals form state
  const [vitalsForm, setVitalsForm] = useState({
    heartRate: '',
    bpSystolic: '',
    bpDiastolic: '',
    spo2: '',
    temperature: ''
  });

  // Task form state
  const [taskForm, setTaskForm] = useState({
    bedId: '',
    task: '',
    time: ''
  });

  const handleEditVitalsClick = (patient) => {
    setSelectedPatient(patient);
    setVitalsForm({
      heartRate: patient.vitals.heartRate.toString(),
      bpSystolic: patient.vitals.bpSystolic.toString(),
      bpDiastolic: patient.vitals.bpDiastolic.toString(),
      spo2: patient.vitals.spo2.toString(),
      temperature: patient.vitals.temperature.toString()
    });
    setShowVitalsModal(true);
  };

  const handleVitalsSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    updateVitals(selectedPatient.id, {
      heartRate: parseInt(vitalsForm.heartRate),
      bpSystolic: parseInt(vitalsForm.bpSystolic),
      bpDiastolic: parseInt(vitalsForm.bpDiastolic),
      spo2: parseInt(vitalsForm.spo2),
      temperature: parseFloat(vitalsForm.temperature)
    });
    setShowVitalsModal(false);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const bed = beds.find(b => b.id === taskForm.bedId);
    const patientName = bed?.patientId 
      ? patients.find(p => p.id === bed.patientId)?.name || 'Unknown' 
      : 'N/A';
    
    addNurseTask({
      bedId: taskForm.bedId,
      patientName,
      task: taskForm.task,
      time: taskForm.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setTaskForm({ bedId: '', task: '', time: '' });
    setShowTaskModal(false);
  };

  const activePatients = patients.filter(p => p.bedId !== null);
  const emptyBeds = beds.filter(b => b.status !== 'occupied');

  const getSpO2Color = (val) => {
    if (val < 90) return 'vital-status-danger';
    if (val < 95) return 'vital-status-warning';
    return 'vital-status-good';
  };

  const getHRColor = (val) => {
    if (val < 50 || val > 120) return 'vital-status-danger';
    if (val < 60 || val > 100) return 'vital-status-warning';
    return 'vital-status-good';
  };

  const getTempColor = (val) => {
    if (val > 38.5) return 'vital-status-danger';
    if (val > 37.5) return 'vital-status-warning';
    return 'vital-status-good';
  };

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>Nursing Operations & Vitals Logs</h2>
        <p style={styles.pageSubtitle}>Monitor telemetry signals, log patient charts, and manage ward cleanliness.</p>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabsContainer}>
        <button 
          onClick={() => setActiveTab('vitals')}
          style={{ ...styles.tab, ...(activeTab === 'vitals' ? styles.activeTab : {}) }}
        >
          <Activity size={16} /> Patient Vitals Telemetry
        </button>
        <button 
          onClick={() => setActiveTab('sanitation')}
          style={{ ...styles.tab, ...(activeTab === 'sanitation' ? styles.activeTab : {}) }}
        >
          <Droplet size={16} /> Bed Sanitization Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('tasks')}
          style={{ ...styles.tab, ...(activeTab === 'tasks' ? styles.activeTab : {}) }}
        >
          <CheckSquare size={16} /> Care Task Board ({nurseTasks.filter(t => !t.completed).length})
        </button>
      </div>

      {/* TAB 1: Patient Vitals */}
      {activeTab === 'vitals' && (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={styles.tableHeader}>
            <div style={styles.tableTitle}>Active Patients Vitals (Live telemetry)</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Bed</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Heart Rate</th>
                  <th style={styles.th}>Blood Pressure</th>
                  <th style={styles.th}>SpO2</th>
                  <th style={styles.th}>Temperature</th>
                  <th style={styles.th}>Severity</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activePatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={styles.emptyTable}>No patients currently admitted.</td>
                  </tr>
                ) : (
                  activePatients.map(patient => {
                    const bed = beds.find(b => b.id === patient.bedId);
                    return (
                      <tr key={patient.id} style={styles.tr}>
                        <td style={{ ...styles.td, fontWeight: 'bold', color: '#fff' }}>{bed?.name || 'Unk'}</td>
                        <td style={styles.td}>
                          <div style={{ fontWeight: '700' }}>{patient.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{patient.age} yrs • {patient.gender}</div>
                        </td>
                        <td style={styles.td}>
                          <span className={getHRColor(patient.vitals.heartRate)} style={{ fontWeight: 'bold' }}>
                            {patient.vitals.heartRate} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>BPM</span>
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ fontWeight: 'bold' }}>
                            {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic} <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#64748b' }}>mmHg</span>
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span className={getSpO2Color(patient.vitals.spo2)} style={{ fontWeight: 'bold' }}>
                            {patient.vitals.spo2}%
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span className={getTempColor(patient.vitals.temperature)} style={{ fontWeight: 'bold' }}>
                            {patient.vitals.temperature}°C
                          </span>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${patient.severity === 'Critical' ? 'badge-critical' : patient.severity === 'Moderate' ? 'badge-cleaning' : 'badge-vacant'}`}>
                            {patient.severity}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button 
                            onClick={() => handleEditVitalsClick(patient)}
                            className="btn btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          >
                            <Edit2 size={12} /> Log Vitals
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Bed Sanitation */}
      {activeTab === 'sanitation' && (
        <div style={styles.sanitationGrid}>
          {emptyBeds.length === 0 ? (
            <div style={styles.emptyGrid} className="glass-card">All beds are currently occupied by patients.</div>
          ) : (
            emptyBeds.map(bed => (
              <div key={bed.id} className="glass-card" style={styles.sanitationCard}>
                <div style={styles.sanitationHeader}>
                  <h4 style={{ fontWeight: 'bold', color: '#fff' }}>{bed.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{bed.ward}</span>
                </div>
                
                <div style={styles.currentStatusSection}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Current State:</div>
                  <span className={`badge ${
                    bed.status === 'vacant' ? 'badge-vacant' : bed.status === 'cleaning' ? 'badge-cleaning' : 'badge-maintenance'
                  }`} style={{ marginTop: 4 }}>
                    {bed.status}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 16 }}>
                  <label className="label">Update Operational State</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button 
                      onClick={() => updateBedStatus(bed.id, 'vacant')}
                      className={`btn ${bed.status === 'vacant' ? 'btn-success' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem' }}
                    >
                      Vacant
                    </button>
                    <button 
                      onClick={() => updateBedStatus(bed.id, 'cleaning')}
                      className={`btn ${bed.status === 'cleaning' ? 'btn-warning' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem' }}
                    >
                      Cleaning
                    </button>
                    <button 
                      onClick={() => updateBedStatus(bed.id, 'maintenance')}
                      className={`btn ${bed.status === 'maintenance' ? 'btn-secondary' : 'btn-secondary'}`}
                      style={{ flex: 1, padding: '8px 4px', fontSize: '0.75rem', background: bed.status === 'maintenance' ? '#4b5563' : undefined }}
                    >
                      Repair
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Nurse Task Board */}
      {activeTab === 'tasks' && (
        <div style={styles.tasksContainer}>
          <div style={styles.tasksHeader}>
            <h3 style={{ fontSize: '1.05rem', color: '#fff', fontWeight: 700 }}>Care Checklist</h3>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="btn btn-primary"
              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
            >
              <Plus size={14} /> Add Checklist Task
            </button>
          </div>

          <div style={styles.taskList}>
            {nurseTasks.length === 0 ? (
              <div style={styles.emptyGrid} className="glass-card">No tasks scheduled for today.</div>
            ) : (
              nurseTasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  style={{
                    ...styles.taskCard,
                    opacity: task.completed ? 0.6 : 1,
                    textDecoration: task.completed ? 'line-through' : 'none'
                  }}
                  className="glass-card"
                >
                  <div style={styles.taskToggle}>
                    {task.completed ? (
                      <CheckSquare size={20} color="var(--color-vacant)" />
                    ) : (
                      <Square size={20} color="#64748b" />
                    )}
                    <div>
                      <div style={{ ...styles.taskDesc, color: task.completed ? '#64748b' : '#fff' }}>{task.task}</div>
                      <div style={styles.taskMeta}>
                        Patient: <strong>{task.patientName}</strong> • Bed ID: {task.bedId}
                      </div>
                    </div>
                  </div>
                  <div style={styles.taskTime}>
                    <Clock size={12} color="#64748b" style={{ marginRight: 4 }} />
                    {task.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal - LOG VITALS */}
      {showVitalsModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowVitalsModal(false)}>&times;</button>
            <h3 style={styles.modalTitle}>Log Patient Vitals</h3>
            <p style={styles.modalSub}>Patient: <strong>{selectedPatient.name}</strong> (Bed {beds.find(b => b.id === selectedPatient.bedId)?.name})</p>

            <form onSubmit={handleVitalsSubmit} style={styles.modalForm}>
              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label className="label">Heart Rate (BPM)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={vitalsForm.heartRate}
                    onChange={(e) => setVitalsForm({...vitalsForm, heartRate: e.target.value})}
                    min="30" max="220" required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Oxygen (SpO2 %)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={vitalsForm.spo2}
                    onChange={(e) => setVitalsForm({...vitalsForm, spo2: e.target.value})}
                    min="50" max="100" required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label className="label">Blood Pressure (Systolic)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="120"
                    value={vitalsForm.bpSystolic}
                    onChange={(e) => setVitalsForm({...vitalsForm, bpSystolic: e.target.value})}
                    min="50" max="250" required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Blood Pressure (Diastolic)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="80"
                    value={vitalsForm.bpDiastolic}
                    onChange={(e) => setVitalsForm({...vitalsForm, bpDiastolic: e.target.value})}
                    min="30" max="150" required
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Body Temperature (°C)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="input-field" 
                  value={vitalsForm.temperature}
                  onChange={(e) => setVitalsForm({...vitalsForm, temperature: e.target.value})}
                  min="32" max="43" required
                />
              </div>

              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowVitalsModal(false)}
                >
                  Discard
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Clinical Records
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - ADD TASK */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowTaskModal(false)}>&times;</button>
            <h3 style={styles.modalTitle}>Schedule Care Task</h3>
            <p style={styles.modalSub}>Schedule an actionable checkpoint for nursing rounds.</p>

            <form onSubmit={handleTaskSubmit} style={styles.modalForm}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Assign to Bed</label>
                <select 
                  className="input-field" 
                  value={taskForm.bedId}
                  onChange={(e) => setTaskForm({...taskForm, bedId: e.target.value})}
                  required
                >
                  <option value="">Select Bed Location...</option>
                  {beds.map(bed => (
                    <option key={bed.id} value={bed.id}>
                      {bed.name} ({bed.status === 'occupied' ? 'Occupied' : 'Vacant'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Task Description</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Confirm surgical dressing remains intact"
                  value={taskForm.task}
                  onChange={(e) => setTaskForm({...taskForm, task: e.target.value})}
                  required
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Scheduled Time (HH:MM)</label>
                <input 
                  type="time" 
                  className="input-field" 
                  value={taskForm.time}
                  onChange={(e) => setTaskForm({...taskForm, time: e.target.value})}
                />
              </div>

              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowTaskModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Append Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
  },
  pageTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  tabsContainer: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '8px',
  },
  tab: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    padding: '8px 16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    background: 'rgba(255, 255, 255, 0.04)',
    color: '#fff',
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
  },
  tableHeader: {
    padding: '16px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  tableTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  thRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  th: {
    padding: '12px 24px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '16px 24px',
    fontSize: '0.85rem',
    color: '#cbd5e1',
  },
  emptyTable: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
  },
  sanitationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  sanitationCard: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    background: 'rgba(15, 21, 38, 0.5)',
    minHeight: '160px',
  },
  sanitationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  currentStatusSection: {
    marginTop: '12px',
  },
  tasksContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tasksHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'rgba(15, 21, 38, 0.5)',
    padding: '16px 20px',
    cursor: 'pointer',
    borderLeft: '4px solid transparent',
  },
  taskToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  taskDesc: {
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '2px',
  },
  taskTime: {
    fontSize: '0.75rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
  },
  modalSub: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    marginBottom: '20px',
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  emptyGrid: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    fontSize: '0.9rem',
  }
};

export default NurseDashboard;
