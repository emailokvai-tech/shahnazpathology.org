import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PatientLogin from './pages/PatientLogin';
import PatientPortal from './pages/PatientPortal';
import ClinicalDashboard from './pages/ClinicalDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/patient-login" element={<PatientLogin />} />
      <Route 
        path="/patient-portal" 
        element={
          <ProtectedRoute>
            <PatientPortal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/clinical-dashboard" 
        element={
          <ProtectedRoute>
            <ClinicalDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
