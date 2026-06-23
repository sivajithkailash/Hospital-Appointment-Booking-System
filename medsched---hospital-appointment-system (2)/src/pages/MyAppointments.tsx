import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Appointment } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  MoreVertical,
  Search,
  Filter,
  X,
  CalendarDays
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '../lib/utils';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [reschedulingApt, setReschedulingApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [newTime, setNewTime] = useState('09:00');

  const fetchData = async () => {
    if (!auth.currentUser) return;
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('patientId', '==', auth.currentUser.uid),
      orderBy('date', 'desc')
    );
    const appointmentsSnap = await getDocs(appointmentsQuery);
    setAppointments(appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' });
      setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' } : apt));
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const handleReschedule = async () => {
    if (!reschedulingApt) return;
    try {
      await updateDoc(doc(db, 'appointments', reschedulingApt.id), {
        date: newDate,
        time: newTime,
        status: 'pending' // Reset to pending if it was cancelled
      });
      setAppointments(prev => prev.map(apt => 
        apt.id === reschedulingApt.id ? { ...apt, date: newDate, time: newTime, status: 'pending' } : apt
      ));
      setReschedulingApt(null);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    filter === 'all' ? true : apt.status === filter
  );

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 text-sm">View and manage your scheduled visits.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200",
                filter === f ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Appointments Found</h3>
            <p className="text-gray-500">You don't have any appointments in this category.</p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div key={apt.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6 group hover:border-blue-200 transition-all duration-200">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-600 border border-blue-100">
                  <span className="text-xs font-bold uppercase">{format(new Date(apt.date), 'MMM')}</span>
                  <span className="text-2xl font-black leading-none">{format(new Date(apt.date), 'dd')}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{apt.doctorName}</h3>
                  <p className="text-sm text-gray-500">{apt.department}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:flex md:items-center gap-8 flex-1">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Time</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Clock size={14} className="text-blue-600" /> {apt.time}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Token</p>
                  <p className="text-sm font-mono font-bold text-blue-600">{apt.token}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-3 py-1 rounded-full",
                    apt.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                    apt.status === 'completed' ? "bg-green-100 text-green-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {apt.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {apt.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => {
                        setReschedulingApt(apt);
                        setNewDate(apt.date);
                        setNewTime(apt.time);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors"
                    >
                      Reschedule
                    </button>
                    <button 
                      onClick={() => handleCancel(apt.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {apt.status !== 'pending' && (
                  <button className="px-4 py-2 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors">
                    Details
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingApt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Reschedule Appointment</h2>
              <button 
                onClick={() => setReschedulingApt(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select New Date</label>
                <input 
                  type="date"
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select New Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewTime(t)}
                      className={cn(
                        "py-2 rounded-lg text-sm font-bold transition-all",
                        newTime === t 
                          ? "bg-blue-600 text-white shadow-md" 
                          : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setReschedulingApt(null)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReschedule}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
