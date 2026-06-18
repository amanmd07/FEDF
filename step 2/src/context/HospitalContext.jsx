import React, { createContext, useContext, useState, useEffect } from 'react';

const HospitalContext = createContext(undefined);

const initialBeds = [
  // ICU Ward
  { id: '101', name: 'ICU-101', ward: 'ICU', status: 'occupied', patientId: 'p1' },
  { id: '102', name: 'ICU-102', ward: 'ICU', status: 'occupied', patientId: 'p2' },
  { id: '103', name: 'ICU-103', ward: 'ICU', status: 'vacant', patientId: null },
  { id: '104', name: 'ICU-104', ward: 'ICU', status: 'maintenance', patientId: null },
  
  // Emergency Ward
  { id: '201', name: 'ER-201', ward: 'Emergency', status: 'occupied', patientId: 'p3' },
  { id: '202', name: 'ER-202', ward: 'Emergency', status: 'vacant', patientId: null },
  { id: '203', name: 'ER-203', ward: 'Emergency', status: 'cleaning', patientId: null },
  { id: '204', name: 'ER-204', ward: 'Emergency', status: 'vacant', patientId: null },
  { id: '205', name: 'ER-205', ward: 'Emergency', status: 'vacant', patientId: null },

  // General Ward
  { id: '301', name: 'GW-301', ward: 'General Ward', status: 'occupied', patientId: 'p4' },
  { id: '302', name: 'GW-302', ward: 'General Ward', status: 'occupied', patientId: 'p5' },
  { id: '303', name: 'GW-303', ward: 'General Ward', status: 'cleaning', patientId: null },
  { id: '304', name: 'GW-304', ward: 'General Ward', status: 'vacant', patientId: null },
  { id: '305', name: 'GW-305', ward: 'General Ward', status: 'vacant', patientId: null },
  { id: '306', name: 'GW-306', ward: 'General Ward', status: 'vacant', patientId: null },

  // Pediatrics Ward
  { id: '401', name: 'PEDS-401', ward: 'Pediatrics', status: 'occupied', patientId: 'p6' },
  { id: '402', name: 'PEDS-402', ward: 'Pediatrics', status: 'vacant', patientId: null },
  { id: '403', name: 'PEDS-403', ward: 'Pediatrics', status: 'vacant', patientId: null }
];

const initialPatients = [
  {
    id: 'p1',
    name: 'Robert Vance',
    age: 62,
    gender: 'Male',
    bedId: '101',
    severity: 'Critical',
    symptoms: 'Acute Chest Pain, Dyspnea',
    admittedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 24h ago
    vitals: { heartRate: 112, bpSystolic: 148, bpDiastolic: 95, spo2: 91, temperature: 37.8 },
    vitalsHistory: [
      { timestamp: '10:00', heartRate: 105, bpSystolic: 140, bpDiastolic: 90, spo2: 93, temperature: 37.6 },
      { timestamp: '14:00', heartRate: 108, bpSystolic: 145, bpDiastolic: 92, spo2: 92, temperature: 37.7 },
      { timestamp: '18:00', heartRate: 112, bpSystolic: 148, bpDiastolic: 95, spo2: 91, temperature: 37.8 }
    ],
    prescriptions: [
      { id: 'pr1', medicine: 'Aspirin', dosage: '325mg', frequency: 'Once Daily', prescribedBy: 'Dr. Gregory House', prescribedAt: new Date(Date.now() - 3600000 * 20).toISOString() },
      { id: 'pr2', medicine: 'Nitroglycerin Patch', dosage: '0.4mg/hr', frequency: 'Continuous', prescribedBy: 'Dr. Gregory House', prescribedAt: new Date(Date.now() - 3600000 * 18).toISOString() }
    ],
    notes: [
      { id: 'n1', text: 'Patient shows signs of severe myocardial distress. Cardiac enzymes ordered. Keep on continuous cardiac telemetry monitor.', author: 'Dr. Gregory House', createdAt: new Date(Date.now() - 3600000 * 22).toISOString() }
    ],
    dischargeApproved: false
  },
  {
    id: 'p2',
    name: 'Eleanor Vance',
    age: 74,
    gender: 'Female',
    bedId: '102',
    severity: 'Critical',
    symptoms: 'Post-op Cardiac Arrest Rescue, Ventricular Arrhythmia',
    admittedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    vitals: { heartRate: 125, bpSystolic: 98, bpDiastolic: 60, spo2: 89, temperature: 38.5 },
    vitalsHistory: [
      { timestamp: '12:00', heartRate: 115, bpSystolic: 102, bpDiastolic: 65, spo2: 92, temperature: 38.2 },
      { timestamp: '16:00', heartRate: 125, bpSystolic: 98, bpDiastolic: 60, spo2: 89, temperature: 38.5 }
    ],
    prescriptions: [
      { id: 'pr3', medicine: 'Amiodarone Infusion', dosage: '1mg/min', frequency: 'Continuous IV', prescribedBy: 'Dr. Allison Cameron', prescribedAt: new Date(Date.now() - 3600000 * 10).toISOString() }
    ],
    notes: [
      { id: 'n2', text: 'Monitored for repeat runs of V-Tach. Epinephrine at bedside. Increase oxygen flow rates.', author: 'Dr. Allison Cameron', createdAt: new Date(Date.now() - 3600000 * 8).toISOString() }
    ],
    dischargeApproved: false
  },
  {
    id: 'p3',
    name: 'Marcus Brody',
    age: 34,
    gender: 'Male',
    bedId: '201',
    severity: 'Moderate',
    symptoms: 'Right Lower Quadrant Abdominal Pain, Vomiting',
    admittedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    vitals: { heartRate: 88, bpSystolic: 118, bpDiastolic: 78, spo2: 98, temperature: 38.2 },
    vitalsHistory: [
      { timestamp: '19:30', heartRate: 88, bpSystolic: 118, bpDiastolic: 78, spo2: 98, temperature: 38.2 }
    ],
    prescriptions: [
      { id: 'pr4', medicine: 'Acetaminophen IV', dosage: '1000mg', frequency: 'Every 6 Hours', prescribedBy: 'Dr. Eric Foreman', prescribedAt: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'pr5', medicine: 'Normal Saline IV', dosage: '100ml/hr', frequency: 'Continuous', prescribedBy: 'Dr. Eric Foreman', prescribedAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    notes: [
      { id: 'n3', text: 'Classic signs of appendicitis. Ultrasound confirmed inflamed appendix. Surgical consult requested.', author: 'Dr. Eric Foreman', createdAt: new Date(Date.now() - 3600000 * 1).toISOString() }
    ],
    dischargeApproved: false
  },
  {
    id: 'p4',
    name: 'Diana Prince',
    age: 29,
    gender: 'Female',
    bedId: '301',
    severity: 'Stable',
    symptoms: 'Post-op Tibial Fracture Fixation recovery',
    admittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    vitals: { heartRate: 72, bpSystolic: 120, bpDiastolic: 80, spo2: 99, temperature: 36.6 },
    vitalsHistory: [
      { timestamp: '08:00', heartRate: 70, bpSystolic: 118, bpDiastolic: 78, spo2: 99, temperature: 36.5 },
      { timestamp: '16:00', heartRate: 72, bpSystolic: 120, bpDiastolic: 80, spo2: 99, temperature: 36.6 }
    ],
    prescriptions: [
      { id: 'pr6', medicine: 'Ibuprofen', dosage: '400mg', frequency: 'PRN (As Needed) pain', prescribedBy: 'Dr. Gregory House', prescribedAt: new Date(Date.now() - 3600000 * 40).toISOString() }
    ],
    notes: [
      { id: 'n4', text: 'Suture lines look clean. Pain is well controlled with oral medications. Mobilizing well with crutches. Suitable for discharge in 24 hours.', author: 'Dr. Gregory House', createdAt: new Date(Date.now() - 3600000 * 24).toISOString() }
    ],
    dischargeApproved: true // approved for discharge
  },
  {
    id: 'p5',
    name: 'Arthur Dent',
    age: 42,
    gender: 'Male',
    bedId: '302',
    severity: 'Stable',
    symptoms: 'Severe Dehydration, Headaches',
    admittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    vitals: { heartRate: 68, bpSystolic: 110, bpDiastolic: 70, spo2: 98, temperature: 36.8 },
    vitalsHistory: [
      { timestamp: '15:00', heartRate: 68, bpSystolic: 110, bpDiastolic: 70, spo2: 98, temperature: 36.8 }
    ],
    prescriptions: [
      { id: 'pr7', medicine: 'IV Fluids (D5NS)', dosage: '150ml/hr', frequency: 'Completed', prescribedBy: 'Dr. Allison Cameron', prescribedAt: new Date(Date.now() - 3600000 * 6).toISOString() }
    ],
    notes: [
      { id: 'n5', text: 'Dehydration fully resolved. Headaches subsided. Discharged approval pending final labs.', author: 'Dr. Allison Cameron', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() }
    ],
    dischargeApproved: false
  },
  {
    id: 'p6',
    name: 'Timmy Turner',
    age: 9,
    gender: 'Male',
    bedId: '401',
    severity: 'Stable',
    symptoms: 'Mild Asthma Exacerbation',
    admittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    vitals: { heartRate: 92, bpSystolic: 105, bpDiastolic: 65, spo2: 96, temperature: 37.1 },
    vitalsHistory: [
      { timestamp: '18:00', heartRate: 92, bpSystolic: 105, bpDiastolic: 65, spo2: 96, temperature: 37.1 }
    ],
    prescriptions: [
      { id: 'pr8', medicine: 'Albuterol Nebulizer', dosage: '2.5mg', frequency: 'Every 4 Hours', prescribedBy: 'Dr. Eric Foreman', prescribedAt: new Date(Date.now() - 3600000 * 4).toISOString() }
    ],
    notes: [
      { id: 'n6', text: 'Wheezing decreased significantly after first nebulizer treatment. Lungs now clear. Will observe overnight.', author: 'Dr. Eric Foreman', createdAt: new Date(Date.now() - 3600000 * 3).toISOString() }
    ],
    dischargeApproved: false
  }
];

const initialNurseTasks = [
  { id: 't1', bedId: '101', patientName: 'Robert Vance', task: 'Administer daily Aspirin', completed: false, time: '09:00' },
  { id: 't2', bedId: '102', patientName: 'Eleanor Vance', task: 'Check continuous Amiodarone drip', completed: true, time: '11:00' },
  { id: 't3', bedId: '201', patientName: 'Marcus Brody', task: 'Pre-op vital checks', completed: false, time: '12:00' },
  { id: 't4', bedId: '401', patientName: 'Timmy Turner', task: 'Albuterol Nebulizer round', completed: false, time: '13:00' }
];

export const HospitalProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [beds, setBeds] = useState(initialBeds);
  const [patients, setPatients] = useState(initialPatients);
  const [nurseTasks, setNurseTasks] = useState(initialNurseTasks);
  const [alerts, setAlerts] = useState([
    { id: 'a1', message: 'CRITICAL: Eleanor Vance (Bed ICU-102) SpO2 has dropped to 89%!', timestamp: new Date(Date.now() - 120000).toLocaleTimeString(), type: 'danger', unread: true },
    { id: 'a2', message: 'ALERT: Patient Robert Vance admitted to Bed ICU-101.', timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(), type: 'info', unread: false }
  ]);

  // Auth Operations
  const login = (username, role) => {
    // Basic verification: user card click or typing any text
    setUser({ username, role });
    addSystemAlert(`User logged in as ${role.toUpperCase()}: ${username}`, 'info');
  };

  const logout = () => {
    if (user) {
      addSystemAlert(`${user.role.toUpperCase()} session ended.`, 'info');
    }
    setUser(null);
  };

  // Helper to add system alerts
  const addSystemAlert = (message, type = 'info', patientId = null) => {
    const newAlert = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      timestamp: new Date().toLocaleTimeString(),
      type,
      patientId,
      unread: true
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts
  };

  const dismissAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, unread: false } : a));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Reception Operations: Admit
  const admitPatient = (patientData) => {
    const patientId = 'p_' + Math.random().toString(36).substr(2, 9);
    const newPatient = {
      id: patientId,
      name: patientData.name,
      age: parseInt(patientData.age),
      gender: patientData.gender,
      bedId: patientData.bedId,
      severity: patientData.severity || 'Stable',
      symptoms: patientData.symptoms || 'General Admission',
      admittedAt: new Date().toISOString(),
      vitals: patientData.vitals || { heartRate: 75, bpSystolic: 120, bpDiastolic: 80, spo2: 98, temperature: 37.0 },
      vitalsHistory: [
        { 
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
          ...(patientData.vitals || { heartRate: 75, bpSystolic: 120, bpDiastolic: 80, spo2: 98, temperature: 37.0 })
        }
      ],
      prescriptions: [],
      notes: [],
      dischargeApproved: false
    };

    setPatients(prev => [...prev, newPatient]);
    setBeds(prev => prev.map(bed => bed.id === patientData.bedId ? { ...bed, status: 'occupied', patientId } : bed));
    
    addSystemAlert(`SUCCESS: Admitted ${patientData.name} to Bed ${beds.find(b => b.id === patientData.bedId)?.name}`, 'info');
    
    // Add generic nurse task for the new patient
    const newTask = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      bedId: patientData.bedId,
      patientName: patientData.name,
      task: 'Initial vitals check and patient assessment',
      completed: false,
      time: new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNurseTasks(prev => [...prev, newTask]);
  };

  // Reception Operations: Transfer
  const transferPatient = (patientId, currentBedId, targetBedId) => {
    setBeds(prev => prev.map(bed => {
      if (bed.id === currentBedId) {
        return { ...bed, status: 'cleaning', patientId: null };
      }
      if (bed.id === targetBedId) {
        return { ...bed, status: 'occupied', patientId };
      }
      return bed;
    }));

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, bedId: targetBedId } : p));
    
    const pName = patients.find(p => p.id === patientId)?.name || 'Patient';
    const oldBedName = beds.find(b => b.id === currentBedId)?.name || currentBedId;
    const newBedName = beds.find(b => b.id === targetBedId)?.name || targetBedId;
    
    addSystemAlert(`TRANSFER: ${pName} transferred from Bed ${oldBedName} to ${newBedName}. Bed ${oldBedName} status set to CLEANING.`, 'info');
  };

  // Reception Operations: Execute Discharge
  const executeDischarge = (patientId, bedId) => {
    const patient = patients.find(p => p.id === patientId);
    setPatients(prev => prev.filter(p => p.id !== patientId)); // Remove from active patients or could flag as discharged
    setBeds(prev => prev.map(bed => bed.id === bedId ? { ...bed, status: 'cleaning', patientId: null } : bed));
    setNurseTasks(prev => prev.filter(t => t.bedId !== bedId)); // Clear remaining tasks for that bed
    
    addSystemAlert(`DISCHARGE: ${patient?.name || 'Patient'} discharged from Bed ${beds.find(b => b.id === bedId)?.name}. Bed status set to CLEANING.`, 'info');
  };

  // Nurse Operations: Update Bed Status (e.g. cleaning -> vacant)
  const updateBedStatus = (bedId, status) => {
    setBeds(prev => prev.map(bed => bed.id === bedId ? { ...bed, status } : bed));
    const bedName = beds.find(b => b.id === bedId)?.name || bedId;
    addSystemAlert(`Bed ${bedName} status updated to ${status.toUpperCase()}.`, 'info');
  };

  // Nurse Operations: Update patient vitals manually
  const updateVitals = (patientId, newVitals) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setPatients(prev => prev.map(p => {
      if (p.id === patientId) {
        const mergedVitals = { ...p.vitals, ...newVitals };
        
        // Evaluate critical alerts
        const isCritical = mergedVitals.spo2 < 90 || mergedVitals.heartRate > 120 || mergedVitals.heartRate < 50 || mergedVitals.temperature > 39.0;
        const newSeverity = isCritical ? 'Critical' : (mergedVitals.spo2 < 94 || mergedVitals.heartRate > 100 || mergedVitals.temperature > 38.0 ? 'Moderate' : 'Stable');
        
        if (isCritical && p.severity !== 'Critical') {
          addSystemAlert(`CRITICAL ALERT: ${p.name} in Bed ${beds.find(b => b.id === p.bedId)?.name} is displaying critical vitals!`, 'danger', patientId);
        }

        return {
          ...p,
          severity: newSeverity,
          vitals: mergedVitals,
          vitalsHistory: [...p.vitalsHistory, { timestamp, ...mergedVitals }].slice(-10) // Store last 10
        };
      }
      return p;
    }));
  };

  // Nurse Operations: Toggle care checklist task
  const toggleTask = (taskId) => {
    setNurseTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  // Nurse Operations: Add a nurse task
  const addNurseTask = (taskData) => {
    const newTask = {
      id: 't_' + Math.random().toString(36).substr(2, 9),
      ...taskData,
      completed: false
    };
    setNurseTasks(prev => [...prev, newTask]);
  };

  // Doctor Operations: Write prescription
  const addPrescription = (patientId, medData) => {
    const newPres = {
      id: 'pr_' + Math.random().toString(36).substr(2, 9),
      medicine: medData.medicine,
      dosage: medData.dosage,
      frequency: medData.frequency,
      prescribedBy: user?.username || 'Attending Doctor',
      prescribedAt: new Date().toISOString()
    };

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, prescriptions: [...p.prescriptions, newPres] } : p));
    
    const pName = patients.find(p => p.id === patientId)?.name || 'Patient';
    addSystemAlert(`PRESCRIPTION: Dr. ${user?.username} prescribed ${medData.medicine} for ${pName}.`, 'info');
  };

  // Doctor Operations: Add Clinical Note
  const addClinicalNote = (patientId, noteText) => {
    const newNote = {
      id: 'n_' + Math.random().toString(36).substr(2, 9),
      text: noteText,
      author: 'Dr. ' + (user?.username || 'Attending'),
      createdAt: new Date().toISOString()
    };

    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, notes: [newNote, ...p.notes] } : p));
    
    const pName = patients.find(p => p.id === patientId)?.name || 'Patient';
    addSystemAlert(`NOTE ADDED: New clinical note logged for ${pName}.`, 'info');
  };

  // Doctor Operations: Approve Discharge
  const approveDischarge = (patientId) => {
    setPatients(prev => prev.map(p => p.id === patientId ? { ...p, dischargeApproved: true } : p));
    const pName = patients.find(p => p.id === patientId)?.name || 'Patient';
    addSystemAlert(`DISCHARGE APPROVED: Dr. ${user?.username} authorized discharge for ${pName}.`, 'info');
  };

  // REAL-TIME SIMULATION LOOP
  // Simulates telemetry updates and periodic incidents every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Choose a random occupied bed and alter its patient's vitals
      const occupiedBeds = beds.filter(b => b.status === 'occupied' && b.patientId);
      if (occupiedBeds.length === 0) return;

      const randomBed = occupiedBeds[Math.floor(Math.random() * occupiedBeds.length)];
      const patient = patients.find(p => p.id === randomBed.patientId);
      if (!patient) return;

      // Adjust vitals slightly
      const hrDiff = Math.floor(Math.random() * 9) - 4; // -4 to +4
      const bpDiff = Math.floor(Math.random() * 7) - 3; // -3 to +3
      const spo2Diff = Math.floor(Math.random() * 3) - 1.5; // -1.5 to +1
      const tempDiff = parseFloat((Math.random() * 0.4 - 0.2).toFixed(1)); // -0.2 to +0.2

      const nextHR = Math.max(45, Math.min(150, patient.vitals.heartRate + hrDiff));
      const nextBPSystolic = Math.max(80, Math.min(180, patient.vitals.bpSystolic + bpDiff));
      const nextBPDiastolic = Math.max(50, Math.min(110, patient.vitals.bpDiastolic + bpDiff));
      const nextSpO2 = Math.max(75, Math.min(100, Math.round(patient.vitals.spo2 + spo2Diff)));
      const nextTemp = parseFloat(Math.max(35.0, Math.min(41.0, patient.vitals.temperature + tempDiff)).toFixed(1));

      const updatedVitals = {
        heartRate: nextHR,
        bpSystolic: nextBPSystolic,
        bpDiastolic: nextBPDiastolic,
        spo2: nextSpO2,
        temperature: nextTemp
      };

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Determine critical conditions
      const criticalSpO2 = nextSpO2 < 90;
      const criticalHR = nextHR > 130 || nextHR < 48;
      const criticalTemp = nextTemp > 39.2;
      
      const isCriticalNow = criticalSpO2 || criticalHR || criticalTemp;

      setPatients(prev => prev.map(p => {
        if (p.id === patient.id) {
          const wasCritical = p.severity === 'Critical';
          const newSeverity = isCriticalNow ? 'Critical' : (nextSpO2 < 94 || nextHR > 100 || nextTemp > 38.0 ? 'Moderate' : 'Stable');

          // Trigger alerts if patient crossed into critical zone
          if (isCriticalNow && !wasCritical) {
            let symptomsAlert = [];
            if (criticalSpO2) symptomsAlert.push(`SpO2 plummeted to ${nextSpO2}%`);
            if (criticalHR) symptomsAlert.push(`HR abnormal at ${nextHR} bpm`);
            if (criticalTemp) symptomsAlert.push(`Severe fever at ${nextTemp}°C`);
            
            addSystemAlert(`CRITICAL TELEMETRY: ${p.name} (Bed ${randomBed.name}) vitals compromised (${symptomsAlert.join(', ')}).`, 'danger', p.id);
          }

          return {
            ...p,
            severity: newSeverity,
            vitals: updatedVitals,
            vitalsHistory: [...p.vitalsHistory, { timestamp, ...updatedVitals }].slice(-10)
          };
        }
        return p;
      }));

      // 2. 15% chance of an external incident: e.g. clean bed becomes vacant, or incoming ambulance alert
      const randEvent = Math.random();
      if (randEvent < 0.08) {
        // Ambulance notification
        addSystemAlert('AMBULANCE INCOMING: ETA 5 minutes. Male, 54, suspected stroke. Requesting ICU or ER Bed assignment.', 'warning');
      } else if (randEvent < 0.15) {
        // Autoclean complete
        const cleaningBeds = beds.filter(b => b.status === 'cleaning');
        if (cleaningBeds.length > 0) {
          const cleanBed = cleaningBeds[Math.floor(Math.random() * cleaningBeds.length)];
          setBeds(prev => prev.map(b => b.id === cleanBed.id ? { ...b, status: 'vacant' } : b));
          addSystemAlert(`CLEANING COMPLETED: Bed ${cleanBed.name} is fully sanitized and now VACANT.`, 'success');
        }
      }

    }, 8000);

    return () => clearInterval(interval);
  }, [beds, patients]);

  return (
    <HospitalContext.Provider value={{
      user,
      beds,
      patients,
      nurseTasks,
      alerts,
      login,
      logout,
      admitPatient,
      transferPatient,
      executeDischarge,
      updateBedStatus,
      updateVitals,
      toggleTask,
      addNurseTask,
      addPrescription,
      addClinicalNote,
      approveDischarge,
      dismissAlert,
      clearAllAlerts,
      addSystemAlert
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
