import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function Settings() {
  const sections = [
    { icon: User, label: 'Profile Settings', desc: 'Update your personal information and photo' },
    { icon: Bell, label: 'Notifications', desc: 'Manage your appointment and message alerts' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Update password and security preferences' },
    { icon: CreditCard, label: 'Payment Methods', desc: 'Manage your cards and billing info' },
    { icon: HelpCircle, label: 'Help & Support', desc: 'Get help or contact our support team' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account preferences.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 text-3xl font-bold">
            {auth.currentUser?.displayName?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{auth.currentUser?.displayName}</h2>
            <p className="text-gray-500">{auth.currentUser?.email}</p>
            <button className="mt-2 text-blue-600 text-sm font-bold hover:underline">Change Profile Photo</button>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {sections.map((section, i) => (
            <button key={i} className="w-full p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left group">
              <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <section.icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{section.label}</h3>
                <p className="text-sm text-gray-500">{section.desc}</p>
              </div>
              <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
                <User size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
          Save Changes
        </button>
      </div>
    </div>
  );
}
