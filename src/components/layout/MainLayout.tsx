
import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ScannerButton from "./ScannerButton";
import { useAuth } from "@/hooks/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isLoading, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is authenticated and is a garage owner, redirect to garage dashboard
    // unless they're already on a garage-related page
    if (isAuthenticated && 
        userRole === "garage" && 
        !location.pathname.includes("garage")) {
      console.log("Garage user detected, redirecting to garage dashboard");
      navigate("/garage-dashboard");
    }
  }, [isAuthenticated, userRole, navigate, location]);

  // Loading indicator for the main layout
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children || <Outlet />}
      </main>
      <ScannerButton />
      <Footer />
    </div>
  );
};

export default MainLayout;
