
import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CustomerDashboard from "@/pages/CustomerDashboard";
import GarageDashboard from "@/pages/GarageDashboard";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={userRole === 'customer' ? '/customer-dashboard' : '/garage-dashboard'} />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to={userRole === 'customer' ? '/customer-dashboard' : '/garage-dashboard'} />} />
      <Route path="/customer-dashboard" element={isAuthenticated && userRole === 'customer' ? <CustomerDashboard /> : <Navigate to="/login" />} />
      <Route path="/garage-dashboard" element={isAuthenticated && userRole === 'garage' ? <GarageDashboard /> : <Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
