import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { LabReport } from '../types';
import { TestTube, Search, Calendar, User, Download, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function LabReports() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'labReports'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setReports(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as LabReport)));
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
          <h1 className="text-2xl font-bold text-gray-900">Lab Reports</h1>
          <p className="text-gray-500 text-sm">View your diagnostic test results.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search tests..."
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <TestTube size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Reports Found</h3>
            <p className="text-gray-500">Your lab reports will appear here once available.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                    <TestTube size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{report.testName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={14} /> {format(new Date(report.date), 'MMM dd, yyyy')}</span>
                      <span className="flex items-center gap-1"><User size={14} /> Dr. {report.doctorName}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                    <span className={cn(
                      "text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1",
                      report.status === 'Final' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    )}>
                      {report.status === 'Final' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                      {report.status}
                    </span>
                  </div>
                  <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                    <Download size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Result</p>
                  <p className="text-sm font-bold text-gray-900">{report.result}</p>
                </div>
                <button className="text-blue-600 text-sm font-bold hover:underline">View Full Report</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
