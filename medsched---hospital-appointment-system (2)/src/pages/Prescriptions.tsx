import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Prescription } from '../types';
import { Pill, Search, Calendar, User, Download, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'prescriptions'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setPrescriptions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Prescription)));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-xl shadow-sm"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-gray-500 text-sm">Manage and view your medications.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search medicines..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Pill size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Prescriptions Found</h3>
            <p className="text-gray-500">Your prescriptions will appear here once issued by a doctor.</p>
          </div>
        ) : (
          prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <Pill size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Prescription #{prescription.id.slice(0, 6).toUpperCase()}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(prescription.date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><User size={14} /> Dr. {prescription.doctorName}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  <Download size={16} /> Download
                </button>
              </div>
              
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Medicine</th>
                      <th className="px-4 py-3">Dosage</th>
                      <th className="px-4 py-3">Frequency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {prescription.medicines.map((med, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-gray-900">{med.name}</td>
                        <td className="px-4 py-3 text-gray-600">{med.dosage}</td>
                        <td className="px-4 py-3 text-gray-600">{med.frequency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
