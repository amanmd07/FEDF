import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  UserCheck, 
  UserX, 
  PlusCircle, 
  RefreshCw, 
  AlertTriangle, 
  Clipboard, 
  Search, 
  ArrowLeftRight, 
  ShieldAlert, 
  FileText, 
  Wrench, 
  Play, 
  Pause, 
  Bell, 
  Settings, 
  Trash2,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Bed, Patient, Doctor, LogEvent, BedStatus, WardType } from './types';
import { mockDoctors, initialPatients, initialBeds, initialLogs } from './mockData';

export default function App() {
  // --- Core States ---
  const [beds, setBeds] = useState<Bed[]>(initialBeds);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [logs, setLogs] = useState<LogEvent[]>(initialLogs);
  const [selectedRole, setSelectedRole] = useState<'Receptionist' | 'Nurse' | 'Doctor'>('Receptionist');
  
  // Selection states
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Search & Filter states
  const [bedSearch, setBedSearch] = useState('');
  const [bedFilterWard, setBedFilterWard] = useState<string>('All');
  const [bedFilterStatus, setBedFilterStatus] = useState<string>('All');
  
  // Toast notifications state
  const [toasts, setToasts] = useState<{ id: string; message: string; type: string }[]>([]);

  // Simulation controls state
  const [isSimActive, setIsSimActive] = useState(true);
  const [simIntervalTime, setSimIntervalTime] = useState(8); // in seconds
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Form states for Receptionist Admission
  const [admissionName, setAdmissionName] = useState('');
  const [admissionAge, setAdmissionAge] = useState('');
  const [admissionGender, setAdmissionGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [admissionDoc, setAdmissionDoc] = useState(mockDoctors[0].name);
  const [admissionDiagnosis, setAdmissionDiagnosis] = useState('');
  const [admissionPriority, setAdmissionPriority] = useState<'Critical' | 'Urgent' | 'Stable'>('Stable');

  // Form states for Nurse Notes
  const [nurseNotesText, setNurseNotesText] = useState('');

  // Form states for Doctor Diagnosis and Notes
  const [doctorDiagnosisText, setDoctorDiagnosisText] = useState('');
  const [doctorNotesText, setDoctorNotesText] = useState('');
  const [doctorAttendingText, setDoctorAttendingText] = useState('');
  const [doctorPriorityText, setDoctorPriorityText] = useState<'Critical' | 'Urgent' | 'Stable'>('Stable');
  const [transferBedId, setTransferBedId] = useState<string>('');

  // --- Auto scroll logs ---
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Toast helper ---
  const addToast = (message: string, type: string = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // --- Log helper ---
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error', role: 'Receptionist' | 'Nurse' | 'Doctor' | 'System') => {
    const newLog: LogEvent = {
      id: Date.now().toString() + Math.random().toString(),
      timestamp: new Date().toISOString(),
      message,
      type,
      role
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // --- Real-time Simulator Logic ---
  useEffect(() => {
    if (!isSimActive) return;

    const names = [
      'Robert Miller', 'Patricia Taylor', 'Thomas Moore', 'Linda Jackson',
      'Charles Martin', 'Barbara Anderson', 'Daniel Thomas', 'Susan White',
      'Matthew Harris', 'Margaret Martin', 'Donald Clark', 'Dorothy Lewis'
    ];
    const diagnoses = [
      'Acute exacerbation of Asthma', 'Transient Ischemic Attack', 'Hypertensive crisis',
      'Fractured neck of femur', 'Cellulitis of lower limb', 'Pyelonephritis',
      'Diabetic Ketoacidosis', 'Gastrointestinal hemorrhage'
    ];
    const priorities: ('Critical' | 'Urgent' | 'Stable')[] = ['Critical', 'Urgent', 'Stable'];

    const interval = setInterval(() => {
      const chance = Math.random();

      if (chance < 0.35) {
        // --- 1. Simulation Event: Admission ---
        // Find available beds
        const availableBeds = beds.filter(b => b.status === 'Available');
        if (availableBeds.length > 0) {
          const randomBed = availableBeds[Math.floor(Math.random() * availableBeds.length)];
          const randomName = names[Math.floor(Math.random() * names.length)];
          const randomDiag = diagnoses[Math.floor(Math.random() * diagnoses.length)];
          const randomPri = priorities[Math.floor(Math.random() * priorities.length)];
          const randomAge = Math.floor(Math.random() * 75) + 10;
          const randomDoc = mockDoctors[Math.floor(Math.random() * mockDoctors.length)].name;
          const randomGender = Math.random() > 0.5 ? 'Male' : ('Female' as const);

          const newPatient: Patient = {
            id: 'pat-' + Date.now(),
            name: randomName,
            age: randomAge,
            gender: randomGender,
            admissionDate: new Date().toISOString(),
            attendingDoctor: randomDoc,
            diagnosis: randomDiag,
            priority: randomPri,
            nurseNotes: 'Patient admitted via emergency simulation. Vital signs monitored.',
            doctorNotes: 'Pending physician assessment.'
          };

          // State updates
          setPatients(prev => [...prev, newPatient]);
          setBeds(prev => prev.map(b => b.id === randomBed.id ? { ...b, status: 'Occupied', patientId: newPatient.id } : b));
          
          addLog(`[Simulator] Admitted patient ${randomName} (${randomAge}y/o) to bed ${randomBed.bedNumber}.`, 'success', 'System');
          addToast(`Patient ${randomName} admitted to ${randomBed.bedNumber}`, 'success');
        }
      } else if (chance < 0.65) {
        // --- 2. Simulation Event: Discharge or Need Cleaning ---
        // Find occupied beds
        const occupiedBeds = beds.filter(b => b.status === 'Occupied');
        if (occupiedBeds.length > 0) {
          const randomBed = occupiedBeds[Math.floor(Math.random() * occupiedBeds.length)];
          const patient = patients.find(p => p.id === randomBed.patientId);

          if (patient) {
            // Change bed status to Cleaning
            setBeds(prev => prev.map(b => b.id === randomBed.id ? { ...b, status: 'Cleaning', patientId: undefined } : b));
            // Remove patient from active care list (keep record but remove from bed)
            setPatients(prev => prev.filter(p => p.id !== patient.id));
            
            // Clear selections if it was the discharged bed
            if (selectedBedId === randomBed.id) setSelectedBedId(null);
            if (selectedPatientId === patient.id) setSelectedPatientId(null);

            addLog(`[Simulator] Discharged patient ${patient.name} from bed ${randomBed.bedNumber}. Bed sent to Cleaning queue.`, 'info', 'System');
            addToast(`Patient ${patient.name} discharged from ${randomBed.bedNumber}`, 'info');
          }
        }
      } else if (chance < 0.85) {
        // --- 3. Simulation Event: Cleaning Complete ---
        // Find beds currently cleaning
        const cleaningBeds = beds.filter(b => b.status === 'Cleaning');
        if (cleaningBeds.length > 0) {
          const randomBed = cleaningBeds[Math.floor(Math.random() * cleaningBeds.length)];
          setBeds(prev => prev.map(b => b.id === randomBed.id ? { ...b, status: 'Available' } : b));

          addLog(`[Simulator] Disinfection & Cleaning complete for bed ${randomBed.bedNumber}. Now Available.`, 'success', 'System');
          addToast(`Bed ${randomBed.bedNumber} is clean and available.`, 'success');
        }
      } else {
        // --- 4. Simulation Event: Nurse Updates Notes ---
        const occupiedBeds = beds.filter(b => b.status === 'Occupied');
        if (occupiedBeds.length > 0) {
          const randomBed = occupiedBeds[Math.floor(Math.random() * occupiedBeds.length)];
          const patient = patients.find(p => p.id === randomBed.patientId);
          if (patient) {
            const simulationNotes = [
              'Vitals checked. Temperature stable, blood pressure 120/80.',
              'Patient resting comfortably. Complained of minor discomfort.',
              'Administered scheduled fluids. Urine output normal.',
              'Patient mobilized around the bed. Breath sounds clearing.'
            ];
            const randomNote = simulationNotes[Math.floor(Math.random() * simulationNotes.length)];
            
            setPatients(prev => prev.map(p => p.id === patient.id ? { ...p, nurseNotes: randomNote } : p));
            addLog(`[Simulator] Nurse updated log for patient ${patient.name} in bed ${randomBed.bedNumber}.`, 'info', 'System');
            
            // Update the form notes text if it was the selected patient
            if (selectedPatientId === patient.id) {
              setNurseNotesText(randomNote);
            }
          }
        }
      }
    }, simIntervalTime * 1000);

    return () => clearInterval(interval);
  }, [beds, patients, isSimActive, simIntervalTime, selectedBedId, selectedPatientId]);

  // --- Handlers for Receptionist ---
  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBedId) {
      alert('Please select an available bed from the grid first.');
      return;
    }
    if (!admissionName.trim() || !admissionDiagnosis.trim() || !admissionAge) {
      alert('Please fill out all patient fields.');
      return;
    }

    const assignedBed = beds.find(b => b.id === selectedBedId);
    if (!assignedBed || assignedBed.status !== 'Available') {
      alert('Selected bed is no longer available.');
      return;
    }

    const newPatient: Patient = {
      id: 'pat-' + Date.now(),
      name: admissionName,
      age: parseInt(admissionAge),
      gender: admissionGender,
      admissionDate: new Date().toISOString(),
      attendingDoctor: admissionDoc,
      diagnosis: admissionDiagnosis,
      priority: admissionPriority,
      nurseNotes: 'Initial check-in notes logged by Reception.',
      doctorNotes: 'Awaiting primary physician notes.'
    };

    setPatients(prev => [...prev, newPatient]);
    setBeds(prev => prev.map(b => b.id === selectedBedId ? { ...b, status: 'Occupied', patientId: newPatient.id } : b));
    
    addLog(`Admitted patient ${newPatient.name} to bed ${assignedBed.bedNumber}.`, 'success', 'Receptionist');
    addToast(`Successfully admitted ${newPatient.name} to ${assignedBed.bedNumber}`, 'success');

    // Reset admission form and selection
    setAdmissionName('');
    setAdmissionAge('');
    setAdmissionDiagnosis('');
    setAdmissionPriority('Stable');
    setSelectedBedId(null);
  };

  const handleDischarge = (bedId: string) => {
    const targetBed = beds.find(b => b.id === bedId);
    if (!targetBed || !targetBed.patientId) return;

    const patient = patients.find(p => p.id === targetBed.patientId);
    if (!patient) return;

    // Transition bed to Cleaning
    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status: 'Cleaning', patientId: undefined } : b));
    setPatients(prev => prev.filter(p => p.id !== patient.id));
    setSelectedBedId(null);

    addLog(`Discharged patient ${patient.name} from bed ${targetBed.bedNumber}. Bed queued for disinfection.`, 'warning', 'Receptionist');
    addToast(`Discharged patient ${patient.name} from ${targetBed.bedNumber}`, 'info');
  };

  // --- Handlers for Nurse ---
  const handleUpdateBedStatus = (bedId: string, status: BedStatus) => {
    const targetBed = beds.find(b => b.id === bedId);
    if (!targetBed) return;

    setBeds(prev => prev.map(b => b.id === bedId ? { ...b, status } : b));
    addLog(`Changed bed ${targetBed.bedNumber} status to ${status}.`, 'info', 'Nurse');
    addToast(`Bed ${targetBed.bedNumber} is now ${status}`, 'info');
  };

  const handleSaveNurseNotes = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, nurseNotes: nurseNotesText } : p));
    addLog(`Nurse updated notes for patient ${patient.name}.`, 'info', 'Nurse');
    addToast(`Updated notes for ${patient.name}`, 'success');
  };

  // --- Handlers for Doctor ---
  const handleSelectPatientForDoc = (patientId: string) => {
    setSelectedPatientId(patientId);
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setDoctorDiagnosisText(patient.diagnosis);
      setDoctorNotesText(patient.doctorNotes);
      setDoctorAttendingText(patient.attendingDoctor);
      setDoctorPriorityText(patient.priority);
      setTransferBedId('');
    }
  };

  const handleSaveDoctorTreatment = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setPatients(prev => prev.map(p => p.id === patientId ? { 
      ...p, 
      diagnosis: doctorDiagnosisText,
      doctorNotes: doctorNotesText,
      attendingDoctor: doctorAttendingText,
      priority: doctorPriorityText
    } : p));

    addLog(`Dr. updated diagnosis and notes for patient ${patient.name}.`, 'info', 'Doctor');
    addToast(`Saved chart updates for ${patient.name}`, 'success');
  };

  const handleTransferPatient = (patientId: string, targetBedId: string) => {
    if (!targetBedId) {
      alert('Please select an available target bed for transfer.');
      return;
    }

    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    const currentBed = beds.find(b => b.patientId === patientId);
    const destinationBed = beds.find(b => b.id === targetBedId);

    if (!currentBed || !destinationBed || destinationBed.status !== 'Available') {
      alert('Transfer destination is no longer available.');
      return;
    }

    // Move patient:
    // 1. Current Bed -> status: Cleaning, clear patientId
    // 2. Destination Bed -> status: Occupied, set patientId
    setBeds(prev => prev.map(b => {
      if (b.id === currentBed.id) {
        return { ...b, status: 'Cleaning', patientId: undefined };
      }
      if (b.id === destinationBed.id) {
        return { ...b, status: 'Occupied', patientId: patientId };
      }
      return b;
    }));

    addLog(`Transferred patient ${patient.name} from bed ${currentBed.bedNumber} to bed ${destinationBed.bedNumber}. Old bed sent to Cleaning.`, 'warning', 'Doctor');
    addToast(`Transferred patient ${patient.name} to bed ${destinationBed.bedNumber}`, 'success');
    
    // Clear selection
    setTransferBedId('');
    setSelectedBedId(null);
  };

  // --- Filtering computations ---
  const filteredBeds = beds.filter(bed => {
    // Ward filter
    if (bedFilterWard !== 'All' && bed.ward !== bedFilterWard) return false;
    
    // Status filter
    if (bedFilterStatus !== 'All' && bed.status !== bedFilterStatus) return false;

    // Search query (Search bed number or patient name)
    if (bedSearch.trim() !== '') {
      const query = bedSearch.toLowerCase();
      const patient = patients.find(p => p.id === bed.patientId);
      const matchBed = bed.bedNumber.toLowerCase().includes(query);
      const matchPatient = patient ? patient.name.toLowerCase().includes(query) : false;
      const matchDiag = patient ? patient.diagnosis.toLowerCase().includes(query) : false;
      return matchBed || matchPatient || matchDiag;
    }

    return true;
  });

  // Wards grouping
  const wards: WardType[] = ['ICU', 'Emergency', 'General Ward', 'Pediatrics', 'Cardiology'];

  // Bed stats counting
  const totalBedsCount = beds.length;
  const availableBedsCount = beds.filter(b => b.status === 'Available').length;
  const occupiedBedsCount = beds.filter(b => b.status === 'Occupied').length;
  const cleaningBedsCount = beds.filter(b => b.status === 'Cleaning').length;
  const maintenanceBedsCount = beds.filter(b => b.status === 'Maintenance').length;

  // Selected bed and patient records
  const currentSelectedBed = beds.find(b => b.id === selectedBedId);
  const currentSelectedPatientForBed = currentSelectedBed ? patients.find(p => p.id === currentSelectedBed.patientId) : null;
  const doctorSelectedPatient = patients.find(p => p.id === selectedPatientId);
  const doctorSelectedPatientBed = doctorSelectedPatient ? beds.find(b => b.patientId === doctorSelectedPatient.id) : null;

  return (
    <div>
      {/* Toast Alert Drawer */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className="toast" style={{
            borderLeft: `5px solid ${
              toast.type === 'success' ? 'var(--status-available)' :
              toast.type === 'warning' ? 'var(--status-cleaning)' :
              toast.type === 'error' ? 'var(--status-occupied)' : 'var(--primary-color)'
            }`
          }}>
            <Bell size={16} />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header bar with role switches */}
      <header className="app-header">
        <div className="app-title">
          <Activity size={28} color="var(--primary-color)" />
          <div>
            <span>CareFlow Beds</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Real-Time Bed Management Console
            </div>
          </div>
        </div>

        {/* Role Select Buttons */}
        <div className="role-selector">
          <button 
            className={`role-btn ${selectedRole === 'Receptionist' ? 'active' : ''}`}
            onClick={() => { setSelectedRole('Receptionist'); setSelectedBedId(null); setSelectedPatientId(null); }}
          >
            <UserCheck size={16} />
            Receptionist View
          </button>
          <button 
            className={`role-btn ${selectedRole === 'Nurse' ? 'active' : ''}`}
            onClick={() => { setSelectedRole('Nurse'); setSelectedBedId(null); setSelectedPatientId(null); }}
          >
            <Clipboard size={16} />
            Nurse View
          </button>
          <button 
            className={`role-btn ${selectedRole === 'Doctor' ? 'active' : ''}`}
            onClick={() => { setSelectedRole('Doctor'); setSelectedBedId(null); setSelectedPatientId(null); }}
          >
            <PlusCircle size={16} />
            Doctor View
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Real-time Simulator control banner */}
        <div className="simulator-banner">
          <div>
            <strong>Real-time Update Simulator:</strong> {isSimActive ? `Active (updates every ${simIntervalTime}s)` : 'Paused'}
          </div>
          <div className="simulator-controls">
            <span style={{ fontSize: '0.8rem', marginRight: '0.5rem' }}>Interval:</span>
            <select 
              value={simIntervalTime} 
              onChange={(e) => setSimIntervalTime(Number(e.target.value))}
              style={{ padding: '0.1rem 0.3rem', fontSize: '0.8rem' }}
              disabled={!isSimActive}
            >
              <option value="5">5s (Fast)</option>
              <option value="8">8s (Normal)</option>
              <option value="15">15s (Slow)</option>
            </select>
            <button className="sim-btn" onClick={() => setIsSimActive(!isSimActive)}>
              {isSimActive ? <span style={{display:'flex', alignItems:'center', gap:'0.25rem'}}><Pause size={12}/> Pause Sim</span> : <span style={{display:'flex', alignItems:'center', gap:'0.25rem'}}><Play size={12}/> Run Sim</span>}
            </button>
          </div>
        </div>

        {/* General Bed Capacity Metrics */}
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              <Activity size={24} />
            </div>
            <div className="metric-details">
              <h3>Total Capacity</h3>
              <div className="value">{totalBedsCount}</div>
            </div>
          </div>

          <div className="metric-card metric-available">
            <div className="metric-icon">
              <CheckCircle size={24} />
            </div>
            <div className="metric-details">
              <h3>Available Beds</h3>
              <div className="value">{availableBedsCount}</div>
            </div>
          </div>

          <div className="metric-card metric-occupied">
            <div className="metric-icon">
              <UserX size={24} />
            </div>
            <div className="metric-details">
              <h3>Occupied Beds</h3>
              <div className="value">{occupiedBedsCount}</div>
            </div>
          </div>

          <div className="metric-card metric-cleaning">
            <div className="metric-icon">
              <RefreshCw size={24} />
            </div>
            <div className="metric-details">
              <h3>Needs Cleaning</h3>
              <div className="value">{cleaningBedsCount}</div>
            </div>
          </div>

          <div className="metric-card metric-maintenance">
            <div className="metric-icon">
              <Wrench size={24} />
            </div>
            <div className="metric-details">
              <h3>Maintenance</h3>
              <div className="value">{maintenanceBedsCount}</div>
            </div>
          </div>
        </div>

        {/* --- MAIN ROLE-SPECIFIC WORKSPACES --- */}

        {/* 1. RECEPTIONIST DASHBOARD */}
        {selectedRole === 'Receptionist' && (
          <div className="main-layout">
            {/* Left Hand: Ward Visualizer with Filters */}
            <div>
              {/* Bed Filters */}
              <div className="filter-bar">
                <div className="filter-group">
                  <Search size={16} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Search bed, patient, diagnosis..." 
                    className="form-input" 
                    style={{ width: '220px', padding: '0.35rem 0.5rem' }}
                    value={bedSearch}
                    onChange={(e) => setBedSearch(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Ward:</label>
                  <select 
                    className="form-select" 
                    style={{ width: '130px', padding: '0.35rem' }}
                    value={bedFilterWard}
                    onChange={(e) => setBedFilterWard(e.target.value)}
                  >
                    <option value="All">All Wards</option>
                    {wards.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Status:</label>
                  <select 
                    className="form-select" 
                    style={{ width: '130px', padding: '0.35rem' }}
                    value={bedFilterStatus}
                    onChange={(e) => setBedFilterStatus(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                {(bedSearch || bedFilterWard !== 'All' || bedFilterStatus !== 'All') && (
                  <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', width: 'auto' }} onClick={() => {
                    setBedSearch('');
                    setBedFilterWard('All');
                    setBedFilterStatus('All');
                  }}>Reset</button>
                )}
              </div>

              {/* Bed Grid grouped by Wards */}
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Activity size={18} />
                    <span>Hospital Wards Map</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Select a bed to initiate admission or discharge actions.
                  </span>
                </div>

                <div className="wards-container">
                  {wards.map(ward => {
                    // Check if ward has beds in the filtered result
                    const wardBeds = filteredBeds.filter(b => b.ward === ward);
                    if (wardBeds.length === 0) return null;

                    return (
                      <div key={ward} className="ward-section">
                        <div className="ward-header">
                          <span>{ward}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ({wardBeds.filter(b => b.status === 'Available').length} / {wardBeds.length} Available)
                          </span>
                        </div>
                        <div className="ward-beds-grid">
                          {wardBeds.map(bed => (
                            <div 
                              key={bed.id} 
                              className={`bed-box bed-${bed.status} ${selectedBedId === bed.id ? 'selected' : ''}`}
                              onClick={() => setSelectedBedId(bed.id)}
                            >
                              <span className="bed-box-number">{bed.bedNumber}</span>
                              <span className="bed-box-status">{bed.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Hand: Context-Based Actions Panel */}
            <div className="panel" style={{ minHeight: '400px' }}>
              {!currentSelectedBed ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
                  <HelpCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <h4>No Bed Selected</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Click any bed in the ward map to admit a patient or process a discharge.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="panel-header">
                    <div className="panel-title">
                      <FileText size={18} />
                      <span>Bed Details: {currentSelectedBed.bedNumber}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Ward / Department</div>
                    <div className="detail-value">{currentSelectedBed.ward}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">Bed Status</div>
                    <div className="detail-value">
                      <span className={`badge badge-${currentSelectedBed.status}`}>{currentSelectedBed.status}</span>
                    </div>
                  </div>

                  {/* ADMIT FORM (If Bed is Available) */}
                  {currentSelectedBed.status === 'Available' && (
                    <form onSubmit={handleAdmit} style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                        Patient Admission Intake
                      </h4>
                      <div className="form-group">
                        <label>Patient Full Name</label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="John Smith"
                          value={admissionName}
                          onChange={(e) => setAdmissionName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <label>Age</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder="45"
                            value={admissionAge}
                            onChange={(e) => setAdmissionAge(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label>Gender</label>
                          <select 
                            className="form-select"
                            value={admissionGender}
                            onChange={(e) => setAdmissionGender(e.target.value as any)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Attending Physician</label>
                        <select 
                          className="form-select"
                          value={admissionDoc}
                          onChange={(e) => setAdmissionDoc(e.target.value)}
                        >
                          {mockDoctors.map(d => (
                            <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Severity Level</label>
                        <select 
                          className="form-select"
                          value={admissionPriority}
                          onChange={(e) => setAdmissionPriority(e.target.value as any)}
                        >
                          <option value="Stable">Stable (Low risk)</option>
                          <option value="Urgent">Urgent (Medium risk)</option>
                          <option value="Critical">Critical (High risk)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Initial Diagnosis / Admission Reason</label>
                        <textarea 
                          className="form-textarea" 
                          rows={3} 
                          placeholder="Brief diagnosis explanation..."
                          value={admissionDiagnosis}
                          onChange={(e) => setAdmissionDiagnosis(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-success">
                        <PlusCircle size={16} />
                        Confirm Intake & Assign Bed
                      </button>
                    </form>
                  )}

                  {/* DISCHARGE SCREEN (If Bed is Occupied) */}
                  {currentSelectedBed.status === 'Occupied' && currentSelectedPatientForBed && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                        Occupant Profile
                      </h4>
                      <div className="detail-item">
                        <div className="detail-label">Patient Name</div>
                        <div className="detail-value" style={{ fontSize: '1.1rem' }}>{currentSelectedPatientForBed.name}</div>
                      </div>
                      <div className="detail-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <div>
                          <div className="detail-label">Age / Gender</div>
                          <div className="detail-value">{currentSelectedPatientForBed.age} yrs / {currentSelectedPatientForBed.gender}</div>
                        </div>
                        <div>
                          <div className="detail-label">Priority</div>
                          <div className="detail-value">
                            <span className={`badge badge-${currentSelectedPatientForBed.priority.toLowerCase()}`}>
                              {currentSelectedPatientForBed.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Admission Date & Time</div>
                        <div className="detail-value" style={{ fontSize: '0.85rem' }}>
                          {new Date(currentSelectedPatientForBed.admissionDate).toLocaleString()}
                        </div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Attending Doctor</div>
                        <div className="detail-value">{currentSelectedPatientForBed.attendingDoctor}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Diagnosis</div>
                        <div className="detail-value" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>
                          {currentSelectedPatientForBed.diagnosis}
                        </div>
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDischarge(currentSelectedBed.id)}
                        >
                          <UserX size={16} />
                          Discharge Patient (Send Bed to Clean)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bed is Cleaning */}
                  {currentSelectedBed.status === 'Cleaning' && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                      <RefreshCw size={36} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--status-cleaning)' }} />
                      <h4>Bed is Cleaning / Disinfecting</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        This bed must be cleaned before new patients can be admitted. Nuring staff can complete cleaning, or wait for the automatic simulator process.
                      </p>
                    </div>
                  )}

                  {/* Bed is Maintenance */}
                  {currentSelectedBed.status === 'Maintenance' && (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                      <Wrench size={36} style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--status-maintenance)' }} />
                      <h4>Bed is Under Maintenance</h4>
                      <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                        Out of service. Requires technician repair clearance before use.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. NURSE DASHBOARD */}
        {selectedRole === 'Nurse' && (
          <div className="main-layout">
            {/* Left Hand: All Beds Status Matrix */}
            <div>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <Clipboard size={18} />
                    <span>Bed Housekeeping & Maintenance</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Monitor bed readiness, assign cleaning, or view active nurse notes.
                  </span>
                </div>

                <div className="wards-container">
                  {wards.map(ward => {
                    const wardBeds = beds.filter(b => b.ward === ward);
                    return (
                      <div key={ward} className="ward-section">
                        <div className="ward-header">
                          <span>{ward}</span>
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--status-available)', fontWeight: '600' }}>
                              {wardBeds.filter(b => b.status === 'Available').length} Clean
                            </span>
                            <span style={{ color: 'var(--status-cleaning)', fontWeight: '600' }}>
                              {wardBeds.filter(b => b.status === 'Cleaning').length} Dirty
                            </span>
                          </div>
                        </div>
                        <div className="ward-beds-grid">
                          {wardBeds.map(bed => (
                            <div 
                              key={bed.id} 
                              className={`bed-box bed-${bed.status} ${selectedBedId === bed.id ? 'selected' : ''}`}
                              onClick={() => {
                                setSelectedBedId(bed.id);
                                if (bed.patientId) {
                                  const pat = patients.find(p => p.id === bed.patientId);
                                  setNurseNotesText(pat ? pat.nurseNotes : '');
                                }
                              }}
                            >
                              <span className="bed-box-number">{bed.bedNumber}</span>
                              <span className="bed-box-status">{bed.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Hand: Nurse Actions */}
            <div className="panel" style={{ minHeight: '400px' }}>
              {!currentSelectedBed ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
                  <Clipboard size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <h4>Housekeeping Actions</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Select a bed to update housekeeping status or edit patient nursing notes.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="panel-header">
                    <div className="panel-title">
                      <Settings size={18} />
                      <span>Manage Bed: {currentSelectedBed.bedNumber}</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="detail-label">Current Status</div>
                    <div className="detail-value">
                      <span className={`badge badge-${currentSelectedBed.status}`}>{currentSelectedBed.status}</span>
                    </div>
                  </div>

                  {/* Nurse controls to change status */}
                  <div style={{ marginTop: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                      Update Operational Status
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {currentSelectedBed.status === 'Cleaning' && (
                        <button 
                          className="btn btn-success" 
                          onClick={() => handleUpdateBedStatus(currentSelectedBed.id, 'Available')}
                        >
                          <CheckCircle size={16} /> Mark Cleaning Completed (Make Available)
                        </button>
                      )}
                      
                      {currentSelectedBed.status === 'Maintenance' && (
                        <button 
                          className="btn btn-success" 
                          onClick={() => handleUpdateBedStatus(currentSelectedBed.id, 'Available')}
                        >
                          <CheckCircle size={16} /> Complete Maintenance (Make Available)
                        </button>
                      )}

                      {currentSelectedBed.status === 'Available' && (
                        <>
                          <button 
                            className="btn btn-warning" 
                            onClick={() => handleUpdateBedStatus(currentSelectedBed.id, 'Cleaning')}
                          >
                            <RefreshCw size={16} /> Send to Cleaning Queue
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ borderColor: 'var(--status-maintenance)', color: 'var(--status-maintenance)' }}
                            onClick={() => handleUpdateBedStatus(currentSelectedBed.id, 'Maintenance')}
                          >
                            <Wrench size={16} /> Flag for Maintenance Repair
                          </button>
                        </>
                      )}

                      {currentSelectedBed.status === 'Occupied' && (
                        <>
                          <button 
                            className="btn btn-warning" 
                            onClick={() => {
                              if (confirm("This bed is currently occupied. Setting status to Cleaning will discharge the patient. Continue?")) {
                                handleDischarge(currentSelectedBed.id);
                              }
                            }}
                          >
                            <RefreshCw size={16} /> Discharge Patient & Send to Cleaning
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ borderColor: 'var(--status-maintenance)', color: 'var(--status-maintenance)' }}
                            onClick={() => {
                              alert("Cannot place an occupied bed directly in maintenance. Please transfer or discharge the patient first.");
                            }}
                          >
                            <Wrench size={16} /> Flag for Maintenance (Requires Discharge)
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Nurse Patient Notes Section */}
                  {currentSelectedBed.status === 'Occupied' && currentSelectedPatientForBed && (
                    <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                      <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem' }}>Active Care Notes</h4>
                      
                      <div className="detail-item">
                        <div className="detail-label">Patient Name</div>
                        <div className="detail-value">{currentSelectedPatientForBed.name} ({currentSelectedPatientForBed.age} y/o)</div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-label">Diagnosis</div>
                        <div className="detail-value" style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>
                          {currentSelectedPatientForBed.diagnosis}
                        </div>
                      </div>

                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Nursing Care Log / Notes</label>
                        <textarea 
                          className="form-textarea" 
                          rows={4}
                          value={nurseNotesText}
                          onChange={(e) => setNurseNotesText(e.target.value)}
                          placeholder="Vitals checklist, dietary requests, patient needs..."
                        />
                      </div>
                      
                      <button 
                        className="btn" 
                        onClick={() => handleSaveNurseNotes(currentSelectedPatientForBed.id)}
                      >
                        Save Care Log
                      </button>

                      {currentSelectedPatientForBed.doctorNotes && (
                        <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '4px', borderLeft: '3px solid #0284c7' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#0369a1', display: 'block' }}>Physician Orders:</span>
                          <span style={{ fontSize: '0.8rem', fontStyle: 'italic' }}>{currentSelectedPatientForBed.doctorNotes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. DOCTOR DASHBOARD */}
        {selectedRole === 'Doctor' && (
          <div className="main-layout">
            {/* Left Hand: Occupied Bed Patients List */}
            <div>
              <div className="panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <PlusCircle size={18} />
                    <span>Active Patient Rosters</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Select a patient from the active list to manage diagnoses, treatment notes, or bed transfers.
                  </span>
                </div>

                {patients.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No patients currently admitted. Go to Receptionist tab to admit patients.
                  </div>
                ) : (
                  <div className="patient-list">
                    {patients.map(pat => {
                      const bed = beds.find(b => b.patientId === pat.id);
                      return (
                        <div 
                          key={pat.id} 
                          className={`patient-list-card ${selectedPatientId === pat.id ? 'selected' : ''}`}
                          onClick={() => handleSelectPatientForDoc(pat.id)}
                        >
                          <div className="patient-list-header">
                            <span className="patient-list-name">{pat.name}</span>
                            <span className={`badge badge-${pat.priority.toLowerCase()}`}>{pat.priority}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                            <span>Age/Gender: {pat.age}y / {pat.gender}</span>
                            <strong>Bed: {bed ? bed.bedNumber : 'TBD'}</strong>
                          </div>
                          <div style={{ fontSize: '0.8rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '0.25rem', color: 'var(--text-dark)' }}>
                            Diagnosis: {pat.diagnosis}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Hand: Clinical Charts & Actions */}
            <div className="panel" style={{ minHeight: '400px' }}>
              {!doctorSelectedPatient ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '3rem' }}>
                  <FileText size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <h4>Clinical Chart Manager</h4>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Select a patient from the roster to view medical histories, update charts, or issue transfers.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="panel-header">
                    <div className="panel-title">
                      <Clipboard size={18} />
                      <span>Medical Chart: {doctorSelectedPatient.name}</span>
                    </div>
                  </div>

                  {/* Demographic Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div className="detail-item">
                      <div className="detail-label">Age & Gender</div>
                      <div className="detail-value">{doctorSelectedPatient.age} yrs / {doctorSelectedPatient.gender}</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">Current Bed</div>
                      <div className="detail-value">{doctorSelectedPatientBed ? `${doctorSelectedPatientBed.bedNumber} (${doctorSelectedPatientBed.ward})` : 'Unassigned'}</div>
                    </div>
                  </div>

                  {/* Clinical Editing Form */}
                  <div className="form-group">
                    <label>Priority / Condition Severity</label>
                    <select 
                      className="form-select"
                      value={doctorPriorityText}
                      onChange={(e) => setDoctorPriorityText(e.target.value as any)}
                    >
                      <option value="Stable">Stable</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Attending Physician</label>
                    <select 
                      className="form-select"
                      value={doctorAttendingText}
                      onChange={(e) => setDoctorAttendingText(e.target.value)}
                    >
                      {mockDoctors.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Diagnosis Summary</label>
                    <textarea 
                      className="form-textarea" 
                      rows={2}
                      value={doctorDiagnosisText}
                      onChange={(e) => setDoctorDiagnosisText(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Treatment Notes / Orders</label>
                    <textarea 
                      className="form-textarea" 
                      rows={4}
                      value={doctorNotesText}
                      onChange={(e) => setDoctorNotesText(e.target.value)}
                      placeholder="Enter physician orders, medication prescriptions, or discharge parameters..."
                    />
                  </div>

                  {/* Nurse Notes Feed */}
                  <div style={{ margin: '1rem 0', padding: '0.75rem', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', display: 'block' }}>LATEST NURSING CARE OBSERVATION:</span>
                    <span style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#334155' }}>
                      {doctorSelectedPatient.nurseNotes || 'No notes logged by nursing staff yet.'}
                    </span>
                  </div>

                  <button 
                    className="btn" 
                    onClick={() => handleSaveDoctorTreatment(doctorSelectedPatient.id)}
                    style={{ marginBottom: '1.5rem' }}
                  >
                    Save Chart Changes
                  </button>

                  {/* Bed Transfer Tool */}
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ArrowLeftRight size={16} /> Request Bed Transfer
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Transfer this patient to another available bed (e.g. moving stable patient out of ICU, or transferring urgent patient into ICU).
                    </p>

                    <div className="form-group">
                      <label>Select Target Bed</label>
                      <select 
                        className="form-select"
                        value={transferBedId}
                        onChange={(e) => setTransferBedId(e.target.value)}
                      >
                        <option value="">-- Choose Available Bed --</option>
                        {beds.filter(b => b.status === 'Available').map(b => (
                          <option key={b.id} value={b.id}>
                            {b.bedNumber} - {b.ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button 
                      className="btn btn-secondary" 
                      style={{ borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}
                      onClick={() => handleTransferPatient(doctorSelectedPatient.id, transferBedId)}
                      disabled={!transferBedId}
                    >
                      Execute Bed Transfer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- GLOBAL SECTION: EVENT & LOG MONITOR --- */}
        <div className="panel" style={{ marginTop: '1rem' }}>
          <div className="panel-header">
            <div className="panel-title">
              <ShieldAlert size={18} />
              <span>Real-Time Activity Monitor</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Live update logs of ward admissions, discharges, transfers, and system triggers.
            </span>
          </div>

          <div className="logs-list">
            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>
                No events recorded.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="log-item">
                  <span className="log-time">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="log-message" style={{ 
                    color: log.type === 'error' ? 'var(--status-occupied)' : 
                           log.type === 'warning' ? 'var(--status-cleaning)' : 
                           log.type === 'success' ? 'var(--status-available)' : 'var(--text-dark)'
                  }}>
                    {log.message}
                  </span>
                  <span className="log-role">{log.role}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
