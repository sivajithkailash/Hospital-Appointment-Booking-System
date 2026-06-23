import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Appointment, UserProfile, Doctor } from '../types';
import { 
  Users, 
  CalendarCheck, 
  CheckCircle2, 
  Search,
  MoreVertical,
  User,
  Clock,
  History,
  Stethoscope,
  Plus,
  Trash2,
  Edit,
  X,
  FileText,
  Phone,
  Mail,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'appointments' | 'doctors' | 'patients'>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<UserProfile[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<{ name: string; appointments: Appointment[] } | null>(null);
  
  // Doctor Form State
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    email: '',
    specialty: '',
    experience: '',
    phone: '',
    bio: '',
    certificateUrl: ''
  });

  const fetchData = async () => {
    setLoading(true);
    const appointmentsSnap = await getDocs(query(collection(db, 'appointments'), orderBy('date', 'desc')));
    const patientsSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'patient')));
    const doctorsSnap = await getDocs(query(collection(db, 'doctors'), orderBy('createdAt', 'desc')));

    setAppointments(appointmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment)));
    setPatients(patientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as UserProfile)));
    setDoctors(doctorsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor)));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (appointmentId: string, newStatus: 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'appointments', appointmentId), { status: newStatus });
      setAppointments(prev => prev.map(apt => apt.id === appointmentId ? { ...apt, status: newStatus } : apt));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const viewPatientHistory = (patientId: string, patientName: string) => {
    const history = appointments.filter(apt => apt.patientId === patientId);
    setSelectedPatientHistory({ name: patientName, appointments: history });
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await updateDoc(doc(db, 'doctors', editingDoctor.id), doctorForm);
      } else {
        await addDoc(collection(db, 'doctors'), {
          ...doctorForm,
          createdAt: new Date().toISOString()
        });
      }
      setShowDoctorModal(false);
      setEditingDoctor(null);
      setDoctorForm({ name: '', email: '', specialty: '', experience: '', phone: '', bio: '', certificateUrl: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await deleteDoc(doc(db, 'doctors', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting doctor:', error);
    }
  };

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total Doctors', value: doctors.length, icon: Stethoscope, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Total Appointments', value: appointments.length, icon: CalendarCheck, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
  ];

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.token.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = patients.filter(p => 
    (p.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>)}
    </div>
    <div className="h-96 bg-white rounded-xl shadow-sm"></div>
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage hospital operations, staff, and patients.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
            />
          </div>
          {activeTab === 'appointments' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {activeTab === 'doctors' && (
            <button 
              onClick={() => {
                setEditingDoctor(null);
                setDoctorForm({ name: '', email: '', specialty: '', experience: '', phone: '', bio: '', certificateUrl: '' });
                setShowDoctorModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              <Plus size={18} />
              <span>Add Doctor</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={cn("p-3 rounded-xl", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
        {[
          { id: 'appointments', label: 'Appointments', icon: CalendarCheck },
          { id: 'doctors', label: 'Doctors', icon: Stethoscope },
          { id: 'patients', label: 'Patients', icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200",
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'appointments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Patient</th>
                  <th className="px-6 py-4 font-bold">Doctor</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Token</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                          <User size={16} />
                        </div>
                        <span className="font-medium text-gray-900">{apt.patientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{apt.doctorName}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 font-medium">{format(new Date(apt.date), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-gray-500">{apt.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {apt.token}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                        apt.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        apt.status === 'completed' ? "bg-green-100 text-green-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleStatusChange(apt.id, 'completed')}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(apt.id, 'cancelled')}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Appointment"
                            >
                              <Clock size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => viewPatientHistory(apt.patientId, apt.patientName)}
                          className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors" 
                          title="View History"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredDoctors.map((doc) => (
              <div key={doc.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Stethoscope size={24} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingDoctor(doc);
                        setDoctorForm({ ...doc });
                        setShowDoctorModal(true);
                      }}
                      className="p-2 hover:bg-white rounded-lg text-blue-600 shadow-sm"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDoctor(doc.id)}
                      className="p-2 hover:bg-white rounded-lg text-red-600 shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{doc.name}</h3>
                  <p className="text-sm font-bold text-indigo-600 uppercase tracking-wider">{doc.specialty}</p>
                </div>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award size={14} className="text-gray-400" />
                    <span>{doc.experience} Experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="text-gray-400" />
                    <span>{doc.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-gray-400" />
                    <span>{doc.phone}</span>
                  </div>
                </div>
                {doc.certificateUrl && (
                  <a 
                    href={doc.certificateUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 p-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText size={14} />
                    View Certificate
                  </a>
                )}
              </div>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No doctors found. Click "Add Doctor" to get started.
              </div>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Patient Name</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Joined Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPatients.map((p) => (
                  <tr key={p.uid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{p.displayName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{format(new Date(p.createdAt), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => viewPatientHistory(p.uid, p.displayName || 'Patient')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View History"
                      >
                        <History size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Doctor Modal */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
              <button onClick={() => setShowDoctorModal(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveDoctor} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                  <input 
                    required
                    value={doctorForm.name}
                    onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                  <input 
                    required
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Phone</label>
                  <input 
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Specialty</label>
                  <input 
                    required
                    value={doctorForm.specialty}
                    onChange={(e) => setDoctorForm({...doctorForm, specialty: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Experience</label>
                  <input 
                    value={doctorForm.experience}
                    onChange={(e) => setDoctorForm({...doctorForm, experience: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. 10 Years"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Certificate URL</label>
                  <input 
                    value={doctorForm.certificateUrl}
                    onChange={(e) => setDoctorForm({...doctorForm, certificateUrl: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bio</label>
                  <textarea 
                    rows={3}
                    value={doctorForm.bio}
                    onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowDoctorModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
                >
                  {editingDoctor ? 'Update Doctor' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {selectedPatientHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">History: {selectedPatientHistory.name}</h2>
              <button 
                onClick={() => setSelectedPatientHistory(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              {selectedPatientHistory.appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No appointment history found.</p>
              ) : (
                selectedPatientHistory.appointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-900">{apt.doctorName}</p>
                      <p className="text-sm text-gray-500">{format(new Date(apt.date), 'MMM dd, yyyy')} at {apt.time}</p>
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-2 py-1 rounded-full",
                      apt.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      apt.status === 'completed' ? "bg-green-100 text-green-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {apt.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
