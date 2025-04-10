
import React, { Suspense } from 'react';
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
import { AuthProvider, useAuth } from "@/hooks/auth";
import { Toaster } from "@/components/ui/toaster";

// Loading fallback component
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-mechanica-600"></div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <AppContent />
        </Suspense>
        <Toaster />
      </AuthProvider>
    </Router>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, userRole, isLoading } = useAuth();

  // Show loading spinner while authentication is being checked
  if (isLoading) {
    return <LoadingFallback />;
  }

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
