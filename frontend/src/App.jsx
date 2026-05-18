import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from '@/services/authService';
import { ToastProvider } from '@/utils/ToastContext';
import Layout from '@/components/Layout';
import LoginPage            from '@/pages/LoginPage';
import ClientsPage          from '@/pages/ClientsPage';
import ClientDetailPage     from '@/pages/ClientDetailPage';
import AppointmentsPage     from '@/pages/AppointmentsPage';
import AppointmentDetailPage from '@/pages/AppointmentDetailPage';
import ServicesPage         from '@/pages/ServicesPage';

const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ToastProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/clients" element={
          <PrivateRoute><ClientsPage /></PrivateRoute>
        } />
        <Route path="/clients/:id" element={
          <PrivateRoute><ClientDetailPage /></PrivateRoute>
        } />

        <Route path="/appointments" element={
          <PrivateRoute><AppointmentsPage /></PrivateRoute>
        } />
        <Route path="/appointments/:id" element={
          <PrivateRoute><AppointmentDetailPage /></PrivateRoute>
        } />

        <Route path="/services" element={
          <PrivateRoute><ServicesPage /></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/clients" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
