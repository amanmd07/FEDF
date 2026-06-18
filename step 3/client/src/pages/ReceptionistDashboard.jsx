import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPatients, getAllBeds, createPatient, assignBed as assignBedService, dischargePatient, onPatientsSnapshot, onBedsSnapshot } from '../firestoreService'

function recommendWardByCondition(problem) {
    const p = (problem || '').toLowerCase().trim();
    if (!p) return null;
    
    // ICU Keywords
    const icuKeywords = [
        'heart', 'chest', 'breath', 'stroke', 'unconscious', 'coma', 
        'critical', 'icu', 'cardiac', 'seizure', 'respiratory', 
        'oxygen', 'cardio', 'arrest', 'organ failure'
    ];
    // Emergency Keywords
    const emergencyKeywords = [
        'accident', 'fracture', 'bleed', 'injury', 'burn', 'wound', 
        'emergency', 'trauma', 'pain', 'poison', 'bite', 'cut', 
        'broken', 'fall', 'laceration', 'blood loss'
    ];
    
    if (icuKeywords.some(keyword => p.includes(keyword))) {
        return { type: 'icu', name: 'ICU Critical Care' };
    }
    if (emergencyKeywords.some(keyword => p.includes(keyword))) {
        return { type: 'emergency', name: 'Emergency Care' };
    }
    return { type: 'general', name: 'General Medicine' };
}

export default function ReceptionistDashboard() {
    const [beds, setBeds] = useState([])
    const [patients, setPatients] = useState([])
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [problem, setProblem] = useState('')
    const [bedNumber, setBedNumber] = useState('auto')
    const [search, setSearch] = useState('')
    const [showAdmissionModal, setShowAdmissionModal] = useState(false)

    // Option toggles and background sync status states
    const [autoSync, setAutoSync] = useState(true)
    const [showTotalBeds, setShowTotalBeds] = useState(true)
    const [showOccupiedBeds, setShowOccupiedBeds] = useState(true)
    const [showSpecialties, setShowSpecialties] = useState(true)
    const [receptionBedFilter, setReceptionBedFilter] = useState('all')
    const [receptionWardFilter, setReceptionWardFilter] = useState('all')

    const nav = useNavigate();

    const fetchData = async (isBackground = false) => {
        try {
            const [bedsData, patientsData] = await Promise.all([
                getAllBeds(),
                getAllPatients()
            ])
            setBeds(bedsData)
            setPatients(patientsData)
        } catch (err) {
            console.error('Fetch data failed', err);
            if (isBackground !== true) {
                alert(err?.message || 'Failed to fetch data');
            }
        }
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            alert('Please login first');
            nav('/login/receptionist');
            return;
        }
        fetchData()

        let unsubPatients;
        let unsubBeds;
        if (autoSync) {
            unsubPatients = onPatientsSnapshot((patientsData) => setPatients(patientsData));
            unsubBeds = onBedsSnapshot((bedsData) => setBeds(bedsData));
        }

        return () => {
            if (unsubPatients) unsubPatients();
            if (unsubBeds) unsubBeds();
        };
    }, [autoSync])

    const colorFor = (s) => s === 'available' ? 'success' : s === 'occupied' ? 'danger' : 'warning'

    const admit = async () => {
        let assignedBedNumber = ''
        if (bedNumber) {
            if (['general', 'icu', 'emergency'].includes(bedNumber)) {
                // Auto-assign by ward type
                const vacantBed = beds.find(b => b.type === bedNumber && b.status === 'available')
                if (!vacantBed) {
                    alert(`No available vacant beds in the ${bedNumber.toUpperCase()} ward. Patient will be placed in the queue.`)
                } else {
                    assignedBedNumber = vacantBed.number
                }
            } else if (bedNumber === 'auto') {
                // Auto-assign by condition
                const recommendation = recommendWardByCondition(problem);
                const targetType = recommendation ? recommendation.type : 'general';
                const vacantBed = beds.find(b => b.type === targetType && b.status === 'available')
                if (!vacantBed) {
                    alert(`No available vacant beds in the ${targetType.toUpperCase()} ward. Patient will be placed in the queue.`)
                    assignedBedNumber = '';
                } else {
                    assignedBedNumber = vacantBed.number
                }
            } else {
                // Specific bed chosen
                assignedBedNumber = bedNumber
            }
        }
        try {
            await createPatient({ name, age: Number(age), gender, problem, bedNumber: assignedBedNumber || bedNumber })
            setName(''); setAge(''); setGender(''); setProblem(''); setBedNumber('auto');
            await fetchData()
        } catch (err) { alert(err?.message || 'Error admitting patient') }
    }

    const assignBed = async (patientId, bedId) => {
        try {
            await assignBedService(patientId, bedId)
            await fetchData()
        } catch (err) { alert(err?.message || 'Error assigning bed') }
    }

    const discharge = async (patientId) => {
        try {
            await dischargePatient(patientId)
            await fetchData()
        } catch (err) { alert(err?.message || 'Error discharging') }
    }

    const visiblePatients = patients.filter(patient =>
        (patient.name || '').toLowerCase().includes(search.toLowerCase()) ||
        ((patient.bedNumber || '')).toLowerCase().includes(search.toLowerCase())
    )

    const summary = {
        totalBeds: beds.length,
        available: beds.filter(b => b.status === 'available').length,
        occupied: beds.filter(b => b.status === 'occupied').length,
        maintenance: beds.filter(b => b.status === 'maintenance').length,
        icu: beds.filter(b => b.type === 'icu').length,
        emergency: beds.filter(b => b.type === 'emergency').length
    }

    const filteredBedsForView = beds.filter(bed => {
        // Status filter
        if (receptionBedFilter === 'occupied' && bed.status !== 'occupied') return false
        if (receptionBedFilter === 'available' && bed.status !== 'available') return false
        
        // Ward type filter
        if (receptionWardFilter !== 'all' && bed.type !== receptionWardFilter) return false
        
        return true
    })

    return (
        <div className="container py-4">
            <header className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h2>Receptionist Dashboard</h2>
                    <p className="text-muted">Manage admissions, bed allocation, discharge requests, and real-time ward availability.</p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <button className="btn btn-primary d-flex align-items-center gap-1.5 fw-bold" onClick={() => setShowAdmissionModal(true)}>
                        ➕ New Admission
                    </button>
                    <button className="btn btn-outline-secondary d-flex align-items-center gap-1.5 fw-semibold" onClick={() => fetchData(false)}>
                        🔄 Refresh Data
                    </button>
                </div>
            </header>

            {/* Live Synchronizer & Display Control Panel */}
            <div className="card glass p-3 mb-4 shadow-sm border-0 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 animate-fade-in-up">
                <div className="d-flex align-items-center gap-2">
                    <span className="badge-live-pulse animate-pulse-slow" style={{
                        background: autoSync ? 'rgba(16, 185, 129, 0.08)' : 'rgba(108, 117, 125, 0.08)',
                        color: autoSync ? '#10b981' : '#6c757d',
                        border: autoSync ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(108, 117, 125, 0.2)',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center'
                    }}>
                        <span className={`live-pulse-dot me-1.5 ${autoSync ? '' : 'bg-secondary'}`} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: autoSync ? '#10b981' : '#6c757d',
                            animation: autoSync ? 'livePulse 1.8s infinite ease-in-out' : 'none'
                        }}></span>
                        {autoSync ? 'LIVE SYNC ACTIVE' : 'LIVE SYNC OFF'}
                    </span>
                    <span className="text-muted small">Real-time update from Nurse Fleet Command center is active.</span>
                </div>
                <div className="d-flex align-items-center gap-3 flex-wrap">
                    <div className="form-check form-switch mb-0">
                        <input className="form-check-input" type="checkbox" id="autoSyncSwitch" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} style={{ cursor: 'pointer' }} />
                        <label className="form-check-label small fw-bold text-muted" htmlFor="autoSyncSwitch" style={{ cursor: 'pointer' }}>Auto-Sync Fleet</label>
                    </div>
                    <div className="border-start ps-3 d-flex gap-2 align-items-center">
                        <span className="small fw-bold text-muted me-1">👀 VIEW:</span>
                        <button className={`btn btn-xs py-1 px-2.5 rounded-pill fw-bold text-uppercase border-0 transition-all ${showTotalBeds ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`} style={{ fontSize: '0.68rem' }} onClick={() => setShowTotalBeds(!showTotalBeds)}>
                            {showTotalBeds ? '✓ Total' : 'Total'}
                        </button>
                        <button className={`btn btn-xs py-1 px-2.5 rounded-pill fw-bold text-uppercase border-0 transition-all ${showOccupiedBeds ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`} style={{ fontSize: '0.68rem' }} onClick={() => setShowOccupiedBeds(!showOccupiedBeds)}>
                            {showOccupiedBeds ? '✓ Occupied' : 'Occupied'}
                        </button>
                        <button className={`btn btn-xs py-1 px-2.5 rounded-pill fw-bold text-uppercase border-0 transition-all ${showSpecialties ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted'}`} style={{ fontSize: '0.68rem' }} onClick={() => setShowSpecialties(!showSpecialties)}>
                            {showSpecialties ? '✓ Specialties' : 'Specialties'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Beds', value: summary.totalBeds, theme: '#3b82f6', bg: 'rgba(59, 82, 246, 0.08)', icon: '📊', visible: showTotalBeds },
                    { label: 'Available', value: summary.available, theme: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', icon: '🟢', visible: showTotalBeds },
                    { label: 'Occupied', value: summary.occupied, theme: '#f43f5e', bg: 'rgba(244, 63, 94, 0.08)', icon: '🚨', visible: showOccupiedBeds },
                    { label: 'Maintenance', value: summary.maintenance, theme: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: '⚠️', visible: showOccupiedBeds },
                    { label: 'ICU Beds', value: summary.icu, theme: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', icon: '❄️', visible: showSpecialties },
                    { label: 'Emergency Beds', value: summary.emergency, theme: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', icon: '⚡', visible: showSpecialties }
                ].filter(card => card.visible).map(card => (
                    <div className="col-sm-6 col-xl-4" key={card.label}>
                        <div className="summary-card-premium h-100" style={{ '--summary-theme': card.theme, '--summary-bg': card.bg }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase text-muted mb-2" style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em' }}>{card.label}</h6>
                                    <h3 className="fw-extrabold text-dark mb-0" style={{ fontSize: '1.8rem' }}>{card.value}</h3>
                                </div>
                                <div className="summary-icon-wrapper">
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row gx-4 gy-4">
                <div className="col-xl-4">
                    <div className="card glass p-4 shadow-sm">
                        <h5 className="mb-3">Admit New Patient</h5>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>PATIENT NAME</label>
                            <input className="form-control form-control-premium" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" />
                        </div>
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>AGE</label>
                                <input className="form-control form-control-premium" type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age" />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>GENDER</label>
                                <select className="form-select form-control-premium" value={gender} onChange={e => setGender(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>PROBLEM / COMPLAINT</label>
                            <input className="form-control form-control-premium" value={problem} onChange={e => setProblem(e.target.value)} placeholder="e.g. Chest pain, High fever" />
                            {(() => {
                                const recommendation = recommendWardByCondition(problem);
                                if (!recommendation) return null;
                                const isAvailable = beds.some(b => b.type === recommendation.type && b.status === 'available');
                                return (
                                    <div className="mt-2 p-2 rounded-3 small border animate-fade-in-up" style={{
                                        background: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.08)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                        borderColor: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.15)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                        color: recommendation.type === 'icu' ? '#e11d48' : recommendation.type === 'emergency' ? '#d97706' : '#10b981',
                                        fontWeight: 600
                                    }}>
                                        🩺 Triaged Ward: {recommendation.name} Recommended {isAvailable ? '(Vacant bed available)' : '(No vacant beds, will queue)'}
                                    </div>
                                );
                            })()}
                        </div>
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem' }}>ALLOT BED (WARD)</label>
                            <select className="form-select form-control-premium" value={bedNumber} onChange={e => setBedNumber(e.target.value)}>
                                <option value="auto">Auto-Assign Based on Condition (Recommended)</option>
                                <option value="">-- No Bed (Queue Only) --</option>
                                <optgroup label="Auto-Assign Ward Category">
                                    <option value="general">Auto-assign General Bed</option>
                                    <option value="icu">Auto-assign ICU Bed</option>
                                    <option value="emergency">Auto-assign Emergency Bed</option>
                                </optgroup>
                                <optgroup label="Specific Available Beds">
                                    {beds.filter(b => b.status === 'available').map(b => (
                                        <option key={b._id || b.id} value={b.number}>
                                            {b.number} — {b.ward} ({b.type.toUpperCase()})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        <button className="btn btn-primary w-100 mt-2 py-2 fw-bold" onClick={admit}>Admit Patient</button>
                    </div>

                    <div className="card glass p-4 shadow-sm mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0">Patient Queue</h5>
                            <span className="badge bg-secondary">{visiblePatients.length}</span>
                        </div>
                        <div className="mb-3">
                            <input className="form-control" placeholder="Search patients or bed" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <ul className="list-group list-group-flush">
                            {visiblePatients.map(patient => (
                                <li key={patient._id || patient.id} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                                    <div>
                                        <strong>{patient.name}</strong>
                                        {patient.problem && <div className="small text-danger fw-semibold" style={{ fontSize: '0.72rem' }}>⚠️ {patient.problem}</div>}
                                        <div className="text-muted">Bed: {patient.bedNumber || 'Pending'}</div>
                                    </div>
                                    <div className="d-flex gap-1">
                                        {patient.bedNumber && <button className="btn btn-sm btn-warning" onClick={() => discharge(patient._id || patient.id)}>Discharge</button>}
                                        <div className="dropdown">
                                            <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Assign</button>
                                            <ul className="dropdown-menu p-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                                                {beds.filter(b => b.status === 'available').map(b => (
                                                    <li key={b._id || b.id}><button className="dropdown-item small" style={{ fontSize: '0.78rem' }} onClick={() => assignBed(patient._id || patient.id, b._id || b.id)}>{b.number} — {b.ward} ({b.type.toUpperCase()})</button></li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {visiblePatients.length === 0 && <li className="list-group-item text-muted text-center">No patients found.</li>}
                        </ul>
                    </div>
                </div>

                <div className="col-xl-8">
                    <div className="card glass p-4 shadow-sm">
                        <div className="d-flex flex-column mb-4 border-bottom pb-3">
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 mb-3">
                                <div>
                                    <h5 className="mb-1">Bed Status Overview</h5>
                                    <p className="text-muted mb-0">A live bed map showing bed location, occupied beds, and free beds.</p>
                                </div>
                                <div className="d-flex gap-2 align-items-center flex-wrap">
                                    <span className="badge bg-success" style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '20px' }}>
                                        🟢 {summary.available} Free Beds Available
                                    </span>
                                    <span className="badge bg-info">Updated live</span>
                                </div>
                            </div>
                            
                            <div className="d-flex flex-column flex-md-row gap-3 justify-content-between align-items-md-center">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-muted me-1">STATUS:</span>
                                    <div className="btn-group rounded-pill overflow-hidden shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionBedFilter === 'all' ? 'btn-primary text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionBedFilter('all')}>
                                            All ({beds.length})
                                        </button>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionBedFilter === 'occupied' ? 'btn-danger text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionBedFilter('occupied')}>
                                            Occupied ({beds.filter(b => b.status === 'occupied').length})
                                        </button>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionBedFilter === 'available' ? 'btn-success text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionBedFilter('available')}>
                                            Free ({beds.filter(b => b.status === 'available').length})
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="d-flex align-items-center gap-2">
                                    <span className="small fw-bold text-muted me-1">WARD / SPECIALTY:</span>
                                    <div className="btn-group rounded-pill overflow-hidden shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionWardFilter === 'all' ? 'btn-primary text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionWardFilter('all')}>
                                            All Wards
                                        </button>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionWardFilter === 'general' ? 'btn-secondary text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionWardFilter('general')}>
                                            General
                                        </button>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionWardFilter === 'icu' ? 'btn-secondary text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionWardFilter('icu')}>
                                            ICU
                                        </button>
                                        <button className={`btn btn-xs py-1 px-3 fw-bold border-0 ${receptionWardFilter === 'emergency' ? 'btn-secondary text-white' : 'btn-light text-muted'}`} style={{ fontSize: '0.72rem' }} onClick={() => setReceptionWardFilter('emergency')}>
                                            Emergency
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="row g-3">
                            {filteredBedsForView.length === 0 ? (
                                <div className="col-12 text-center text-muted py-5 bg-light rounded-3 border border-dashed">
                                    <span style={{ fontSize: '2.5rem' }}>🛏️</span>
                                    <p className="mt-2 mb-0 fw-bold">No beds match the selected filters.</p>
                                    <small className="text-muted">Adjust status or ward filter settings above.</small>
                                </div>
                            ) : (
                                filteredBedsForView.map(bed => (
                                    <div className="col-sm-6 col-lg-4" key={bed._id || bed.id}>
                                        <div className={`bed-card-premium status-${bed.status}`}>
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <div>
                                                    <h6 className="mb-0 fw-extrabold text-dark" style={{ fontSize: '0.95rem' }}>Bed {bed.number}</h6>
                                                    <small className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 600 }}>{bed.ward} • {bed.type.toUpperCase()}</small>
                                                </div>
                                                <span className={`bed-status-badge ${bed.status}`}>
                                                    {bed.status}
                                                </span>
                                            </div>
                                            {bed.status === 'occupied' ? (
                                                (() => {
                                                    const patientObj = typeof bed.patientId === 'object' ? bed.patientId : patients.find(p => p._id === bed.patientId || p.id === bed.patientId);
                                                    return (
                                                        <div className="pt-2 border-top border-light">
                                                            <div className="text-dark fw-bold d-flex align-items-center gap-1.5" style={{ fontSize: '0.82rem' }}>
                                                                👤 {patientObj ? patientObj.name : 'Patient Allocated'}
                                                            </div>
                                                            {patientObj && patientObj.problem && (
                                                                <div className="small text-danger fw-semibold mt-1 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                                                    ⚠️ {patientObj.problem}
                                                                </div>
                                                            )}
                                                            {patientObj && (
                                                                <button className="btn btn-xs btn-outline-danger mt-2 py-0.5 px-2 rounded fw-bold d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }} onClick={() => discharge(patientObj._id || patientObj.id)}>
                                                                    🚪 Discharge
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div className="pt-2 border-top border-light text-muted small">
                                                    🟢 Available for Patient Assignment.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Glassmorphic Admission Modal Overlay */}
            {showAdmissionModal && (
                <div className="modal-backdrop-custom animate-fade-in-up" 
                     style={{
                         position: 'fixed',
                         inset: 0,
                         background: 'rgba(10, 15, 29, 0.45)',
                         backdropFilter: 'blur(10px)',
                         WebkitBackdropFilter: 'blur(10px)',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         zIndex: 2000,
                         padding: '1.5rem'
                     }}
                     onClick={() => setShowAdmissionModal(false)}
                >
                    <div className="glass-card p-4 mx-auto portal-selection-card" 
                         style={{ 
                             maxWidth: 460, 
                             width: '100%',
                             background: 'rgba(255, 255, 255, 0.9)', 
                             borderRadius: '1.25rem',
                             boxShadow: '0 25px 50px -12px rgba(31, 38, 135, 0.15)',
                             border: '1px solid rgba(255, 255, 255, 0.6)'
                         }}
                         onClick={e => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
                            <h4 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: 'hsl(var(--text-dark))', fontSize: '1.25rem' }}>
                                📑 Admit New Patient
                            </h4>
                            <button className="btn btn-sm btn-light rounded-circle" 
                                    onClick={() => setShowAdmissionModal(false)}
                                    style={{ width: 32, height: 32, padding: 0 }}>
                                ✕
                            </button>
                        </div>
                        
                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>PATIENT FULL NAME</label>
                            <input className="form-control form-control-premium" 
                                   value={name} 
                                   onChange={e => setName(e.target.value)} 
                                   placeholder="Enter full name" />
                        </div>
                        
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>AGE</label>
                                <input className="form-control form-control-premium" 
                                       type="number" 
                                       value={age} 
                                       onChange={e => setAge(e.target.value)} 
                                       placeholder="Age" />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>GENDER</label>
                                <select className="form-select form-control-premium" 
                                        value={gender} 
                                        onChange={e => setGender(e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>PATIENT PROBLEM / COMPLAINT</label>
                            <input className="form-control form-control-premium" 
                                   value={problem} 
                                   onChange={e => setProblem(e.target.value)} 
                                   placeholder="e.g. Chest pain, High fever, Fracture" />
                            {(() => {
                                const recommendation = recommendWardByCondition(problem);
                                if (!recommendation) return null;
                                const isAvailable = beds.some(b => b.type === recommendation.type && b.status === 'available');
                                return (
                                    <div className="mt-2 p-2 rounded-3 small border animate-fade-in-up" style={{
                                        background: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.08)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                        borderColor: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.15)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                        color: recommendation.type === 'icu' ? '#e11d48' : recommendation.type === 'emergency' ? '#d97706' : '#10b981',
                                        fontWeight: 600
                                    }}>
                                        🩺 Triaged Ward: {recommendation.name} Recommended {isAvailable ? '(Vacant bed available)' : '(No vacant beds, will queue)'}
                                    </div>
                                );
                            })()}
                        </div>
                        
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>ALLOT BED (WITH WARD)</label>
                            <select className="form-select form-control-premium"
                                    value={bedNumber}
                                    onChange={e => setBedNumber(e.target.value)}
                            >
                                <option value="auto">Auto-Assign Based on Condition (Recommended)</option>
                                <option value="">-- Select Available Bed (Queue Only) --</option>
                                <optgroup label="Auto-Assign Ward Category">
                                    <option value="general">Auto-assign General Bed</option>
                                    <option value="icu">Auto-assign ICU Bed</option>
                                    <option value="emergency">Auto-assign Emergency Bed</option>
                                </optgroup>
                                <optgroup label="Specific Available Beds">
                                    {beds.filter(b => b.status === 'available').map(b => (
                                        <option key={b._id || b.id} value={b.number}>
                                            {b.number} — {b.ward} ({b.type.toUpperCase()})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button className="btn btn-outline-secondary w-50 py-2.5 fw-bold rounded-pill" onClick={() => setShowAdmissionModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-premium w-50 py-2.5 fw-bold rounded-pill" 
                                    style={{ 
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.85rem'
                                    }}
                                    onClick={async () => {
                                        await admit();
                                        setShowAdmissionModal(false);
                                    }}>
                                Admit Patient ⚡
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
