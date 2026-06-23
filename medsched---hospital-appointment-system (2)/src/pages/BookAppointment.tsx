import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Doctor } from '../types';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

const DEPARTMENTS = [
  { id: 'gen', name: 'General Medicine', icon: Stethoscope },
  { id: 'cardio', name: 'Cardiology', icon: Stethoscope },
  { id: 'ortho', name: 'Orthopedics', icon: Stethoscope },
  { id: 'pedi', name: 'Pediatrics', icon: Stethoscope },
  { id: 'neuro', name: 'Neurology', icon: Stethoscope },
  { id: 'derma', name: 'Dermatology', icon: Stethoscope },
];

const FALLBACK_DOCTORS = [
  { id: 'd1', name: 'Dr. Sarah Wilson', specialty: 'General Medicine', experience: '12 years', rating: 4.8 },
  { id: 'd2', name: 'Dr. James Miller', specialty: 'Cardiology', experience: '15 years', rating: 4.9 },
  { id: 'd3', name: 'Dr. Emily Brown', specialty: 'Orthopedics', experience: '10 years', rating: 4.7 },
  { id: 'd4', name: 'Dr. Michael Chen', specialty: 'Pediatrics', experience: '8 years', rating: 4.6 },
  { id: 'd5', name: 'Dr. Robert Garcia', specialty: 'Neurology', experience: '20 years', rating: 5.0 },
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

export default function BookAppointment() {
  const [step, setStep] = useState(1);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'doctors'), orderBy('name', 'asc')));
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDoctors(docs.length > 0 ? docs : FALLBACK_DOCTORS);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors(FALLBACK_DOCTORS);
      }
    };
    fetchDoctors();
  }, []);

  const generateToken = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TK-';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleBooking = async () => {
    if (!auth.currentUser || !selectedDoctor || !date || !time) return;
    
    setLoading(true);
    const newToken = generateToken();
    setToken(newToken);

    try {
      await addDoc(collection(db, 'appointments'), {
        patientId: auth.currentUser.uid,
        patientName: auth.currentUser.displayName || 'Patient',
        doctorName: selectedDoctor.name,
        department: selectedDoctor.specialty || selectedDoctor.dept,
        date,
        time,
        status: 'pending',
        token: newToken,
        createdAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl shadow-blue-100 border border-blue-50 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
        <p className="text-gray-500 mb-8">Your appointment has been successfully scheduled. Please save your token number.</p>
        
        <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
          <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Your Token Number</p>
          <p className="text-4xl font-black text-blue-700 font-mono tracking-widest">{token}</p>
        </div>

        <div className="space-y-4 text-left bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Doctor</span>
            <span className="font-bold text-gray-900">{selectedDoctor?.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-bold text-gray-900">{format(new Date(date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-bold text-gray-900">{time}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/my-appointments')}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
        >
          View My Appointments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={cn(
                "w-8 h-2 rounded-full transition-all duration-300",
                step >= i ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Select Department</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept.id}
                onClick={() => {
                  setSelectedDept(dept.name);
                  setStep(2);
                }}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-200 group",
                  selectedDept === dept.name 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                )}
              >
                <dept.icon size={32} className={cn(
                  "mb-4 transition-colors",
                  selectedDept === dept.name ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"
                )} />
                <p className="font-bold text-gray-900">{dept.name}</p>
                <p className="text-xs text-gray-500 mt-1">Specialized care for your needs</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Select Doctor</h2>
            <button onClick={() => setStep(1)} className="text-blue-600 text-sm font-bold hover:underline">Back</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.filter(d => (d.specialty || d.dept) === selectedDept).map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc);
                  setStep(3);
                }}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-4 group",
                  selectedDoctor?.id === doc.id 
                    ? "border-blue-600 bg-blue-50" 
                    : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                )}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 font-bold text-2xl">
                  {doc.name.split(' ').pop()?.[0] || 'D'}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.specialty || doc.dept} • {doc.experience || doc.exp}</p>
                  <div className="flex items-center gap-1 mt-2 text-yellow-500 text-xs font-bold">
                    <span>★</span>
                    <span>{doc.rating || '4.8'} Rating</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-600" />
              </button>
            ))}
            {doctors.filter(d => (d.specialty || d.dept) === selectedDept).length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No doctors available in this department at the moment.
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Select Date & Time</h2>
            <button onClick={() => setStep(2)} className="text-blue-600 text-sm font-bold hover:underline">Back</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              <label className="block text-sm font-bold text-gray-700">Choose Date</label>
              <input 
                type="date" 
                min={format(new Date(), 'yyyy-MM-dd')}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700 flex gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <p>Please arrive 15 minutes before your scheduled time for registration.</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-4">Available Slots</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={cn(
                      "py-3 rounded-xl text-sm font-bold transition-all duration-200",
                      time === slot 
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                        : "bg-white border border-gray-100 text-gray-600 hover:border-blue-200 hover:text-blue-600"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100">
            <button
              onClick={handleBooking}
              disabled={!time || loading}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Calendar size={20} />
                  Confirm Appointment
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
