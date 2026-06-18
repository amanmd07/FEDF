import React, { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPatients, getAllBeds, createPatient, updatePatient, dischargePatient as dischargePatientService, createBed, updateBed, deleteBed as deleteBedService, onPatientsSnapshot, onBedsSnapshot } from '../firestoreService'

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

export default function NurseDashboard() {
    const nav = useNavigate()
    const [patients, setPatients] = useState([])
    const [beds, setBeds] = useState([])
    const [activePatient, setActivePatient] = useState(null)
    const [activeTab, setActiveTab] = useState('patients') // 'patients' or 'beds'

    // Patient care states
    const [vitals, setVitals] = useState({ heartRate: '', bloodPressure: '', temperature: '' })
    const [patientName, setPatientName] = useState('')
    const [patientAge, setPatientAge] = useState('')
    const [patientGender, setPatientGender] = useState('')
    const [patientRoomNumber, setPatientRoomNumber] = useState('')
    const [patientBedNumber, setPatientBedNumber] = useState('')
    const [patientMedicines, setPatientMedicines] = useState([])
    const [patientHistory, setPatientHistory] = useState([])
    const [newMedicine, setNewMedicine] = useState('')
    const [newHistoryNote, setNewHistoryNote] = useState('')

    // Bed management states
    const [bedNumber, setBedNumber] = useState('')
    const [bedWard, setBedWard] = useState('Ward 1')
    const [bedType, setBedType] = useState('general')
    const [bedStatus, setBedStatus] = useState('available')
    const [editingBed, setEditingBed] = useState(null) // null or Bed object
    const [bedSearch, setBedSearch] = useState('')
    const [targetCapacity, setTargetCapacity] = useState('')
    const [bedFilter, setBedFilter] = useState('all') // 'all', 'occupied', 'available'

    // Patient search state
    const [search, setSearch] = useState('')

    // Auto-sync status state
    const [autoSync, setAutoSync] = useState(true)

    const activePatientRef = useRef(activePatient)
    useEffect(() => { activePatientRef.current = activePatient }, [activePatient])

    const fetchData = async (isBackground = false) => {
        try {
            const [patientData, bedData] = await Promise.all([
                getAllPatients(),
                getAllBeds()
            ])
            setPatients(patientData)
            setBeds(bedData)
            setTargetCapacity(prev => prev === '' ? bedData.length : prev)

            // Update selected active patient if already set
            const currentActive = activePatientRef.current
            if (currentActive) {
                const updated = patientData.find(p => p._id === currentActive._id || p.id === currentActive._id);
                if (updated) {
                    setVitals({
                        heartRate: updated.vitals?.heartRate || '',
                        bloodPressure: updated.vitals?.bloodPressure || '',
                        temperature: updated.vitals?.temperature || ''
                    })
                    setPatientName(updated.name || '')
                    setPatientAge(updated.age || '')
                    setPatientGender(updated.gender || '')
                    setPatientRoomNumber(updated.roomNumber || '')
                    setPatientBedNumber(updated.bedNumber || '')
                    setPatientMedicines(updated.medicines || [])
                    setPatientHistory(updated.history || [])
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err)
            if (isBackground !== true) {
                alert(err.message || 'Failed to fetch data')
            }
        }
    }

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            alert('Please login first')
            nav('/login/nurse')
            return
        }
        fetchData(false)

        let unsubPatients;
        let unsubBeds;
        if (autoSync) {
            unsubPatients = onPatientsSnapshot((patientData) => {
                setPatients(patientData)
                const currentActive = activePatientRef.current
                if (currentActive) {
                    const updated = patientData.find(p => p._id === currentActive._id || p.id === currentActive._id);
                    if (updated) {
                        setVitals({
                            heartRate: updated.vitals?.heartRate || '',
                            bloodPressure: updated.vitals?.bloodPressure || '',
                            temperature: updated.vitals?.temperature || ''
                        })
                        setPatientName(updated.name || '')
                        setPatientAge(updated.age || '')
                        setPatientGender(updated.gender || '')
                        setPatientRoomNumber(updated.roomNumber || '')
                        setPatientBedNumber(updated.bedNumber || '')
                        setPatientMedicines(updated.medicines || [])
                        setPatientHistory(updated.history || [])
                    }
                }
            })
            unsubBeds = onBedsSnapshot((bedData) => {
                setBeds(bedData)
                setTargetCapacity(prev => prev === '' ? bedData.length : prev)
            })
        }

        return () => {
            if (unsubPatients) unsubPatients();
            if (unsubBeds) unsubBeds();
        };
    }, [autoSync])

    const [admissionName, setAdmissionName] = useState('')
    const [admissionAge, setAdmissionAge] = useState('')
    const [admissionGender, setAdmissionGender] = useState('')
    const [admissionProblem, setAdmissionProblem] = useState('')
    const [admissionBedNumber, setAdmissionBedNumber] = useState('auto')
    const [showAdmissionModal, setShowAdmissionModal] = useState(false)

    const admit = async () => {
        let assignedBedNumber = ''
        if (admissionBedNumber) {
            if (['general', 'icu', 'emergency'].includes(admissionBedNumber)) {
                const vacantBed = beds.find(b => b.type === admissionBedNumber && b.status === 'available')
                if (!vacantBed) {
                    alert(`No available vacant beds in the ${admissionBedNumber.toUpperCase()} ward. Patient will be placed in the queue.`)
                } else {
                    assignedBedNumber = vacantBed.number
                }
            } else if (admissionBedNumber === 'auto') {
                const recommendation = recommendWardByCondition(admissionProblem);
                const targetType = recommendation ? recommendation.type : 'general';
                const vacantBed = beds.find(b => b.type === targetType && b.status === 'available')
                if (!vacantBed) {
                    alert(`No available vacant beds in the ${targetType.toUpperCase()} ward. Patient will be placed in the queue.`)
                    assignedBedNumber = '';
                } else {
                    assignedBedNumber = vacantBed.number
                }
            } else {
                assignedBedNumber = admissionBedNumber
            }
        }
        try {
            await createPatient({ 
                name: admissionName, 
                age: Number(admissionAge) || null, 
                gender: admissionGender, 
                problem: admissionProblem, 
                bedNumber: assignedBedNumber || admissionBedNumber 
            })
            setAdmissionName(''); 
            setAdmissionAge(''); 
            setAdmissionGender(''); 
            setAdmissionProblem(''); 
            setAdmissionBedNumber('auto');
            await fetchData()
        } catch (err) { 
            alert(err.message || 'Error admitting patient') 
        }
    }

    const onSelectPatient = (patient) => {
        setActivePatient(patient)
        setVitals({
            heartRate: patient.vitals?.heartRate || '',
            bloodPressure: patient.vitals?.bloodPressure || '',
            temperature: patient.vitals?.temperature || ''
        })
        setPatientName(patient.name || '')
        setPatientAge(patient.age || '')
        setPatientGender(patient.gender || '')
        setPatientRoomNumber(patient.roomNumber || '')
        setPatientBedNumber(patient.bedNumber || '')
        setPatientMedicines(patient.medicines || [])
        setPatientHistory(patient.history || [])
        setNewMedicine('')
        setNewHistoryNote('')
    }

    const savePatient = async () => {
        if (!activePatient) return
        try {
            const updatedPatient = {
                name: patientName,
                age: Number(patientAge) || null,
                gender: patientGender,
                roomNumber: patientRoomNumber,
                bedNumber: patientBedNumber,
                vitals: {
                    heartRate: Number(vitals.heartRate) || null,
                    bloodPressure: vitals.bloodPressure,
                    temperature: Number(vitals.temperature) || null
                },
                medicines: patientMedicines,
                history: patientHistory
            }
            await updatePatient(activePatient._id || activePatient.id, updatedPatient)
            await fetchData()
            alert('Patient care record updated successfully')
        } catch (err) {
            alert(err.message || 'Unable to save patient changes')
        }
    }

    const handleDischargePatient = async (patientId) => {
        if (!window.confirm('Are you sure you want to discharge this patient?')) return
        try {
            await dischargePatientService(patientId)
            alert('Patient discharged successfully')
            setActivePatient(null)
            await fetchData()
        } catch (err) {
            alert(err.message || 'Error discharging patient')
        }
    }

    // Medicine controls
    const addMedicine = () => {
        if (!newMedicine.trim()) return
        if (patientMedicines.includes(newMedicine.trim())) {
            alert('Medicine already exists in schedule')
            return
        }
        setPatientMedicines([...patientMedicines, newMedicine.trim()])
        setNewMedicine('')
    }

    const removeMedicine = (indexToRemove) => {
        setPatientMedicines(patientMedicines.filter((_, idx) => idx !== indexToRemove))
    }

    // History controls
    const addHistoryNote = () => {
        if (!newHistoryNote.trim()) return
        const timestamp = new Date().toLocaleString()
        const noteWithTime = `[${timestamp}] ${newHistoryNote.trim()}`
        setPatientHistory([noteWithTime, ...patientHistory])
        setNewHistoryNote('')
    }

    const removeHistoryNote = (indexToRemove) => {
        setPatientHistory(patientHistory.filter((_, idx) => idx !== indexToRemove))
    }

    // Bed Management controls
    const saveBed = async (e) => {
        e.preventDefault()
        if (!bedNumber.trim()) return alert('Please enter a bed number')

        const payload = {
            number: bedNumber.trim(),
            ward: bedWard.trim(),
            type: bedType,
            status: bedStatus
        }

        try {
            if (editingBed) {
                await updateBed(editingBed._id || editingBed.id, payload)
                alert('Bed updated successfully')
                setEditingBed(null)
            } else {
                await createBed(payload)
                alert('New bed registered successfully')
            }
            setBedNumber('')
            setBedWard('Ward 1')
            setBedType('general')
            setBedStatus('available')
            await fetchData()
        } catch (err) {
            alert(err.message || 'Error processing bed save')
        }
    }

    const loadBedToEdit = (bed) => {
        setEditingBed(bed)
        setBedNumber(bed.number || '')
        setBedWard(bed.ward || 'Ward 1')
        setBedType(bed.type || 'general')
        setBedStatus(bed.status || 'available')
    }

    const cancelBedEdit = () => {
        setEditingBed(null)
        setBedNumber('')
        setBedWard('Ward 1')
        setBedType('general')
        setBedStatus('available')
    }

    const handleDeleteBed = async (bedId) => {
        if (!window.confirm('Are you sure you want to decommission and permanently delete this bed?')) return
        try {
            await deleteBedService(bedId)
            alert('Bed deleted successfully')
            await fetchData()
            if (editingBed && (editingBed._id === bedId || editingBed.id === bedId)) {
                cancelBedEdit()
            }
        } catch (err) {
            alert(err.message || 'Error deleting bed')
        }
    }

    const adjustCapacity = async () => {
        if (!targetCapacity || targetCapacity < 0) {
            return alert('Please enter a valid target capacity number');
        }

        const currentCapacity = beds.length;
        const diff = targetCapacity - currentCapacity;

        if (diff === 0) {
            return alert('Capacity is already at the target number');
        }

        try {
            if (diff > 0) {
                // Calculate proportional specialty types: 20% ICU, 20% Emergency, 60% General
                const icuCount = Math.round(diff * 0.2);
                const emergencyCount = Math.round(diff * 0.2);
                const generalCount = diff - icuCount - emergencyCount;

                const typesToAssign = [];
                for (let i = 0; i < icuCount; i++) typesToAssign.push('icu');
                for (let i = 0; i < emergencyCount; i++) typesToAssign.push('emergency');
                for (let i = 0; i < generalCount; i++) typesToAssign.push('general');

                // Add new beds: B-X
                const existingNumbers = new Set(beds.map(b => b.number));
                let addedCount = 0;
                let candidate = 1;
                
                while (addedCount < diff) {
                    const bedNum = `B-${candidate}`;
                    if (!existingNumbers.has(bedNum)) {
                        const bedTypeToAssign = typesToAssign[addedCount] || 'general';
                        await createBed({
                            number: bedNum,
                            ward: 'Ward 1',
                            type: bedTypeToAssign,
                            status: 'available'
                        });
                        addedCount++;
                    }
                    candidate++;
                }
                alert(`Successfully added ${diff} available beds (Allocated: ${icuCount} ICU, ${emergencyCount} Emergency, ${generalCount} General)`);
            } else {
                // Remove beds (diff is negative)
                const toRemoveCount = Math.abs(diff);
                const safeBeds = beds.filter(b => b.status !== 'occupied');
                
                if (safeBeds.length < toRemoveCount) {
                    return alert(`Cannot reduce capacity by ${toRemoveCount} beds. Only ${safeBeds.length} vacant/maintenance beds are available to decommission. Please discharge or relocate patients first.`);
                }
                
                // Decommission beds starting from the highest numerical digits in their name
                const sortedSafeBeds = [...safeBeds].sort((a, b) => {
                    const numA = parseInt(a.number.replace(/\D/g, '')) || 0;
                    const numB = parseInt(b.number.replace(/\D/g, '')) || 0;
                    return numB - numA;
                });

                const bedsToDelete = sortedSafeBeds.slice(0, toRemoveCount);
                
                if (!window.confirm(`Are you sure you want to decommission and permanently delete ${toRemoveCount} vacant/maintenance beds?`)) {
                    return;
                }

                for (const bed of bedsToDelete) {
                    await deleteBedService(bed._id || bed.id);
                }
                alert(`Successfully decommissioned ${toRemoveCount} beds`);
            }
            await fetchData();
        } catch (err) {
            alert(err.message || 'Error adjusting capacity');
        }
    }

    const filteredPatients = patients.filter(patient =>
        (patient.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (patient.bedNumber || '').toLowerCase().includes(search.toLowerCase())
    )

    const filteredBeds = beds.filter(bed => {
        if (bedFilter === 'occupied' && bed.status !== 'occupied') return false
        if (bedFilter === 'available' && bed.status !== 'available') return false
        return (
            (bed.number || '').toLowerCase().includes(bedSearch.toLowerCase()) ||
            (bed.ward || '').toLowerCase().includes(bedSearch.toLowerCase()) ||
            (bed.type || '').toLowerCase().includes(bedSearch.toLowerCase()) ||
            (bed.status || '').toLowerCase().includes(bedSearch.toLowerCase())
        )
    })

    const summary = {
        totalPatients: patients.length,
        totalBeds: beds.length,
        bedsOccupied: beds.filter(b => b.status === 'occupied').length,
        bedsAvailable: beds.filter(b => b.status === 'available').length,
        bedsMaintenance: beds.filter(b => b.status === 'maintenance').length,
        urgentAlerts: patients.filter(p => (Number(p.vitals?.heartRate) > 100 || Number(p.vitals?.temperature) > 38)).length
    }

    const colorForBedStatus = (status) => {
        if (status === 'available') return 'success'
        if (status === 'occupied') return 'danger'
        return 'warning'
    }

    return (
        <div className="container py-4">
            {/* Dashboard Header */}
            <header className="dashboard-header d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                    <h2 className="fw-bold text-primary d-flex align-items-center gap-2">
                        🏥 Nurse Care Command Center
                    </h2>
                    <p className="text-muted">
                        Track vitals, administer medicine schedules, log medical progress history, and manage the hospital bed fleet.
                    </p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                    <div className="form-check form-switch mb-0 me-2 d-flex align-items-center gap-2" style={{ minHeight: 'auto' }}>
                        <span className="badge-live-pulse animate-pulse-slow" style={{
                            background: autoSync ? 'rgba(16, 185, 129, 0.08)' : 'rgba(108, 117, 125, 0.08)',
                            color: autoSync ? '#10b981' : '#6c757d',
                            border: autoSync ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(108, 117, 125, 0.2)',
                            padding: '4px 8px',
                            borderRadius: '5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.65rem',
                            fontWeight: 800
                        }}>
                            <span className={`live-pulse-dot me-1.5 ${autoSync ? '' : 'bg-secondary'}`} style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: autoSync ? '#10b981' : '#6c757d',
                                animation: autoSync ? 'livePulse 1.8s infinite ease-in-out' : 'none'
                            }}></span>
                            LIVE SYNC
                        </span>
                        <input className="form-check-input m-0" type="checkbox" id="nurseSyncSwitch" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} style={{ cursor: 'pointer' }} />
                    </div>
                    <button className="btn btn-primary d-flex align-items-center gap-1.5 fw-bold shadow-sm" onClick={() => setShowAdmissionModal(true)}>
                        ➕ Admit Patient
                    </button>
                    <button className="btn btn-outline-primary shadow-sm" onClick={() => fetchData(false)}>
                        🔄 Refresh Fleet Data
                    </button>
                    <button 
                        className={`btn ${activeTab === 'patients' ? 'btn-primary' : 'btn-outline-secondary'} shadow-sm`}
                        onClick={() => setActiveTab('patients')}
                    >
                        🧑‍⚕️ Patient Care & Rounds
                    </button>
                    <button 
                        className={`btn ${activeTab === 'beds' ? 'btn-primary' : 'btn-outline-secondary'} shadow-sm`}
                        onClick={() => setActiveTab('beds')}
                    >
                        🛏️ Bed Fleet Management
                    </button>
                </div>
            </header>

            {/* Dashboard Statistics Cards */}
            <div className="row g-3 mb-4">
                {[
                    { label: 'Active Patients', value: summary.totalPatients, theme: 'primary', icon: '🧑‍⚕️' },
                    { label: 'Total Beds', value: summary.totalBeds, theme: 'info', icon: '🛏️' },
                    { label: 'Beds Available', value: summary.bedsAvailable, theme: 'success', icon: '🟢' },
                    { label: 'Beds Occupied', value: summary.bedsOccupied, theme: 'danger', icon: '🔴' },
                    { label: 'Maintenance Care', value: summary.bedsMaintenance, theme: 'warning', icon: '🟠' },
                    { label: 'Urgent Patient Alerts', value: summary.urgentAlerts, theme: 'warning', icon: '⚠️' }
                ].map(card => (
                    <div className="col-6 col-md-4 col-xl-2" key={card.label}>
                        <div className={`card summary-card border-0 border-start border-4 border-${card.theme} p-3 h-100 shadow-sm bg-white`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-uppercase text-muted small fw-bold mb-2">{card.label}</h6>
                                    <h3 className="fw-bold mb-0">{card.value}</h3>
                                </div>
                                <span style={{ fontSize: '1.5rem' }}>{card.icon}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === 'patients' ? (
                /* PATIENT CARE AND ROUNDS TAB */
                <div className="row gx-4 gy-4">
                    {/* Patient list sidebar */}
                    <div className="col-xl-4">
                        <div className="card border-0 p-4 shadow-sm bg-white h-100">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div>
                                    <h5 className="fw-bold mb-0">Rounds Checklist</h5>
                                    <p className="text-muted small mb-0">Select a patient to initiate round update.</p>
                                </div>
                                <span className="badge bg-primary rounded-pill">{filteredPatients.length} active</span>
                            </div>
                            <div className="mb-3">
                                <input 
                                    className="form-control bg-light border-0 py-2 px-3 rounded-3" 
                                    placeholder="🔍 Search name or bed number..." 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                />
                            </div>
                            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '550px' }}>
                                {filteredPatients.map(patient => (
                                    <div 
                                        key={patient._id || patient.id} 
                                        className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 p-3 d-flex justify-content-between align-items-center cursor-pointer transition-all ${activePatient?._id === patient._id || activePatient?.id === patient._id ? 'bg-primary text-white' : 'bg-light hover-bg'}`}
                                        onClick={() => onSelectPatient(patient)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div>
                                            <strong className="d-block">{patient.name}</strong>
                                            <small className={activePatient?._id === patient._id || activePatient?.id === patient._id ? 'text-white-50' : 'text-muted'}>
                                                Bed: {patient.bedNumber || 'Unassigned'} • Room: {patient.roomNumber || 'N/A'}
                                            </small>
                                        </div>
                                        <span className={`badge ${activePatient?._id === patient._id || activePatient?.id === patient._id ? 'bg-white text-primary' : 'bg-secondary'} rounded-pill`}>
                                            {patient.gender}, {patient.age}
                                        </span>
                                    </div>
                                ))}
                                {filteredPatients.length === 0 && (
                                    <div className="text-center text-muted py-5 bg-light rounded-3">No matching patients found.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Patient active care editor */}
                    <div className="col-xl-8">
                        <div className="card border-0 p-4 shadow-sm bg-white h-100">
                            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                                🧑‍⚕️ Clinical Care Record & Diagnostics
                            </h5>
                            
                            {activePatient ? (
                                <div>
                                    {/* Patient Info Fields */}
                                    <h6 className="fw-bold text-secondary mb-3 mt-1">📋 Demographics & Bed Placement</h6>
                                    <div className="row g-3 mb-4 bg-light p-3 rounded-3">
                                        <div className="col-md-6 col-lg-4">
                                            <label className="form-label small fw-bold text-muted">Patient Full Name</label>
                                            <input 
                                                className="form-control border-0" 
                                                value={patientName} 
                                                onChange={e => setPatientName(e.target.value)} 
                                            />
                                        </div>
                                        <div className="col-6 col-md-3 col-lg-2">
                                            <label className="form-label small fw-bold text-muted">Age (Years)</label>
                                            <input 
                                                className="form-control border-0" 
                                                type="number" 
                                                value={patientAge} 
                                                onChange={e => setPatientAge(e.target.value)} 
                                            />
                                        </div>
                                        <div className="col-6 col-md-3 col-lg-2">
                                            <label className="form-label small fw-bold text-muted">Gender</label>
                                            <select 
                                                className="form-select border-0 bg-white" 
                                                value={patientGender} 
                                                onChange={e => setPatientGender(e.target.value)} 
                                            >
                                                <option value="">Select</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="col-6 col-md-6 col-lg-2">
                                            <label className="form-label small fw-bold text-muted">Room No.</label>
                                            <input 
                                                className="form-control border-0" 
                                                value={patientRoomNumber} 
                                                onChange={e => setPatientRoomNumber(e.target.value)} 
                                            />
                                        </div>
                                        <div className="col-6 col-md-6 col-lg-2">
                                            <label className="form-label small fw-bold text-muted">Bed Assignment</label>
                                            <input 
                                                className="form-control border-0" 
                                                value={patientBedNumber} 
                                                onChange={e => setPatientBedNumber(e.target.value)} 
                                            />
                                        </div>
                                    </div>

                                    {/* Patient Vitals Form */}
                                    <h6 className="fw-bold text-secondary mb-3">🌡️ Patient Vitals Monitoring</h6>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Heart Rate (bpm)</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">❤️</span>
                                                <input 
                                                    className="form-control bg-light border-0" 
                                                    type="number" 
                                                    placeholder="e.g. 72" 
                                                    value={vitals.heartRate} 
                                                    onChange={e => setVitals(prev => ({ ...prev, heartRate: e.target.value }))} 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Blood Pressure (mmHg)</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">🩸</span>
                                                <input 
                                                    className="form-control bg-light border-0" 
                                                    placeholder="e.g. 120/80" 
                                                    value={vitals.bloodPressure} 
                                                    onChange={e => setVitals(prev => ({ ...prev, bloodPressure: e.target.value }))} 
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold text-muted">Temperature (°C)</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0">🌡️</span>
                                                <input 
                                                    className="form-control bg-light border-0" 
                                                    type="number" 
                                                    step="0.1" 
                                                    placeholder="e.g. 36.8" 
                                                    value={vitals.temperature} 
                                                    onChange={e => setVitals(prev => ({ ...prev, temperature: e.target.value }))} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Medicine Schedule Management */}
                                    <h6 className="fw-bold text-secondary mb-3 mt-4 d-flex align-items-center gap-2">
                                        💊 Medicine Schedule & Prescriptions
                                    </h6>
                                    <div className="bg-light p-3 rounded-3 mb-4">
                                        <div className="input-group mb-3">
                                            <input 
                                                className="form-control border-0 bg-white" 
                                                placeholder="Enter medication name (e.g. Ibuprofen 400mg)..." 
                                                value={newMedicine} 
                                                onChange={e => setNewMedicine(e.target.value)} 
                                                onKeyDown={e => e.key === 'Enter' && addMedicine()}
                                            />
                                            <button className="btn btn-primary" onClick={addMedicine}>
                                                ➕ Add Medicine
                                            </button>
                                        </div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {patientMedicines && patientMedicines.length > 0 ? (
                                                patientMedicines.map((med, idx) => (
                                                    <span key={idx} className="badge bg-white text-dark shadow-sm border py-2 px-3 rounded-pill d-flex align-items-center gap-2">
                                                        🧪 {med}
                                                        <button 
                                                            type="button" 
                                                            className="btn-close text-danger" 
                                                            style={{ fontSize: '0.65rem' }} 
                                                            onClick={() => removeMedicine(idx)}
                                                            aria-label="Remove"
                                                        ></button>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-muted small">No medications scheduled for administration.</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Patient Progress Logs & History */}
                                    <h6 className="fw-bold text-secondary mb-3 mt-4 d-flex align-items-center gap-2">
                                        📝 Progress Notes & Medical History Logs
                                    </h6>
                                    <div className="bg-light p-3 rounded-3 mb-4">
                                        <div className="input-group mb-3">
                                            <input 
                                                className="form-control border-0 bg-white" 
                                                placeholder="Write round progression notes or updates..." 
                                                value={newHistoryNote} 
                                                onChange={e => setNewHistoryNote(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && addHistoryNote()}
                                            />
                                            <button className="btn btn-primary" onClick={addHistoryNote}>
                                                ➕ Log Note
                                            </button>
                                        </div>
                                        <div className="overflow-auto border rounded bg-white p-2" style={{ maxHeight: '200px' }}>
                                            {patientHistory && patientHistory.length > 0 ? (
                                                <ul className="list-group list-group-flush">
                                                    {patientHistory.map((item, idx) => (
                                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-start py-2 border-0 border-bottom">
                                                            <div className="text-break" style={{ fontSize: '0.9rem' }}>{item}</div>
                                                            <button 
                                                                className="btn btn-sm btn-link text-danger text-decoration-none p-0 ms-2" 
                                                                onClick={() => removeHistoryNote(idx)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-muted text-center py-3 small">No clinical history notes recorded.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Master Actions Trigger */}
                                    <div className="d-flex gap-3 mt-4 pt-2">
                                        <button className="btn btn-success btn-lg flex-grow-1 shadow" onClick={savePatient}>
                                            💾 Save Patient Record & Care Plan
                                        </button>
                                        <button className="btn btn-danger btn-lg shadow px-4" onClick={() => handleDischargePatient(activePatient._id || activePatient.id)}>
                                            🚪 Discharge Patient
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-5 my-5 bg-light rounded-3">
                                    <span style={{ fontSize: '3rem' }}>🧑‍⚕️</span>
                                    <p className="mt-3">Please select a patient from the rounds checklist on the left panel to review diagnostics, update vitals, prescribe medications, or view medical history logs.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                /* BED FLEET MANAGEMENT TAB */
                <div className="row gx-4 gy-4">
                    {/* Add/Edit Bed Form Column */}
                    <div className="col-xl-4">
                        <div className="card border-0 p-4 shadow-sm bg-white">
                            <h5 className="fw-bold mb-3 border-bottom pb-2">
                                {editingBed ? '✏️ Edit Registered Bed' : '➕ Register New Fleet Bed'}
                            </h5>
                            <form onSubmit={saveBed}>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Bed Number / Identifier</label>
                                    <input 
                                        className="form-control bg-light border-0 py-2" 
                                        placeholder="e.g. B-101" 
                                        value={bedNumber} 
                                        onChange={e => setBedNumber(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Hospital Ward / Zone</label>
                                    <input 
                                        className="form-control bg-light border-0 py-2" 
                                        placeholder="e.g. Ward 1, ICU A" 
                                        value={bedWard} 
                                        onChange={e => setBedWard(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Bed Specialty Type</label>
                                    <select 
                                        className="form-select bg-light border-0 py-2" 
                                        value={bedType} 
                                        onChange={e => setBedType(e.target.value)}
                                    >
                                        <option value="general">General Care</option>
                                        <option value="icu">Intensive Care Unit (ICU)</option>
                                        <option value="emergency">Emergency Care</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold text-muted">Fleet Status</label>
                                    <select 
                                        className="form-select bg-light border-0 py-2" 
                                        value={bedStatus} 
                                        onChange={e => setBedStatus(e.target.value)}
                                    >
                                        <option value="available">🟢 Available for Assignment</option>
                                        <option value="occupied">🔴 Occupied by Patient</option>
                                        <option value="maintenance">🟠 Under Maintenance / Sanitation</option>
                                    </select>
                                </div>
                                <div className="d-grid gap-2 mt-4">
                                    <button type="submit" className="btn btn-success shadow-sm py-2">
                                        {editingBed ? '💾 Update Bed Configuration' : '➕ Register Bed to Fleet'}
                                    </button>
                                    {editingBed && (
                                        <button type="button" className="btn btn-outline-danger py-2" onClick={cancelBedEdit}>
                                            Cancel Editing
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Quick Fleet Capacity adjustment */}
                        <div className="card border-0 p-4 shadow-sm bg-white mt-4">
                            <h5 className="fw-bold mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                                🔧 Quick Capacity Adjustment
                            </h5>
                            <div className="mb-3">
                                <label className="form-label small fw-bold text-muted">Total Target Fleet Beds</label>
                                <div className="input-group">
                                    <input 
                                        type="number" 
                                        className="form-control bg-light border-0 py-2" 
                                        value={targetCapacity} 
                                        onChange={e => setTargetCapacity(e.target.value)} 
                                        min={beds.filter(b => b.status === 'occupied').length}
                                        placeholder="e.g. 5" 
                                    />
                                    <button className="btn btn-primary fw-bold" type="button" onClick={adjustCapacity}>
                                        Update Capacity ⚡
                                    </button>
                                </div>
                                <small className="text-muted mt-2 d-block" style={{ fontSize: '0.72rem', lineHeight: '1.25' }}>
                                    Sets overall bed count limit. Vacant available beds will be auto-generated or decommissioned to match the target.
                                    <br />
                                    <strong>Minimum allowed: {beds.filter(b => b.status === 'occupied').length}</strong> (occupied beds cannot be deleted).
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Bed Fleet Grid Column */}
                    <div className="col-xl-8">
                        <div className="card border-0 p-4 shadow-sm bg-white">
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3 border-bottom pb-2">
                                <div>
                                    <h5 className="fw-bold mb-0">Hospital Bed Fleet Grid Map</h5>
                                    <p className="text-muted small mb-0">Live fleet configuration and status overview.</p>
                                </div>
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                    <div className="btn-group p-1 bg-light rounded-pill shadow-sm" style={{ border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <button 
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${bedFilter === 'all' ? 'btn-primary bg-primary text-white shadow-sm' : 'btn-light text-muted bg-transparent'}`}
                                            style={{ fontSize: '0.72rem' }}
                                            onClick={() => setBedFilter('all')}
                                        >
                                            All ({beds.length})
                                        </button>
                                        <button 
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${bedFilter === 'occupied' ? 'btn-danger bg-danger text-white shadow-sm' : 'btn-light text-muted bg-transparent'}`}
                                            style={{ fontSize: '0.72rem' }}
                                            onClick={() => setBedFilter('occupied')}
                                        >
                                            Occupied ({beds.filter(b => b.status === 'occupied').length})
                                        </button>
                                        <button 
                                            type="button"
                                            className={`btn btn-sm rounded-pill px-3 py-1 fw-bold border-0 transition-all ${bedFilter === 'available' ? 'btn-success bg-success text-white shadow-sm' : 'btn-light text-muted bg-transparent'}`}
                                            style={{ fontSize: '0.72rem' }}
                                            onClick={() => setBedFilter('available')}
                                        >
                                            Free ({beds.filter(b => b.status === 'available').length})
                                        </button>
                                    </div>
                                    <input 
                                        className="form-control bg-light border-0 py-2 px-3 rounded-pill" 
                                        placeholder="🔍 Search..." 
                                        value={bedSearch} 
                                        onChange={e => setBedSearch(e.target.value)} 
                                        style={{ maxWidth: '160px' }}
                                    />
                                </div>
                            </div>

                            <div className="row g-3 overflow-auto" style={{ maxHeight: '600px' }}>
                                {filteredBeds.map(bed => {
                                    const statusTheme = colorForBedStatus(bed.status)
                                    return (
                                        <div className="col-sm-6 col-lg-4" key={bed._id || bed.id}>
                                            <div className={`card border-0 border-start border-4 border-${statusTheme} bg-light p-3 h-100 shadow-sm position-relative`}>
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h6 className="fw-bold mb-0 text-primary">Bed {bed.number}</h6>
                                                        <small className="text-muted d-block">{bed.ward}</small>
                                                        <span className="badge bg-white text-secondary border mt-1 small text-uppercase">
                                                            {bed.type}
                                                        </span>
                                                    </div>
                                                    <span className={`badge bg-${statusTheme} rounded-pill`}>
                                                        {bed.status}
                                                    </span>
                                                </div>

                                                <div className="mt-2 text-muted small border-top pt-2">
                                                    {bed.patientId ? (
                                                        (() => {
                                                            const patientObj = typeof bed.patientId === 'object' ? bed.patientId : patients.find(p => p._id === bed.patientId || p.id === bed.patientId);
                                                            return (
                                                                <span>👤 Patient: <strong>{patientObj ? patientObj.name : 'Patient Allocated'}</strong></span>
                                                            );
                                                        })()
                                                    ) : (
                                                        <span>🟢 Vacant</span>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="d-flex gap-2 justify-content-end mt-3 border-top pt-2">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary" 
                                                        onClick={() => loadBedToEdit(bed)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => handleDeleteBed(bed._id || bed.id)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredBeds.length === 0 && (
                                    <div className="text-center text-muted py-5">No fleet beds match your criteria.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
                                   value={admissionName} 
                                   onChange={e => setAdmissionName(e.target.value)} 
                                   placeholder="Enter full name" />
                        </div>
                        
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>AGE</label>
                                <input className="form-control form-control-premium" 
                                       type="number" 
                                       value={admissionAge} 
                                       onChange={e => setAdmissionAge(e.target.value)} 
                                       placeholder="Age" />
                            </div>
                            <div className="col-6">
                                <label className="form-label small fw-bold text-muted mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>GENDER</label>
                                <select className="form-select form-control-premium" 
                                        value={admissionGender} 
                                        onChange={e => setAdmissionGender(e.target.value)}>
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
                                   value={admissionProblem} 
                                   onChange={e => setAdmissionProblem(e.target.value)} 
                                   placeholder="e.g. Chest pain, High fever, Fracture" />
                            {(() => {
                                const recommendation = recommendWardByCondition(admissionProblem);
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
                                    value={admissionBedNumber}
                                    onChange={e => setAdmissionBedNumber(e.target.value)}
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
