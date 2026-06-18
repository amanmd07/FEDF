export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  admissionDate: string;
  attendingDoctor: string; // Doctor Name
  diagnosis: string;
  priority: 'Critical' | 'Urgent' | 'Stable';
  nurseNotes: string;
  doctorNotes: string;
}

export type WardType = 'ICU' | 'Emergency' | 'General Ward' | 'Pediatrics' | 'Cardiology';
export type BedStatus = 'Available' | 'Occupied' | 'Cleaning' | 'Maintenance';

export interface Bed {
  id: string;
  bedNumber: string;
  ward: WardType;
  status: BedStatus;
  patientId?: string; // Links to Patient if Occupied
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  role: 'Receptionist' | 'Nurse' | 'Doctor' | 'System';
}
