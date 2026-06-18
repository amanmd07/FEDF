import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Bed, UserPlus, ArrowRightLeft, Check, AlertCircle, Wrench, RefreshCw, Filter } from 'lucide-react';

const ReceptionDashboard = () => {
  const { 
    beds, 
    patients, 
    admitPatient, 
    transferPatient, 
    executeDischarge,
    updateBedStatus 
  } = useHospital();

  const [selectedWard, setSelectedWard] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeModal, setActiveModal] = useState(null); // 'admit', 'manage', null
  const [selectedBed, setSelectedBed] = useState(null);

  // Form states
  const [admitForm, setAdmitForm] = useState({
    name: '',
    age: '',
    gender: 'Male',
    severity: 'Stable',
    symptoms: ''
  });
  const [transferBedId, setTransferBedId] = useState('');

  const wards = ['All', 'ICU', 'Emergency', 'General Ward', 'Pediatrics'];
  const statuses = ['All', 'vacant', 'occupied', 'cleaning', 'maintenance'];

  // Filtered beds
  const filteredBeds = beds.filter(bed => {
    const wardMatch = selectedWard === 'All' || bed.ward === selectedWard;
    const statusMatch = selectedStatus === 'All' || bed.status === selectedStatus;
    return wardMatch && statusMatch;
  });

  const getBedStatusBadge = (status, patientId) => {
    if (status === 'occupied') {
      const patient = patients.find(p => p.id === patientId);
      if (patient?.severity === 'Critical') {
        return <span className="badge badge-critical">Critical</span>;
      }
      return <span className="badge badge-occupied">Occupied</span>;
    }
    
    switch (status) {
      case 'vacant':
        return <span className="badge badge-vacant">Vacant</span>;
      case 'cleaning':
        return <span className="badge badge-cleaning">Cleaning</span>;
      case 'maintenance':
        return <span className="badge badge-maintenance">Maintenance</span>;
      default:
        return <span className="badge badge-maintenance">{status}</span>;
    }
  };

  const handleBedClick = (bed) => {
    setSelectedBed(bed);
    if (bed.status === 'vacant') {
      setAdmitForm({ name: '', age: '', gender: 'Male', severity: 'Stable', symptoms: '' });
      setActiveModal('admit');
    } else if (bed.status === 'occupied' || bed.status === 'cleaning' || bed.status === 'maintenance') {
      // Find first vacant bed as default transfer target
      const firstVacant = beds.find(b => b.status === 'vacant');
      setTransferBedId(firstVacant ? firstVacant.id : '');
      setActiveModal('manage');
    }
  };

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!selectedBed) return;
    admitPatient({
      ...admitForm,
      bedId: selectedBed.id
    });
    setActiveModal(null);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    if (!selectedBed || !transferBedId) return;
    transferPatient(selectedBed.patientId, selectedBed.id, transferBedId);
    setActiveModal(null);
  };

  const handleDischargeClick = (patientId, bedId) => {
    executeDischarge(patientId, bedId);
    setActiveModal(null);
  };

  const handleSetVacantClick = (bedId) => {
    updateBedStatus(bedId, 'vacant');
    setActiveModal(null);
  };

  const vacantBedsList = beds.filter(b => b.status === 'vacant');
  const activePatient = selectedBed?.patientId ? patients.find(p => p.id === selectedBed.patientId) : null;

  return (
    <div style={styles.container}>
      {/* Title section */}
      <div style={styles.titleSection}>
        <h2 style={styles.pageTitle}>Bed Allocation & Operations</h2>
        <p style={styles.pageSubtitle}>Admit, transfer, or check out patients. Real-time availability updates.</p>
      </div>

      {/* Filter Toolbar */}
      <div style={styles.filterBar} className="glass-card">
        <div style={styles.filterGroup}>
          <Filter size={16} color="#64748b" style={{ marginRight: 8 }} />
          <span style={styles.filterLabel}>Ward:</span>
          <div style={styles.buttonGroup}>
            {wards.map(w => (
              <button 
                key={w}
                onClick={() => setSelectedWard(w)}
                style={{
                  ...styles.filterTab,
                  ...(selectedWard === w ? styles.activeFilterTab : {})
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...styles.filterGroup, marginTop: '12px' }}>
          <div style={{ width: 24 }} />
          <span style={styles.filterLabel}>Status:</span>
          <div style={styles.buttonGroup}>
            {statuses.map(s => (
              <button 
                key={s}
                onClick={() => setSelectedStatus(s)}
                style={{
                  ...styles.filterTab,
                  ...(selectedStatus === s ? styles.activeFilterTab : {}),
                  textTransform: 'capitalize'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Beds Grid */}
      <div style={styles.gridContainer}>
        {filteredBeds.length === 0 ? (
          <div style={styles.emptyGrid} className="glass-card">
            No beds match the active filters. Clear filters to view hospital layout.
          </div>
        ) : (
          filteredBeds.map(bed => {
            const patient = bed.patientId ? patients.find(p => p.id === bed.patientId) : null;
            return (
              <div 
                key={bed.id}
                onClick={() => handleBedClick(bed)}
                className={`glass-card`}
                style={{
                  ...styles.bedCard,
                  borderColor: bed.status === 'occupied' 
                    ? (patient?.severity === 'Critical' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)')
                    : bed.status === 'cleaning' 
                      ? 'rgba(245, 158, 11, 0.4)'
                      : bed.status === 'maintenance' 
                        ? 'rgba(107, 114, 128, 0.4)'
                        : 'rgba(16, 185, 129, 0.4)'
                }}
              >
                <div style={styles.bedCardHeader}>
                  <div style={styles.bedNameContainer}>
                    <Bed 
                      size={18} 
                      color={
                        bed.status === 'occupied' 
                          ? (patient?.severity === 'Critical' ? 'var(--color-critical)' : 'var(--color-occupied)') 
                          : 'var(--color-' + bed.status + ')'
                      } 
                    />
                    <span style={styles.bedName}>{bed.name}</span>
                  </div>
                  {getBedStatusBadge(bed.status, bed.patientId)}
                </div>

                <div style={styles.bedCardBody}>
                  {bed.status === 'occupied' && patient ? (
                    <div>
                      <div style={styles.patientName}>{patient.name}</div>
                      <div style={styles.patientMeta}>
                        {patient.age} yrs • {patient.gender}
                      </div>
                      <div style={styles.symptomsPreview} title={patient.symptoms}>
                        {patient.symptoms}
                      </div>
                    </div>
                  ) : bed.status === 'cleaning' ? (
                    <div style={styles.statusTextContainer}>
                      <RefreshCw size={14} color="var(--color-cleaning)" className="spin" style={{ marginRight: 6 }} />
                      <span style={{ color: 'var(--color-cleaning)', fontSize: '0.8rem', fontWeight: 600 }}>Sanitization in Progress</span>
                    </div>
                  ) : bed.status === 'maintenance' ? (
                    <div style={styles.statusTextContainer}>
                      <Wrench size={14} color="var(--color-maintenance)" style={{ marginRight: 6 }} />
                      <span style={{ color: 'var(--color-maintenance)', fontSize: '0.8rem', fontWeight: 600 }}>Technical Repair</span>
                    </div>
                  ) : (
                    <div style={styles.statusTextContainer}>
                      <span style={{ color: 'var(--color-vacant)', fontSize: '0.8rem', fontWeight: 600 }}>Ready for Patient</span>
                    </div>
                  )}
                </div>
                
                <div style={styles.bedCardFooter}>
                  <span style={styles.wardLabel}>{bed.ward}</span>
                  <span style={styles.actionPrompt}>
                    {bed.status === 'vacant' ? 'Click to Admit' : 'Manage Bed'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal - ADMIT PATIENT */}
      {activeModal === 'admit' && selectedBed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 style={styles.modalTitle}>Patient Admission</h3>
            <p style={styles.modalSub}>Assigning to Bed <strong>{selectedBed.name}</strong> ({selectedBed.ward})</p>

            <form onSubmit={handleAdmitSubmit} style={styles.modalForm}>
              <div style={{ marginBottom: 16 }}>
                <label className="label">Patient Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Jean-Luc Picard"
                  value={admitForm.name}
                  onChange={(e) => setAdmitForm({...admitForm, name: e.target.value})}
                  required
                />
              </div>

              <div style={styles.formRow}>
                <div style={{ flex: 1 }}>
                  <label className="label">Age</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="e.g. 52"
                    value={admitForm.age}
                    onChange={(e) => setAdmitForm({...admitForm, age: e.target.value})}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="label">Gender</label>
                  <select 
                    className="input-field" 
                    value={admitForm.gender}
                    onChange={(e) => setAdmitForm({...admitForm, gender: e.target.value})}
                    style={styles.select}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label">Admission Severity</label>
                <select 
                  className="input-field" 
                  value={admitForm.severity}
                  onChange={(e) => setAdmitForm({...admitForm, severity: e.target.value})}
                  style={styles.select}
                >
                  <option value="Stable">Stable (Observation / Post-Op)</option>
                  <option value="Moderate">Moderate (ER / Symptomatic)</option>
                  <option value="Critical">Critical (High acuity / ICU care)</option>
                </select>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label className="label">Chief Complaint / Symptoms</label>
                <textarea 
                  className="input-field" 
                  placeholder="Describe patient symptoms or admitting diagnosis..."
                  rows="3"
                  value={admitForm.symptoms}
                  onChange={(e) => setAdmitForm({...admitForm, symptoms: e.target.value})}
                  style={{ resize: 'none' }}
                  required
                />
              </div>

              <div style={styles.modalButtons}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setActiveModal(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  <UserPlus size={16} /> Complete Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - MANAGE BED (Occupied, Cleaning, Maintenance) */}
      {activeModal === 'manage' && selectedBed && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            <h3 style={styles.modalTitle}>Manage Bed - {selectedBed.name}</h3>
            <p style={styles.modalSub}>Current State: <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedBed.status}</span></p>

            {selectedBed.status === 'occupied' && activePatient && (
              <div style={styles.patientSummary}>
                <div style={styles.patientSummaryDetails}>
                  <div style={styles.summaryName}>{activePatient.name}</div>
                  <div style={styles.summaryMeta}>
                    Age: {activePatient.age} • Gender: {activePatient.gender} • Severity: 
                    <span style={{ 
                      marginLeft: 6, 
                      color: activePatient.severity === 'Critical' ? 'var(--color-critical)' : activePatient.severity === 'Moderate' ? 'var(--color-cleaning)' : 'var(--color-vacant)',
                      fontWeight: 'bold' 
                    }}>
                      {activePatient.severity}
                    </span>
                  </div>
                  <div style={styles.summaryComplaint}>
                    <strong>Symptoms:</strong> {activePatient.symptoms}
                  </div>
                </div>

                {/* Transfer Section */}
                <div style={styles.sectionDivider} />
                <h4 style={styles.sectionHeader}>Transfer Patient</h4>
                {vacantBedsList.length === 0 ? (
                  <p style={styles.warningText}>No vacant beds available for transfer.</p>
                ) : (
                  <form onSubmit={handleTransferSubmit} style={styles.inlineForm}>
                    <select 
                      className="input-field" 
                      value={transferBedId}
                      onChange={(e) => setTransferBedId(e.target.value)}
                      style={{ ...styles.select, flex: 1 }}
                    >
                      {vacantBedsList.map(vBed => (
                        <option key={vBed.id} value={vBed.id}>
                          {vBed.name} ({vBed.ward})
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary">
                      <ArrowRightLeft size={16} /> Transfer
                    </button>
                  </form>
                )}

                {/* Discharge Section */}
                <div style={styles.sectionDivider} />
                <h4 style={styles.sectionHeader}>Discharge Checkout</h4>
                {activePatient.dischargeApproved ? (
                  <div style={styles.dischargeApprovedBox}>
                    <div style={styles.successMessage}>
                      <Check size={18} style={{ marginRight: 6 }} />
                      Physician discharge clearance authorized.
                    </div>
                    <button 
                      onClick={() => handleDischargeClick(activePatient.id, selectedBed.id)}
                      className="btn btn-danger"
                      style={{ width: '100%', marginTop: 12 }}
                    >
                      Finalize Discharge & Release Bed
                    </button>
                  </div>
                ) : (
                  <div style={styles.dischargeDeniedBox}>
                    <AlertCircle size={18} color="var(--color-cleaning)" style={{ marginRight: 8, flexShrink: 0 }} />
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Discharge locked. The attending physician must log clinical approval in the Doctor portal before checkout.
                    </div>
                  </div>
                )}
              </div>
            )}

            {(selectedBed.status === 'cleaning' || selectedBed.status === 'maintenance') && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: 20 }}>
                  This bed is currently offline for {selectedBed.status}. Once verified clean/operational, you can override its state.
                </p>
                <button 
                  onClick={() => handleSetVacantClick(selectedBed.id)}
                  className="btn btn-success"
                  style={{ width: '100%' }}
                >
                  Confirm Operational & Set Vacant
                </button>
              </div>
            )}
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
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 20px',
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#94a3b8',
    width: '60px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filterTab: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    padding: '6px 14px',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeFilterTab: {
    background: '#4f6ef2',
    color: '#fff',
    borderColor: '#4f6ef2',
    boxShadow: '0 0 10px rgba(79, 110, 242, 0.3)',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  emptyGrid: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    fontSize: '0.9rem',
  },
  bedCard: {
    background: 'rgba(15, 21, 38, 0.5)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '180px',
    padding: '16px',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  bedCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bedNameContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  bedName: {
    fontWeight: '800',
    fontSize: '1rem',
    color: '#fff',
  },
  bedCardBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '12px 0',
  },
  patientName: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#f8fafc',
  },
  patientMeta: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  symptomsPreview: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '6px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  statusTextContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bedCardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '10px',
  },
  wardLabel: {
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  actionPrompt: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#4f6ef2',
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
  select: {
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '12px',
  },
  patientSummary: {
    display: 'flex',
    flexDirection: 'column',
  },
  patientSummaryDetails: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
  },
  summaryName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
  },
  summaryMeta: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginTop: '4px',
  },
  summaryComplaint: {
    fontSize: '0.85rem',
    color: '#f8fafc',
    marginTop: '12px',
    lineHeight: '1.4',
  },
  sectionDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '16px 0',
  },
  sectionHeader: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fff',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  warningText: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  inlineForm: {
    display: 'flex',
    gap: '12px',
  },
  dischargeApprovedBox: {
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.25)',
    borderRadius: '12px',
    padding: '16px',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-vacant)',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  dischargeDeniedBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(245, 158, 11, 0.05)',
    border: '1px solid rgba(245, 158, 11, 0.15)',
    borderRadius: '12px',
    padding: '16px',
  }
};

export default ReceptionDashboard;
