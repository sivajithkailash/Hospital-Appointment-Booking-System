import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  ClipboardList, 
  Folder, 
  Pill, 
  TestTube, 
  CreditCard, 
  MessageSquare, 
  Settings, 
  LogOut,
  Menu,
  X,
  User
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
  key?: string;
}

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: SidebarItemProps) => (
  <Link
    to={path}
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
        : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
    )}
  >
    <Icon size={20} className={cn(active ? "text-white" : "text-gray-400 group-hover:text-blue-600")} />
    <span className="font-medium">{label}</span>
  </Link>
);

interface SidebarItemData {
  icon: React.ElementType;
  label: string;
  path: string;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState<'patient' | 'admin' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
        }
      }
    };
    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const sidebarItems: SidebarItemData[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: userRole === 'admin' ? '/admin' : '/dashboard' },
    { icon: CalendarPlus, label: 'Book Appointment', path: '/book-appointment' },
    { icon: ClipboardList, label: 'My Appointments', path: '/my-appointments' },
    { icon: Folder, label: 'Medical Records', path: '/medical-records' },
    { icon: Pill, label: 'Prescriptions', path: '/prescriptions' },
    { icon: TestTube, label: 'Lab Reports', path: '/lab-reports' },
    { icon: CreditCard, label: 'Billing & Payments', path: '/billing' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="text-xl font-bold text-gray-900">MedSched</span>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {sidebarItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                path={item.path}
                active={location.pathname === item.path}
                onClick={() => setIsSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group"
            >
              <LogOut size={20} className="text-gray-400 group-hover:text-red-600" />
              <span className="font-medium">Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">{auth.currentUser?.displayName || 'User'}</p>
              <p className="text-xs text-gray-500 capitalize">{userRole || 'Patient'}</p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 border border-gray-200">
              <User size={20} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
