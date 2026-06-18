import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Stethoscope, FileText, Pill, Check, AlertTriangle, Send, History, Heart, Activity } from 'lucide-react';

const DoctorDashboard = () => {
  const { 
    beds, 
    patients, 
    addPrescription, 
    addClinicalNote, 
    approveDischarge,
    addSystemAlert
  } = useHospital();

  const activePatients = patients.filter(p => p.bedId !== null);
  const [selectedPatientId, setSelectedPatientId] = useState(activePatients[0]?.id || '');
  
  // Note Form
  const [noteText, setNoteText] = useState('');
  
  // Rx Form
  const [rxForm, setRxForm] = useState({
    medicine: '',
    dosage: '',
    frequency: 'Once Daily'
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedBed = selectedPatient ? beds.find(b => b.id === selectedPatient.bedId) : null;

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !noteText.trim()) return;
    addClinicalNote(selectedPatientId, noteText);
    setNoteText('');
  };

  const handleRxSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatientId || !rxForm.medicine.trim()) return;
    addPrescription(selectedPatientId, rxForm);
    setRxForm({ medicine: '', dosage: '', frequency: 'Once Daily' });
  };

  const handleRequestICU = () => {
    if (!selectedPatient) return;
    const note = `CRITICAL RECOMMENDATION: Attending physician requests urgent transfer to ICU ward due to high risk clinical status.`;
    addClinicalNote(selectedPatient.id, note);
    addSystemAlert(`DOCTOR REQUEST: ICU Transfer requested for patient ${selectedPatient.name} (Bed ${selectedBed?.name}).`, 'warning', selectedPatient.id);
  };

  // Sparkline-like representation helper
  const getVitalStatus = (vitalName, val) => {
    if (vitalName === 'spo2') {
      if (val < 90) return { label: 'CRITICAL', color: 'var(--color-critical)' };
      if (val < 94) return { label: 'BORDERLINE', color: 'var(--color-cleaning)' };
      return { label: 'NORMAL', color: 'var(--color-vacant)' };
    }
    if (vitalName === 'heartRate') {
      if (val < 50 || val > 120) return { label: 'CRITICAL', color: 'var(--color-critical)' };
      if (val < 60 || val > 100) return { label: 'ELEVATED', color: 'var(--color-cleaning)' };
      return { label: 'NORMAL', color: 'var(--color-vacant)' };
    }
    if (vitalName === 'temperature') {
      if (val > 38.5) return { label: 'FEVER', color: 'var(--color-critical)' };
      if (val > 37.3) return { label: 'LOW GRADE', color: 'var(--color-cleaning)' };
      return { label: 'NORMAL', color: 'var(--color-vacant)' };
    }
    return { label: 'STABLE', color: 'var(--color-vacant)' };
  };

  return (
    <div style={styles.container}>
      {/* Title */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>Clinical Rounds & Prescriptions</h2>
        <p style={styles.pageSubtitle}>Review diagnostic records, prescribe medications, and clear patients for discharge.</p>
      </div>

      <div style={styles.mainLayout}>
        {/* Left Sidebar: Patients List */}
        <div className="glass-card" style={styles.patientListPanel}>
          <h3 style={styles.panelTitle}>Admitted Patients</h3>
          <div style={styles.patientGrid}>
            {activePatients.length === 0 ? (
              <div style={styles.emptyPatients}>No patients currently admitted.</div>
            ) : (
              activePatients.map(p => {
                const bed = beds.find(b => b.id === p.bedId);
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPatientId(p.id)}
                    style={{
                      ...styles.patientCard,
                      ...(selectedPatientId === p.id ? styles.activePatientCard : {}),
                      borderLeft: p.severity === 'Critical' ? '4px solid var(--color-critical)' : '4px solid transparent'
                    }}
                  >
                    <div style={styles.patientCardHeader}>
                      <span style={styles.patientName}>{p.name}</span>
                      <span className={`badge ${
                        p.severity === 'Critical' ? 'badge-critical' : p.severity === 'Moderate' ? 'badge-cleaning' : 'badge-vacant'
                      }`} style={{ fontSize: '0.65rem' }}>
                        {p.severity}
                      </span>
                    </div>
                    <div style={styles.patientCardMeta}>
                      Bed: {bed?.name || 'Unk'} • {p.age} yrs • {p.gender}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section: Patient Clinical Detail Chart */}
        <div style={styles.chartPanel}>
          {selectedPatient ? (
            <div style={styles.chartContainer}>
              {/* Header Details */}
              <div className="glass-card" style={styles.patientInfoCard}>
                <div style={styles.patientHeaderRow}>
                  <div>
                    <h3 style={styles.chartPatientName}>{selectedPatient.name}</h3>
                    <p style={styles.chartPatientMeta}>
                      Admitted: {new Date(selectedPatient.admittedAt).toLocaleString()} • Gender: {selectedPatient.gender} • Age: {selectedPatient.age}
                    </p>
                    <p style={styles.chartSymptoms}>
                      <strong>Chief Complaint:</strong> {selectedPatient.symptoms}
                    </p>
                  </div>
                  <div style={styles.locationBadgeContainer}>
                    <div style={styles.locationTitle}>Ward Location</div>
                    <div style={styles.locationValue}>{selectedBed?.name} • {selectedBed?.ward}</div>
                  </div>
                </div>

                {/* Vitals summary cards */}
                <div style={styles.vitalsSummaryGrid}>
                  <div className="vital-card">
                    <span style={styles.vitalLabel}>Heart Rate</span>
                    <span className="vital-value" style={{ color: getVitalStatus('heartRate', selectedPatient.vitals.heartRate).color }}>
                      {selectedPatient.vitals.heartRate} <span className="vital-unit">BPM</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: getVitalStatus('heartRate', selectedPatient.vitals.heartRate).color }}>
                      {getVitalStatus('heartRate', selectedPatient.vitals.heartRate).label}
                    </span>
                  </div>

                  <div className="vital-card">
                    <span style={styles.vitalLabel}>Blood Pressure</span>
                    <span className="vital-value">
                      {selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic} <span className="vital-unit">mmHg</span>
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      STABLE
                    </span>
                  </div>

                  <div className="vital-card">
                    <span style={styles.vitalLabel}>Oxygen (SpO2)</span>
                    <span className="vital-value" style={{ color: getVitalStatus('spo2', selectedPatient.vitals.spo2).color }}>
                      {selectedPatient.vitals.spo2}%
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: getVitalStatus('spo2', selectedPatient.vitals.spo2).color }}>
                      {getVitalStatus('spo2', selectedPatient.vitals.spo2).label}
                    </span>
                  </div>

                  <div className="vital-card">
                    <span style={styles.vitalLabel}>Temperature</span>
                    <span className="vital-value" style={{ color: getVitalStatus('temperature', selectedPatient.vitals.temperature).color }}>
                      {selectedPatient.vitals.temperature}°C
                    </span>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, color: getVitalStatus('temperature', selectedPatient.vitals.temperature).color }}>
                      {getVitalStatus('temperature', selectedPatient.vitals.temperature).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid: Notes on Left, Rx and Actions on Right */}
              <div style={styles.detailsGrid}>
                {/* Clinical Notes Column */}
                <div className="glass-card" style={styles.columnCard}>
                  <div style={styles.columnHeader}>
                    <FileText size={18} color="#4f6ef2" />
                    <h4 style={styles.columnTitle}>Clinical Observations Log</h4>
                  </div>
                  
                  {/* Notes List */}
                  <div style={styles.notesHistory}>
                    {selectedPatient.notes.length === 0 ? (
                      <p style={styles.emptyText}>No notes recorded for this patient.</p>
                    ) : (
                      selectedPatient.notes.map(note => (
                        <div key={note.id} style={styles.noteItem}>
                          <div style={styles.noteMeta}>
                            <strong>{note.author}</strong> • {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </div>
                          <div style={styles.noteText}>{note.text}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Note Form */}
                  <form onSubmit={handleNoteSubmit} style={styles.noteForm}>
                    <textarea 
                      className="input-field" 
                      placeholder="Add patient assessment, telemetry observations, or rounds logs..."
                      rows="2"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      style={{ resize: 'none', fontSize: '0.85rem' }}
                      required
                    />
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '8px', padding: '6px 14px', fontSize: '0.8rem' }}>
                      <Send size={12} /> Log Note
                    </button>
                  </form>
                </div>

                {/* Prescriptions and Actions Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Prescription Card */}
                  <div className="glass-card" style={styles.columnCard}>
                    <div style={styles.columnHeader}>
                      <Pill size={18} color="#f59e0b" />
                      <h4 style={styles.columnTitle}>Prescription Log</h4>
                    </div>

                    {/* Prescription List */}
                    <div style={styles.rxList}>
                      {selectedPatient.prescriptions.length === 0 ? (
                        <p style={styles.emptyText}>No medications prescribed.</p>
                      ) : (
                        selectedPatient.prescriptions.map(rx => (
                          <div key={rx.id} style={styles.rxItem}>
                            <div>
                              <div style={styles.rxMedName}>{rx.medicine}</div>
                              <div style={styles.rxDetails}>{rx.dosage} • {rx.frequency}</div>
                            </div>
                            <div style={styles.rxPrescriber}>By: {rx.prescribedBy.replace('Dr. ', '')}</div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Prescribe Form */}
                    <form onSubmit={handleRxSubmit} style={styles.rxForm}>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="Medicine (e.g. Lipitor)"
                          value={rxForm.medicine}
                          onChange={(e) => setRxForm({...rxForm, medicine: e.target.value})}
                          style={{ flex: 2, fontSize: '0.8rem', padding: '8px 10px' }}
                          required
                        />
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="Dosage (e.g. 10mg)"
                          value={rxForm.dosage}
                          onChange={(e) => setRxForm({...rxForm, dosage: e.target.value})}
                          style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <select 
                          className="input-field"
                          value={rxForm.frequency}
                          onChange={(e) => setRxForm({...rxForm, frequency: e.target.value})}
                          style={{ flex: 2, fontSize: '0.8rem', padding: '8px 10px', ...styles.select }}
                        >
                          <option value="Once Daily">Once Daily</option>
                          <option value="Twice Daily">Twice Daily</option>
                          <option value="Three Times Daily">Three Times Daily</option>
                          <option value="Every 4 Hours">Every 4 Hours</option>
                          <option value="Every 6 Hours">Every 6 Hours</option>
                          <option value="PRN (As Needed)">PRN (As Needed)</option>
                        </select>
                        <button type="submit" className="btn btn-success" style={{ flex: 1, fontSize: '0.8rem', padding: '8px 10px' }}>
                          Add Rx
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Actions Card */}
                  <div className="glass-card" style={styles.columnCard}>
                    <div style={styles.columnHeader}>
                      <Stethoscope size={18} color="#ef4444" />
                      <h4 style={styles.columnTitle}>Clinical Decision Center</h4>
                    </div>

                    <div style={styles.actionCenterButtons}>
                      {/* ICU Transfer Button */}
                      {selectedBed?.ward !== 'ICU' && (
                        <button 
                          onClick={handleRequestICU}
                          className="btn btn-secondary"
                          style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--color-critical)' }}
                        >
                          <AlertTriangle size={16} /> Request ICU Transfer
                        </button>
                      )}

                      {/* Discharge Clearance Section */}
                      {selectedPatient.dischargeApproved ? (
                        <div style={styles.approvedNotice}>
                          <Check size={16} style={{ marginRight: 6 }} />
                          Discharge Clearance Approved
                        </div>
                      ) : (
                        <button 
                          onClick={() => approveDischarge(selectedPatient.id)}
                          className="btn btn-success"
                          style={{ width: '100%' }}
                        >
                          Authorize Discharge Release
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.emptyGrid} className="glass-card">
              Select an admitted patient from the roster to view clinical chart.
            </div>
          )}
        </div>
      </div>
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
  mainLayout: {
    display: 'flex',
    gap: '20px',
    height: 'calc(100vh - 200px)',
    minHeight: '600px',
  },
  patientListPanel: {
    width: '280px',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    background: 'rgba(15, 21, 38, 0.4)',
    overflow: 'hidden',
  },
  panelTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
  },
  patientGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    overflowY: 'auto',
    flex: 1,
    paddingRight: '4px',
  },
  patientCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '12px 14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activePatientCard: {
    background: 'rgba(79, 110, 242, 0.08)',
    borderColor: 'rgba(79, 110, 242, 0.3)',
    boxShadow: '0 0 10px rgba(79, 110, 242, 0.1)',
  },
  patientCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  patientCardMeta: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginTop: '4px',
  },
  emptyPatients: {
    textAlign: 'center',
    padding: '20px',
    color: '#64748b',
    fontSize: '0.85rem',
  },
  chartPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    height: '100%',
    overflowY: 'auto',
    paddingRight: '4px',
  },
  patientInfoCard: {
    background: 'rgba(15, 21, 38, 0.5)',
    padding: '24px',
  },
  patientHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  chartPatientName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
  },
  chartPatientMeta: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  chartSymptoms: {
    fontSize: '0.85rem',
    color: '#cbd5e1',
    marginTop: '10px',
  },
  locationBadgeContainer: {
    textAlign: 'right',
    background: 'rgba(79, 110, 242, 0.08)',
    border: '1px solid rgba(79, 110, 242, 0.2)',
    padding: '8px 16px',
    borderRadius: '10px',
  },
  locationTitle: {
    fontSize: '0.65rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
  locationValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '2px',
  },
  vitalsSummaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
  },
  vitalLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#64748b',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '20px',
    alignItems: 'start',
  },
  columnCard: {
    background: 'rgba(15, 21, 38, 0.4)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '10px',
    marginBottom: '14px',
  },
  columnTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  notesHistory: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    maxHeight: '220px',
    overflowY: 'auto',
    marginBottom: '16px',
    paddingRight: '4px',
  },
  noteItem: {
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
  },
  noteMeta: {
    fontSize: '0.7rem',
    color: '#64748b',
    marginBottom: '4px',
  },
  noteText: {
    fontSize: '0.8rem',
    color: '#cbd5e1',
    lineHeight: '1.4',
  },
  noteForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  rxList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxHeight: '180px',
    overflowY: 'auto',
    marginBottom: '16px',
    paddingRight: '4px',
  },
  rxItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '8px',
  },
  rxMedName: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#fff',
  },
  rxDetails: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  rxPrescriber: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  rxForm: {
    display: 'flex',
    flexDirection: 'column',
  },
  actionCenterButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '4px',
  },
  approvedNotice: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    color: 'var(--color-vacant)',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  select: {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '14px',
  },
  emptyGrid: {
    textAlign: 'center',
    padding: '80px 40px',
    color: '#64748b',
    fontSize: '0.95rem',
  },
  emptyText: {
    fontSize: '0.8rem',
    color: '#64748b',
    textAlign: 'center',
    padding: '20px',
  }
};

export default DoctorDashboard;
