export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  experience: string;
  certificateUrl?: string;
  phone: string;
  bio: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: 'patient' | 'admin';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
  token: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  diagnosis: string;
  notes: string;
  doctorName: string;
  createdAt: string;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  date: string;
  medicines: Medicine[];
  doctorName: string;
  createdAt: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  date: string;
  testName: string;
  result: string;
  status: string;
  doctorName: string;
  createdAt: string;
}

export interface Billing {
  id: string;
  patientId: string;
  date: string;
  amount: number;
  description: string;
  status: 'paid' | 'unpaid';
  createdAt: string;
}
