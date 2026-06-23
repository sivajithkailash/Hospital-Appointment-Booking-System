import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Appointment, MedicalRecord } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(3)
      );

      const recordsQuery = query(
        collection(db, 'medicalRecords'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc'),
        limit(3)
      );

      const [appointmentsSnap, recordsSnap] = await Promise.all([
        getDocs(appointmentsQuery),
        getDocs(recordsQuery)
      ]);

      setAppointments(appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
      setRecords(recordsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-32 bg-white rounded-2xl shadow-sm"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
        <div className="h-64 bg-white rounded-2xl shadow-sm"></div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Hello, {auth.currentUser?.displayName}!</h1>
          <p className="text-blue-100 mb-6 max-w-md">How are you feeling today? Check your upcoming appointments and medical history below.</p>
          <Link 
            to="/book-appointment"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            <PlusCircle size={20} />
            Book New Appointment
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-20 -mb-20 blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              Recent Appointments
            </h2>
            <Link to="/my-appointments" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No appointments found.</p>
            ) : (
              appointments.map((apt) => (
                <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                    <span className="text-xs font-bold uppercase">{format(new Date(apt.date), 'MMM')}</span>
                    <span className="text-lg font-bold leading-none">{format(new Date(apt.date), 'dd')}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{apt.doctorName}</h3>
                    <p className="text-sm text-gray-500">{apt.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1 justify-end">
                      <Clock size={14} /> {apt.time}
                    </p>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                      apt.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      apt.status === 'completed' ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Medical Records */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Activity className="text-blue-600" size={24} />
              Medical History
            </h2>
            <Link to="/medical-records" className="text-blue-600 text-sm font-medium hover:underline flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div className="space-y-4">
            {records.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No medical records found.</p>
            ) : (
              records.map((record) => (
                <div key={record.id} className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-900">{record.diagnosis}</h3>
                    <span className="text-xs text-gray-500">{format(new Date(record.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{record.notes}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <User size={12} />
                    <span>Dr. {record.doctorName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
