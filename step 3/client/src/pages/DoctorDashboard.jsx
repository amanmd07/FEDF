import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPatients, getAllBeds, createPatient, updatePatient, onPatientsSnapshot, onBedsSnapshot } from '../firestoreService'

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

export default function DoctorDashboard() {
    const [patients, setPatients] = useState([])
    const [beds, setBeds] = useState([])
    const [selectedWard, setSelectedWard] = useState('all')
    const [selectedPatient, setSelectedPatient] = useState(null)
    const nav = useNavigate()

    // Patient admission states
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [problem, setProblem] = useState('')
    const [bedNumber, setBedNumber] = useState('auto')
    const [showAdmissionModal, setShowAdmissionModal] = useState(false)
    
    // Expanded admission states
    const [sinceWhen, setSinceWhen] = useState('')
    const [roomNumber, setRoomNumber] = useState('')
    const [heartRate, setHeartRate] = useState('')
    const [bloodPressure, setBloodPressure] = useState('')
    const [temperature, setTemperature] = useState('')
    const [medsList, setMedsList] = useState([])
    const [newMedInput, setNewMedInput] = useState('')
    const [initialNote, setInitialNote] = useState('')

    // Patient edit and notes states
    const [isEditMode, setIsEditMode] = useState(false)
    const [editName, setEditName] = useState('')
    const [editAge, setEditAge] = useState('')
    const [editGender, setEditGender] = useState('')
    const [editProblem, setEditProblem] = useState('')
    const [editSinceWhen, setEditSinceWhen] = useState('')
    const [editRoomNumber, setEditRoomNumber] = useState('')
    const [editBedNumber, setEditBedNumber] = useState('')
    const [editHeartRate, setEditHeartRate] = useState('')
    const [editBloodPressure, setEditBloodPressure] = useState('')
    const [editTemperature, setEditTemperature] = useState('')
    const [editMeds, setEditMeds] = useState([])
    const [newEditMedInput, setNewEditMedInput] = useState('')
    const [newDocNote, setNewDocNote] = useState('')

    const fetchData = async (isBackground = false) => {
        try {
            const [patientData, bedData] = await Promise.all([
                getAllPatients(),
                getAllBeds()
            ])
            setPatients(patientData)
            setBeds(bedData)
            
            // Sync selectedPatient details if modal is open
            if (selectedPatient) {
                const currentId = selectedPatient._id || selectedPatient.id
                const updated = patientData.find(p => p._id === currentId || p.id === currentId)
                if (updated) {
                    setSelectedPatient(updated)
                }
            }
        } catch (err) {
            console.error('Fetch data failed', err)
            if (isBackground !== true) {
                alert(err.message || 'Failed to fetch data')
            }
        }
    }

    const openPatientDetails = (patient) => {
        setSelectedPatient(patient)
        setIsEditMode(false)
        setEditName(patient.name || '')
        setEditAge(patient.age || '')
        setEditGender(patient.gender || '')
        setEditProblem(patient.problem || '')
        setEditSinceWhen(patient.sinceWhen || '')
        setEditRoomNumber(patient.roomNumber || '')
        setEditBedNumber(patient.bedNumber || '')
        setEditHeartRate(patient.vitals?.heartRate || '')
        setEditBloodPressure(patient.vitals?.bloodPressure || '')
        setEditTemperature(patient.vitals?.temperature || '')
        setEditMeds(patient.medicines || [])
        setNewEditMedInput('')
        setNewDocNote('')
    }

    const addAdmissionMed = () => {
        if (!newMedInput.trim()) return
        if (medsList.includes(newMedInput.trim())) {
            alert('Medicine already added')
            return
        }
        setMedsList([...medsList, newMedInput.trim()])
        setNewMedInput('')
    }

    const removeAdmissionMed = (indexToRemove) => {
        setMedsList(medsList.filter((_, idx) => idx !== indexToRemove))
    }

    const addEditMed = () => {
        if (!newEditMedInput.trim()) return
        if (editMeds.includes(newEditMedInput.trim())) {
            alert('Medicine already exists')
            return
        }
        setEditMeds([...editMeds, newEditMedInput.trim()])
        setNewEditMedInput('')
    }

    const removeEditMed = (indexToRemove) => {
        setEditMeds(editMeds.filter((_, idx) => idx !== indexToRemove))
    }

    const admit = async () => {
        let assignedBedNumber = ''
        if (bedNumber) {
            if (['general', 'icu', 'emergency'].includes(bedNumber)) {
                const vacantBed = beds.find(b => b.type === bedNumber && b.status === 'available')
                if (!vacantBed) {
                    alert(`No available vacant beds in the ${bedNumber.toUpperCase()} ward. Patient will be placed in the queue.`)
                } else {
                    assignedBedNumber = vacantBed.number
                }
            } else if (bedNumber === 'auto') {
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
                assignedBedNumber = bedNumber
            }
        }
        try {
            const initialHistory = []
            if (initialNote.trim()) {
                const timestamp = new Date().toLocaleString()
                initialHistory.push(`[${timestamp}] Admitted: ${initialNote.trim()}`)
            }

            const payload = {
                name,
                age: Number(age) || null,
                gender,
                problem,
                sinceWhen,
                roomNumber,
                bedNumber: assignedBedNumber || bedNumber,
                vitals: {
                    heartRate: Number(heartRate) || null,
                    bloodPressure: bloodPressure,
                    temperature: Number(temperature) || null
                },
                medicines: medsList,
                history: initialHistory
            }

            await createPatient(payload)
            
            // Clear admission inputs
            setName(''); setAge(''); setGender(''); setProblem(''); setBedNumber('auto');
            setSinceWhen(''); setRoomNumber(''); setHeartRate(''); setBloodPressure(''); setTemperature('');
            setMedsList([]); setNewMedInput(''); setInitialNote('');
            
            await fetchData(true)
        } catch (err) { alert(err.message || 'Error admitting patient') }
    }

    const addDoctorNote = async () => {
        if (!newDocNote.trim()) return
        const timestamp = new Date().toLocaleString()
        const noteWithTime = `[${timestamp}] Dr. Note: ${newDocNote.trim()}`
        const updatedHistory = [noteWithTime, ...(selectedPatient.history || [])]
        
        try {
            const updatedData = await updatePatient(selectedPatient._id || selectedPatient.id, {
                history: updatedHistory
            })
            
            setSelectedPatient(updatedData)
            setNewDocNote('')
            await fetchData(true)
        } catch (err) {
            alert(err.message || 'Failed to add note')
        }
    }

    const savePatientChanges = async () => {
        try {
            if (editBedNumber && editBedNumber !== selectedPatient.bedNumber) {
                const bed = beds.find(b => b.number === editBedNumber)
                if (bed && bed.status === 'occupied' && bed.patientId !== (selectedPatient._id || selectedPatient.id)) {
                    alert('The selected bed is already occupied by another patient.')
                    return
                }
            }

            const updatedPatient = {
                name: editName,
                age: Number(editAge) || null,
                gender: editGender,
                problem: editProblem,
                sinceWhen: editSinceWhen,
                roomNumber: editRoomNumber,
                bedNumber: editBedNumber,
                vitals: {
                    heartRate: Number(editHeartRate) || null,
                    bloodPressure: editBloodPressure,
                    temperature: Number(editTemperature) || null
                },
                medicines: editMeds
            }

            const updatedData = await updatePatient(selectedPatient._id || selectedPatient.id, updatedPatient)
            setSelectedPatient(updatedData)
            setIsEditMode(false)
            await fetchData(true)
            alert('Patient record updated successfully')
        } catch (err) {
            alert(err.message || 'Failed to update patient details')
        }
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            alert('Please login first')
            nav('/login/doctor')
            return
        }
        fetchData()

        // Set up real-time listeners for live updates
        const unsubPatients = onPatientsSnapshot((patientData) => {
            setPatients(patientData)
        })
        const unsubBeds = onBedsSnapshot((bedData) => {
            setBeds(bedData)
        })

        return () => {
            unsubPatients()
            unsubBeds()
        }
    }, [])

    const summary = {
        totalPatients: patients.length,
        totalBeds: beds.length,
        occupied: beds.filter(b => b.status === 'occupied').length,
        available: beds.filter(b => b.status === 'available').length,
        maintenance: beds.filter(b => b.status === 'maintenance').length,
        icu: beds.filter(b => b.type === 'icu').length,
        emergency: beds.filter(b => b.type === 'emergency').length
    }

    const alertMessages = []
    if (summary.available <= 5) {
        alertMessages.push({
            type: 'critical',
            message: `Critical capacity: Only ${summary.available} beds left vacant.`
        })
    }
    if (summary.maintenance >= 4) {
        alertMessages.push({
            type: 'warning',
            message: `Notice: ${summary.maintenance} beds currently offline for maintenance.`
        })
    }
    
    // Add real-time patient alerts for critical vitals and complaints
    patients.forEach(p => {
        const hr = Number(p.vitals?.heartRate)
        const temp = Number(p.vitals?.temperature)
        
        if (hr > 100 || temp > 38 || (hr < 50 && hr > 0) || (temp < 35 && temp > 0)) {
            let detail = []
            if (hr > 100) detail.push(`High HR: ${hr} bpm`)
            if (hr < 50 && hr > 0) detail.push(`Low HR: ${hr} bpm`)
            if (temp > 38) detail.push(`Fever: ${temp}°C`)
            if (temp < 35 && temp > 0) detail.push(`Hypothermia: ${temp}°C`)
            
            alertMessages.push({
                type: 'danger',
                message: `🚨 Critical Vitals: ${p.name} (Bed: ${p.bedNumber || 'Queue'}) - ${detail.join(', ')}`
            })
        } else if (p.problem && (p.problem.toLowerCase().includes('chest') || p.problem.toLowerCase().includes('heart') || p.problem.toLowerCase().includes('breath') || p.problem.toLowerCase().includes('severe') || p.problem.toLowerCase().includes('fever'))) {
            alertMessages.push({
                type: 'danger',
                message: `⚠️ Alert: ${p.name} (Bed: ${p.bedNumber || 'Queue'}) - High-risk problem: "${p.problem}"`
            })
        }
    })

    const filteredBeds = selectedWard === 'all' ? beds : beds.filter(b => b.type === selectedWard)

    return (
        <div className="container py-4">
            <header className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h2>Doctor Dashboard</h2>
                    <p className="text-muted">Oversee hospital operations, review patient history, and manage bed capacity from one command center.</p>
                </div>
                <div className="d-flex gap-2 align-items-center flex-wrap">
                    <button className="btn btn-primary d-flex align-items-center gap-1.5 fw-bold" onClick={() => setShowAdmissionModal(true)}>
                        ➕ Admit Patient
                    </button>
                    <button className="btn btn-outline-primary" onClick={() => fetchData(false)}>Refresh Data</button>
                </div>
            </header>

            <div className="row g-3 mb-4">
                {[
                    { label: 'Total Patients', value: summary.totalPatients, theme: 'primary' },
                    { label: 'Beds Occupied', value: summary.occupied, theme: 'danger' },
                    { label: 'Available Beds', value: summary.available, theme: 'success' },
                    { label: 'Maintenance', value: summary.maintenance, theme: 'warning' }
                ].map(card => (
                    <div className="col-sm-6 col-xl-3" key={card.label}>
                        <div className={`card summary-card border-start border-${card.theme} p-3 h-100`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase text-muted mb-2">{card.label}</h6>
                                    <h3>{card.value}</h3>
                                </div>
                                <span className={`badge bg-${card.theme} rounded-pill py-2 px-3`}>{card.theme}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="row gx-4 gy-4">
                <div className="col-xl-4">
                    <div className="card glass p-4 shadow-sm">
                        <h5 className="mb-3">Operational Alerts</h5>
                        {alertMessages.length ? (
                            <ul className="list-group list-group-flush" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                {alertMessages.map((alert, idx) => (
                                    <li key={idx} className="list-group-item bg-transparent px-0 py-2 border-0">
                                        <div className="d-flex align-items-center gap-2 p-2.5 rounded-3" style={{ 
                                            background: alert.type === 'critical' || alert.type === 'danger' ? 'rgba(244, 63, 94, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                            border: alert.type === 'critical' || alert.type === 'danger' ? '1px solid rgba(244, 63, 94, 0.15)' : '1px solid rgba(245, 158, 11, 0.15)',
                                            color: alert.type === 'critical' || alert.type === 'danger' ? '#e11d48' : '#d97706',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            lineHeight: 1.4
                                        }}>
                                            {alert.message}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted small mb-0">🟢 No operational or clinical alerts right now. All facilities normal.</p>
                        )}
                    </div>
                </div>
                <div className="col-xl-8">
                    <div className="card glass p-4 shadow-sm">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 className="mb-1">Bed Capacity Overview</h5>
                                <p className="text-muted mb-0">Inspect wards by status and track capacity at a glance.</p>
                            </div>
                            <select className="form-select w-auto" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
                                <option value="all">All Wards</option>
                                <option value="general">General</option>
                                <option value="icu">ICU</option>
                                <option value="emergency">Emergency</option>
                            </select>
                        </div>
                        <div className="row g-3">
                            {filteredBeds.filter(bed => bed.status === 'occupied').length === 0 ? (
                                <div className="col-12 text-center text-muted py-5 bg-light rounded-3">
                                    <span style={{ fontSize: '2.5rem' }}>🛏️</span>
                                    <p className="mt-2 mb-0 fw-bold">No beds are currently occupied.</p>
                                </div>
                            ) : (
                                filteredBeds.filter(bed => bed.status === 'occupied').map(bed => {
                                    const tone = bed.status === 'available' ? 'success' : bed.status === 'occupied' ? 'danger' : 'warning'
                                    const patientObj = typeof bed.patientId === 'object' ? bed.patientId : patients.find(p => p._id === bed.patientId || p.id === bed.patientId);
                                    return (
                                        <div className="col-sm-6" key={bed._id || bed.id}>
                                            <div className={`bed-card border-start border-4 border-${tone} p-3`}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="mb-1 fw-bold">{bed.number}</h6>
                                                        <small className="text-muted">{bed.ward} • {bed.type.toUpperCase()}</small>
                                                    </div>
                                                    <span className={`badge bg-${tone}`}>{bed.status}</span>
                                                </div>
                                                <p className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                                    👤 Patient: {patientObj ? patientObj.name : 'Allocated'}
                                                </p>
                                                {patientObj && patientObj.problem && (
                                                    <p className="mb-0 text-danger small fw-semibold">
                                                        ⚠️ Complaint: {patientObj.problem}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card glass p-4 shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h5 className="mb-1">Patient Records</h5>
                        <p className="text-muted mb-0">Review patient details, history, and bed assignments.</p>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table table-borderless align-middle mb-0">
                        <thead>
                            <tr className="text-muted small text-uppercase">
                                <th>Name</th>
                                <th>Bed</th>
                                <th>Ward</th>
                                <th>Vitals</th>
                                <th>History</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(patient => (
                                <tr key={patient._id} className="align-middle hover-bg" onClick={() => openPatientDetails(patient)} style={{ cursor: 'pointer' }}>
                                    <td><strong>{patient.name}</strong></td>
                                    <td>{patient.bedNumber || 'Unassigned'}</td>
                                    <td>{beds.find(b => b.number === patient.bedNumber)?.ward || 'N/A'}</td>
                                    <td>{patient.vitals?.heartRate || '—'} bpm / {patient.vitals?.temperature || '—'}°C</td>
                                    <td>
                                        <button className="btn btn-xs btn-outline-primary rounded-pill px-2.5 py-1 fw-bold" onClick={(e) => { e.stopPropagation(); openPatientDetails(patient); }}>
                                            🔍 View {patient.history?.length || 0} notes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                    <div className="glass-card p-4 mx-auto portal-selection-card animate-fade-in-up" 
                         style={{ 
                             maxWidth: 720, 
                             width: '100%',
                             background: 'rgba(255, 255, 255, 0.95)', 
                             borderRadius: '1.25rem',
                             boxShadow: '0 25px 50px -12px rgba(31, 38, 135, 0.15)',
                             border: '1px solid rgba(255, 255, 255, 0.6)',
                             maxHeight: '90vh',
                             overflowY: 'auto'
                         }}
                         onClick={e => e.stopPropagation()}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
                            <h4 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: 'hsl(var(--text-dark))', fontSize: '1.35rem' }}>
                                📑 Admit New Patient (Detailed Admission)
                            </h4>
                            <button className="btn btn-sm btn-light rounded-circle" 
                                    onClick={() => setShowAdmissionModal(false)}
                                    style={{ width: 32, height: 32, padding: 0 }}>
                                ✕
                            </button>
                        </div>
                        
                        <div className="row g-4">
                            {/* Left Column: Demographics & Complaint */}
                            <div className="col-md-6">
                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-1">👤 Demographics & Room Details</h6>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted mb-1">PATIENT FULL NAME</label>
                                    <input className="form-control form-control-premium" 
                                           value={name} 
                                           onChange={e => setName(e.target.value)} 
                                           placeholder="Enter full name" />
                                </div>
                                
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted mb-1">AGE</label>
                                        <input className="form-control form-control-premium" 
                                               type="number" 
                                               value={age} 
                                               onChange={e => setAge(e.target.value)} 
                                               placeholder="Age" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted mb-1">GENDER</label>
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

                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted mb-1">ROOM NUMBER</label>
                                        <input className="form-control form-control-premium" 
                                               value={roomNumber} 
                                               onChange={e => setRoomNumber(e.target.value)} 
                                               placeholder="e.g. 302-A" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-bold text-muted mb-1">ALLOT BED / WARD</label>
                                        <select className="form-select form-control-premium"
                                                value={bedNumber}
                                                onChange={e => setBedNumber(e.target.value)}
                                        >
                                            <option value="auto">Auto-Assign (Based on Problem)</option>
                                            <option value="">-- No Bed (Queue Only) --</option>
                                            <option value="general">Auto-Assign General Bed</option>
                                            <option value="icu">Auto-Assign ICU Bed</option>
                                            <option value="emergency">Auto-Assign Emergency Bed</option>
                                            {beds.filter(b => b.status === 'available').map(b => (
                                                <option key={b.id || b.number} value={b.number}>
                                                    Bed {b.number} ({b.type.toUpperCase()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-1 mt-4">📋 Complaint / History</h6>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted mb-1">CHIEF COMPLAINT / PROBLEM</label>
                                    <input className="form-control form-control-premium" 
                                           value={problem} 
                                           onChange={e => setProblem(e.target.value)} 
                                           placeholder="e.g. Severe chest pain, fever" />
                                    {(() => {
                                        const recommendation = recommendWardByCondition(problem);
                                        if (!recommendation) return null;
                                        const isAvailable = beds.some(b => b.type === recommendation.type && b.status === 'available');
                                        return (
                                            <div className="mt-2 p-2 rounded-3 small border" style={{
                                                background: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.08)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                                                borderColor: recommendation.type === 'icu' ? 'rgba(244, 63, 94, 0.15)' : recommendation.type === 'emergency' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                color: recommendation.type === 'icu' ? '#e11d48' : recommendation.type === 'emergency' ? '#d97706' : '#10b981',
                                                fontWeight: 600
                                            }}>
                                                🩺 Triaged Ward: {recommendation.name} ({isAvailable ? 'Vacant bed available' : 'No vacant beds, will queue'})
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted mb-1">FROM WHEN IS THE ISSUE (ONSET)</label>
                                    <input className="form-control form-control-premium" 
                                           value={sinceWhen} 
                                           onChange={e => setSinceWhen(e.target.value)} 
                                           placeholder="e.g. 2 hours ago, since last night" />
                                </div>
                            </div>

                            {/* Right Column: Vitals, Meds, Initial Notes */}
                            <div className="col-md-6">
                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-1">🌡️ Initial Vitals Monitoring</h6>
                                <div className="row g-2 mb-3">
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>HEART RATE (BPM)</label>
                                        <input className="form-control form-control-premium" 
                                               type="number" 
                                               value={heartRate} 
                                               onChange={e => setHeartRate(e.target.value)} 
                                               placeholder="e.g. 72" />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>BP (MMHG)</label>
                                        <input className="form-control form-control-premium" 
                                               value={bloodPressure} 
                                               onChange={e => setBloodPressure(e.target.value)} 
                                               placeholder="e.g. 120/80" />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>TEMP (°C)</label>
                                        <input className="form-control form-control-premium" 
                                               type="number" 
                                               step="0.1" 
                                               value={temperature} 
                                               onChange={e => setTemperature(e.target.value)} 
                                               placeholder="e.g. 36.8" />
                                    </div>
                                </div>

                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-1 mt-4">💊 Initial Medications Schedule</h6>
                                <div className="bg-light p-3 rounded-3 mb-3">
                                    <div className="input-group mb-2">
                                        <input className="form-control border-0 bg-white" 
                                               placeholder="Type medication name..." 
                                               value={newMedInput} 
                                               onChange={e => setNewMedInput(e.target.value)} 
                                               onKeyDown={e => e.key === 'Enter' && addAdmissionMed()} />
                                        <button className="btn btn-primary" type="button" onClick={addAdmissionMed}>Add</button>
                                    </div>
                                    <div className="d-flex flex-wrap gap-1.5 mt-2">
                                        {medsList.length > 0 ? (
                                            medsList.map((med, idx) => (
                                                <span key={idx} className="badge bg-white text-dark shadow-sm border py-1.5 px-2.5 rounded-pill d-flex align-items-center gap-1.5">
                                                    🧪 {med}
                                                    <button type="button" className="btn-close" style={{ fontSize: '0.55rem' }} onClick={() => removeAdmissionMed(idx)}></button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted small">No medications added yet.</span>
                                        )}
                                    </div>
                                </div>

                                <h6 className="fw-bold text-secondary mb-3 border-bottom pb-1 mt-4">📝 Initial Progress Note</h6>
                                <div className="mb-3">
                                    <textarea className="form-control form-control-premium" 
                                              rows="3" 
                                              value={initialNote} 
                                              onChange={e => setInitialNote(e.target.value)} 
                                              placeholder="Write initial diagnostic/admission notes..." />
                                </div>
                            </div>
                        </div>
                        
                        <div className="d-flex gap-3 mt-4 pt-3 border-top border-light">
                            <button className="btn btn-outline-secondary w-50 py-2.5 fw-bold rounded-pill" onClick={() => setShowAdmissionModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-premium w-50 py-2.5 fw-bold rounded-pill" 
                                    style={{ 
                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.9rem'
                                    }}
                                    onClick={async () => {
                                        await admit();
                                        setShowAdmissionModal(false);
                                    }}>
                                Complete Admission ⚡
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Glassmorphic Patient Details Modal Overlay */}
            {selectedPatient && (
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
                     onClick={() => setSelectedPatient(null)}
                >
                    <div className="glass-card p-4 mx-auto portal-selection-card animate-fade-in-up" 
                         style={{ 
                             maxWidth: 650, 
                             width: '100%',
                             background: 'rgba(255, 255, 255, 0.98)', 
                             borderRadius: '1.25rem',
                             boxShadow: '0 25px 50px -12px rgba(31, 38, 135, 0.15)',
                             border: '1px solid rgba(255, 255, 255, 0.6)',
                             maxHeight: '90vh',
                             overflowY: 'auto'
                         }}
                         onClick={e => e.stopPropagation()}
                    >
                        {!isEditMode ? (
                            /* VIEW MODE */
                            <div>
                                {/* Modal Header */}
                                <div className="d-flex justify-content-between align-items-start mb-4 pb-2 border-bottom border-light">
                                    <div>
                                        <h4 className="fw-extrabold mb-1 d-flex align-items-center gap-2" style={{ color: 'hsl(var(--text-dark))', fontSize: '1.4rem' }}>
                                            👤 {selectedPatient.name}
                                            <button className="btn btn-sm btn-outline-primary py-0.5 px-2 rounded-pill fw-bold" 
                                                    style={{ fontSize: '0.75rem' }} 
                                                    onClick={() => setIsEditMode(true)}>
                                                ✏️ Edit Details
                                            </button>
                                        </h4>
                                        <span className="badge bg-primary rounded-pill me-2">
                                            {selectedPatient.gender}, {selectedPatient.age} Years Old
                                        </span>
                                        <span className="badge bg-secondary rounded-pill me-2">
                                            Room: {selectedPatient.roomNumber || 'N/A'}
                                        </span>
                                        <span className="badge bg-secondary rounded-pill">
                                            Bed: {selectedPatient.bedNumber || 'Unassigned'}
                                        </span>
                                    </div>
                                    <button className="btn btn-sm btn-light rounded-circle" 
                                            onClick={() => setSelectedPatient(null)}
                                            style={{ width: 32, height: 32, padding: 0 }}>
                                        ✕
                                    </button>
                                </div>

                                {/* Complaint & Placement */}
                                <div className="row g-3 mb-4">
                                    <div className="col-sm-6">
                                        <h6 className="fw-bold text-secondary mb-1">📋 Chief Complaint</h6>
                                        <p className="p-3 bg-light rounded-3 mb-0 text-dark fw-semibold" style={{ fontSize: '0.9rem' }}>
                                            {selectedPatient.problem ? `⚠️ ${selectedPatient.problem}` : 'No complaint registered.'}
                                        </p>
                                    </div>
                                    <div className="col-sm-6">
                                        <h6 className="fw-bold text-secondary mb-1">⏱️ Issue Duration / Onset</h6>
                                        <p className="p-3 bg-light rounded-3 mb-0 text-dark fw-semibold" style={{ fontSize: '0.9rem' }}>
                                            {selectedPatient.sinceWhen ? `⏳ ${selectedPatient.sinceWhen}` : 'Not recorded.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Vitals */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-secondary mb-2.5">Live Telemetry & Vitals</h6>
                                    <div className="row g-2">
                                        <div className="col-4">
                                            <div className="bg-light p-2.5 rounded-3 text-center border-start border-3 border-danger">
                                                <div className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>HEART RATE</div>
                                                <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.98rem' }}>
                                                    ❤️ {selectedPatient.vitals?.heartRate ? `${selectedPatient.vitals.heartRate} bpm` : '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-light p-2.5 rounded-3 text-center border-start border-3 border-primary">
                                                <div className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>BLOOD PRESSURE</div>
                                                <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.98rem' }}>
                                                    🩸 {selectedPatient.vitals?.bloodPressure || '—'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="bg-light p-2.5 rounded-3 text-center border-start border-3 border-warning">
                                                <div className="text-muted small fw-bold" style={{ fontSize: '0.68rem' }}>TEMPERATURE</div>
                                                <div className="fw-bold text-dark mt-1" style={{ fontSize: '0.98rem' }}>
                                                    🌡️ {selectedPatient.vitals?.temperature ? `${selectedPatient.vitals.temperature} °C` : '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Medications */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-secondary mb-2">💊 Scheduled Medications</h6>
                                    <div className="d-flex flex-wrap gap-1.5 p-2 bg-light rounded-3">
                                        {selectedPatient.medicines && selectedPatient.medicines.length > 0 ? (
                                            selectedPatient.medicines.map((med, idx) => (
                                                <span key={idx} className="badge bg-white text-dark border py-1.5 px-2.5 rounded-pill shadow-sm" style={{ fontSize: '0.78rem' }}>
                                                    🧪 {med}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-muted small p-1">No scheduled medications.</span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Notes & Logs */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-secondary mb-2">📝 Clinical Progress Notes & Logs</h6>
                                    <div className="overflow-auto border rounded bg-white p-2.5 mb-3" style={{ maxHeight: '160px' }}>
                                        {selectedPatient.history && selectedPatient.history.length > 0 ? (
                                            <ul className="list-group list-group-flush">
                                                {selectedPatient.history.map((note, idx) => (
                                                    <li key={idx} className="list-group-item py-2 border-0 border-bottom text-dark" style={{ fontSize: '0.86rem' }}>
                                                        {note}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="text-muted text-center py-4 small">No progress notes logged yet.</div>
                                        )}
                                    </div>

                                    {/* Add Doctor Note Input */}
                                    <div className="input-group">
                                        <input className="form-control border-0 bg-light" 
                                               placeholder="Append a new clinical progression note..." 
                                               value={newDocNote} 
                                               onChange={e => setNewDocNote(e.target.value)}
                                               onKeyDown={e => e.key === 'Enter' && addDoctorNote()} />
                                        <button className="btn btn-primary fw-bold" onClick={addDoctorNote}>
                                            Log Note 📝
                                        </button>
                                    </div>
                                </div>

                                {/* Close button */}
                                <div className="d-grid mt-4">
                                    <button className="btn btn-outline-secondary py-2.5 fw-bold rounded-pill" onClick={() => setSelectedPatient(null)}>
                                        Close Record
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* EDIT MODE */
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-light">
                                    <h4 className="fw-extrabold mb-0 d-flex align-items-center gap-2" style={{ color: 'hsl(var(--text-dark))', fontSize: '1.35rem' }}>
                                        ✏️ Edit Patient Record: {selectedPatient.name}
                                    </h4>
                                    <button className="btn btn-sm btn-light rounded-circle" onClick={() => setIsEditMode(false)}>✕</button>
                                </div>

                                <div className="row g-3">
                                    {/* Name & Demographics */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted mb-1">PATIENT FULL NAME</label>
                                        <input className="form-control form-control-premium" value={editName} onChange={e => setEditName(e.target.value)} />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-bold text-muted mb-1">AGE</label>
                                        <input className="form-control form-control-premium" type="number" value={editAge} onChange={e => setEditAge(e.target.value)} />
                                    </div>
                                    <div className="col-6 col-md-3">
                                        <label className="form-label small fw-bold text-muted mb-1">GENDER</label>
                                        <select className="form-select form-control-premium" value={editGender} onChange={e => setEditGender(e.target.value)}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    {/* Complaint & Duration */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted mb-1">CHIEF COMPLAINT / PROBLEM</label>
                                        <input className="form-control form-control-premium" value={editProblem} onChange={e => setEditProblem(e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted mb-1">FROM WHEN IS THE ISSUE (ONSET)</label>
                                        <input className="form-control form-control-premium" value={editSinceWhen} onChange={e => setEditSinceWhen(e.target.value)} />
                                    </div>

                                    {/* Room & Bed Selection */}
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted mb-1">ROOM NUMBER</label>
                                        <input className="form-control form-control-premium" value={editRoomNumber} onChange={e => setEditRoomNumber(e.target.value)} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted mb-1">BED SELECTION</label>
                                        <select className="form-select form-control-premium" value={editBedNumber} onChange={e => setEditBedNumber(e.target.value)}>
                                            <option value="">Unassigned (Queue)</option>
                                            {selectedPatient.bedNumber && (
                                                <option value={selectedPatient.bedNumber}>Current Bed: {selectedPatient.bedNumber}</option>
                                            )}
                                            {beds.filter(b => b.status === 'available' && b.number !== selectedPatient.bedNumber).map(b => (
                                                <option key={b.id || b.number} value={b.number}>
                                                    Bed {b.number} ({b.type.toUpperCase()} - {b.ward})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Vitals Form */}
                                    <div className="col-12 mt-4">
                                        <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">📊 Clinical Vitals</h6>
                                        <div className="row g-2">
                                            <div className="col-4">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>HEART RATE (BPM)</label>
                                                <input className="form-control form-control-premium" type="number" value={editHeartRate} onChange={e => setEditHeartRate(e.target.value)} />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>BP (MMHG)</label>
                                                <input className="form-control form-control-premium" value={editBloodPressure} onChange={e => setEditBloodPressure(e.target.value)} />
                                            </div>
                                            <div className="col-4">
                                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.65rem' }}>TEMP (°C)</label>
                                                <input className="form-control form-control-premium" type="number" step="0.1" value={editTemperature} onChange={e => setEditTemperature(e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medications Form */}
                                    <div className="col-12 mt-4">
                                        <h6 className="fw-bold text-secondary mb-2 border-bottom pb-1">💊 Prescribed Medications</h6>
                                        <div className="bg-light p-3 rounded-3">
                                            <div className="input-group mb-2">
                                                <input className="form-control border-0 bg-white" placeholder="Add medication name..." value={newEditMedInput} onChange={e => setNewEditMedInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEditMed()} />
                                                <button className="btn btn-primary" type="button" onClick={addEditMed}>Add</button>
                                            </div>
                                            <div className="d-flex flex-wrap gap-1.5 mt-2">
                                                {editMeds.length > 0 ? (
                                                    editMeds.map((med, idx) => (
                                                        <span key={idx} className="badge bg-white text-dark shadow-sm border py-1.5 px-2.5 rounded-pill d-flex align-items-center gap-1.5">
                                                            🧪 {med}
                                                            <button type="button" className="btn-close" style={{ fontSize: '0.55rem' }} onClick={() => removeEditMed(idx)}></button>
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-muted small">No medications scheduled.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-3 mt-4 pt-3 border-top border-light">
                                    <button className="btn btn-outline-secondary w-50 py-2.5 fw-bold rounded-pill" onClick={() => setIsEditMode(false)}>
                                        Cancel
                                    </button>
                                    <button className="btn btn-success w-50 py-2.5 fw-bold rounded-pill" onClick={savePatientChanges}>
                                        Save Changes 💾
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
