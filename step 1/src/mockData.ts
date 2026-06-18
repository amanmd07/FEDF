import { Bed, Patient, Doctor, LogEvent } from './types';

export const mockDoctors: Doctor[] = [
  { id: 'doc-1', name: 'Dr. Sarah Connor', specialty: 'Intensive Care' },
  { id: 'doc-2', name: 'Dr. Robert Chen', specialty: 'Emergency Medicine' },
  { id: 'doc-3', name: 'Dr. Elena Rostova', specialty: 'Cardiology' },
  { id: 'doc-4', name: 'Dr. James Wilson', specialty: 'Pediatrics' },
  { id: 'doc-5', name: 'Dr. Lisa Cuddy', specialty: 'Internal Medicine' }
];

export const initialPatients: Patient[] = [
  {
    id: 'pat-1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    admissionDate: '2026-06-18T10:00:00Z',
    attendingDoctor: 'Dr. Sarah Connor',
    diagnosis: 'Severe respiratory distress secondary to pneumonia',
    priority: 'Critical',
    nurseNotes: 'Oxygen levels stable at 94% on high-flow nasal cannula. Monitored hourly.',
    doctorNotes: 'Initiate broad-spectrum antibiotics. Monitor ABG closely.'
  },
  {
    id: 'pat-2',
    name: 'Mary Jane',
    age: 28,
    gender: 'Female',
    admissionDate: '2026-06-18T14:30:00Z',
    attendingDoctor: 'Dr. Robert Chen',
    diagnosis: 'Acute appendicitis, pre-op',
    priority: 'Urgent',
    nurseNotes: 'NPO (nothing by mouth). IV fluids running. Pain managed with analgesics.',
    doctorNotes: 'Surgical consult completed. Scheduled for appendectomy at 18:00.'
  },
  {
    id: 'pat-3',
    name: 'David Smith',
    age: 67,
    gender: 'Male',
    admissionDate: '2026-06-17T08:15:00Z',
    attendingDoctor: 'Dr. Elena Rostova',
    diagnosis: 'Congestive heart failure exacerbation',
    priority: 'Stable',
    nurseNotes: 'Daily weight checked. Urine output monitored. Tolerating oral intake.',
    doctorNotes: 'Titrating diuretics. Check electrolytes in the morning.'
  },
  {
    id: 'pat-4',
    name: 'Emma Watson',
    age: 6,
    gender: 'Female',
    admissionDate: '2026-06-18T16:00:00Z',
    attendingDoctor: 'Dr. James Wilson',
    diagnosis: 'Dehydration secondary to acute gastroenteritis',
    priority: 'Stable',
    nurseNotes: 'Encouraging oral rehydration fluids. IV line patent and infusing.',
    doctorNotes: 'Discharge tomorrow morning if oral intake remains adequate.'
  },
  {
    id: 'pat-5',
    name: 'Arthur Pendragon',
    age: 52,
    gender: 'Male',
    admissionDate: '2026-06-18T11:45:00Z',
    attendingDoctor: 'Dr. Elena Rostova',
    diagnosis: 'Unstable angina, chest pain evaluation',
    priority: 'Urgent',
    nurseNotes: 'Continuous cardiac monitoring. Report any recurrences of chest pain immediately.',
    doctorNotes: 'Rule out myocardial infarction. Scheduled for cardiac catheterization.'
  }
];

export const initialBeds: Bed[] = [
  // ICU Beds
  { id: 'bed-icu-1', bedNumber: 'ICU-101', ward: 'ICU', status: 'Occupied', patientId: 'pat-1' },
  { id: 'bed-icu-2', bedNumber: 'ICU-102', ward: 'ICU', status: 'Available' },
  { id: 'bed-icu-3', bedNumber: 'ICU-103', ward: 'ICU', status: 'Cleaning' },
  { id: 'bed-icu-4', bedNumber: 'ICU-104', ward: 'ICU', status: 'Available' },
  { id: 'bed-icu-5', bedNumber: 'ICU-105', ward: 'ICU', status: 'Maintenance' },
  { id: 'bed-icu-6', bedNumber: 'ICU-106', ward: 'ICU', status: 'Available' },

  // Emergency Beds
  { id: 'bed-er-1', bedNumber: 'ER-201', ward: 'Emergency', status: 'Occupied', patientId: 'pat-2' },
  { id: 'bed-er-2', bedNumber: 'ER-202', ward: 'Emergency', status: 'Available' },
  { id: 'bed-er-3', bedNumber: 'ER-203', ward: 'Emergency', status: 'Occupied', patientId: 'pat-5' },
  { id: 'bed-er-4', bedNumber: 'ER-204', ward: 'Emergency', status: 'Available' },
  { id: 'bed-er-5', bedNumber: 'ER-205', ward: 'Emergency', status: 'Cleaning' },
  { id: 'bed-er-6', bedNumber: 'ER-206', ward: 'Emergency', status: 'Available' },

  // General Ward Beds
  { id: 'bed-gw-1', bedNumber: 'GW-301', ward: 'General Ward', status: 'Occupied', patientId: 'pat-3' },
  { id: 'bed-gw-2', bedNumber: 'GW-302', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-3', bedNumber: 'GW-303', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-4', bedNumber: 'GW-304', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-5', bedNumber: 'GW-305', ward: 'General Ward', status: 'Maintenance' },
  { id: 'bed-gw-6', bedNumber: 'GW-306', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-7', bedNumber: 'GW-307', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-8', bedNumber: 'GW-308', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-9', bedNumber: 'GW-309', ward: 'General Ward', status: 'Available' },
  { id: 'bed-gw-10', bedNumber: 'GW-310', ward: 'General Ward', status: 'Available' },

  // Pediatrics Beds
  { id: 'bed-ped-1', bedNumber: 'PED-401', ward: 'Pediatrics', status: 'Occupied', patientId: 'pat-4' },
  { id: 'bed-ped-2', bedNumber: 'PED-402', ward: 'Pediatrics', status: 'Available' },
  { id: 'bed-ped-3', bedNumber: 'PED-403', ward: 'Pediatrics', status: 'Cleaning' },
  { id: 'bed-ped-4', bedNumber: 'PED-404', ward: 'Pediatrics', status: 'Available' },
  { id: 'bed-ped-5', bedNumber: 'PED-405', ward: 'Pediatrics', status: 'Available' },
  { id: 'bed-ped-6', bedNumber: 'PED-406', ward: 'Pediatrics', status: 'Available' },

  // Cardiology Beds
  { id: 'bed-card-1', bedNumber: 'CARD-501', ward: 'Cardiology', status: 'Available' },
  { id: 'bed-card-2', bedNumber: 'CARD-502', ward: 'Cardiology', status: 'Available' },
  { id: 'bed-card-3', bedNumber: 'CARD-503', ward: 'Cardiology', status: 'Available' },
  { id: 'bed-card-4', bedNumber: 'CARD-504', ward: 'Cardiology', status: 'Available' },
  { id: 'bed-card-5', bedNumber: 'CARD-505', ward: 'Cardiology', status: 'Available' },
  { id: 'bed-card-6', bedNumber: 'CARD-506', ward: 'Cardiology', status: 'Available' }
];

export const initialLogs: LogEvent[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-18T10:00:00Z',
    message: 'Patient John Doe admitted to bed ICU-101.',
    type: 'success',
    role: 'Receptionist'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-18T11:45:00Z',
    message: 'Patient Arthur Pendragon admitted to bed ER-203.',
    type: 'success',
    role: 'Receptionist'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-18T13:00:00Z',
    message: 'Nurse updated vitals check for patient John Doe in ICU-101.',
    type: 'info',
    role: 'Nurse'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-18T15:00:00Z',
    message: 'Dr. Sarah Connor updated treatment notes for John Doe.',
    type: 'info',
    role: 'Doctor'
  },
  {
    id: 'log-5',
    timestamp: '2026-06-18T16:00:00Z',
    message: 'Patient Emma Watson admitted to bed PED-401.',
    type: 'success',
    role: 'Receptionist'
  }
];
