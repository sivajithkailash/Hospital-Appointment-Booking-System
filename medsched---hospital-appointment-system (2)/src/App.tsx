import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import MedicalRecords from './pages/MedicalRecords';
import Prescriptions from './pages/Prescriptions';
import LabReports from './pages/LabReports';
import Billing from './pages/Billing';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Patient Routes */}
          <Route path="/dashboard" element={
            <AuthGuard>
              <Layout>
                <Dashboard />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/book-appointment" element={
            <AuthGuard>
              <Layout>
                <BookAppointment />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/my-appointments" element={
            <AuthGuard>
              <Layout>
                <MyAppointments />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/medical-records" element={
            <AuthGuard>
              <Layout>
                <MedicalRecords />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/prescriptions" element={
            <AuthGuard>
              <Layout>
                <Prescriptions />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/lab-reports" element={
            <AuthGuard>
              <Layout>
                <LabReports />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/billing" element={
            <AuthGuard>
              <Layout>
                <Billing />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/messages" element={
            <AuthGuard>
              <Layout>
                <Messages />
              </Layout>
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard>
              <Layout>
                <Settings />
              </Layout>
            </AuthGuard>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <AuthGuard requireAdmin>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AuthGuard>
          } />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
