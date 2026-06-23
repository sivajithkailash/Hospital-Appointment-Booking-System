import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { MedicalRecord } from '../types';
import { Folder, Search, Filter, Download, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'medicalRecords'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MedicalRecord)));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl shadow-sm"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-500 text-sm">Access your complete medical history.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search records..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <Folder size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Records Found</h3>
            <p className="text-gray-500">Your medical history will appear here once available.</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <Folder size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{record.diagnosis}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(record.date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><User size={14} /> Dr. {record.doctorName}</span>
                    </div>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  <Download size={16} /> Download PDF
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Doctor's Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{record.notes}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
