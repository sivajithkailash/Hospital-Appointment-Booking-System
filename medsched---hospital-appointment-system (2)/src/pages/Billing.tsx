import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Billing as BillingType } from '../types';
import { CreditCard, Search, Calendar, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function Billing() {
  const [bills, setBills] = useState<BillingType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, 'billing'),
        where('patientId', '==', auth.currentUser.uid),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setBills(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BillingType)));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">
    {[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl shadow-sm"></div>)}
  </div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
          <p className="text-gray-500 text-sm">View and pay your medical bills.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2">
            <CreditCard size={18} />
            Add Payment Method
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bills.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
            <CreditCard size={48} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No Bills Found</h3>
            <p className="text-gray-500">Your billing history will appear here.</p>
          </div>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 transition-all duration-200 flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border",
                  bill.status === 'paid' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                )}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{bill.description}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={14} /> {format(new Date(bill.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-8 flex-1 justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Amount</p>
                  <p className="text-xl font-black text-gray-900">${bill.amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Status</p>
                  <span className={cn(
                    "text-[10px] uppercase font-bold px-3 py-1 rounded-full flex items-center gap-1",
                    bill.status === 'paid' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  )}>
                    {bill.status === 'paid' ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    {bill.status}
                  </span>
                </div>
                <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors">
                  <Download size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
