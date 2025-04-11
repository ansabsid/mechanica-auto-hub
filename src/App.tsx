
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/auth";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Garages from "@/pages/Garages";
import CustomerDashboard from "@/pages/CustomerDashboard";
import GarageDashboard from "@/pages/GarageDashboard";
import OrdersPage from "@/pages/OrdersPage";
import OrdersListPage from "@/pages/OrdersListPage";
import Checkout from "@/pages/Checkout";
import CategoryPage from "@/components/categories/CategoryPage";

import "./App.css";

// Component to handle route protection and redirection
const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, userRole, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("RouteGuard checking access for path:", location.pathname);
    console.log("Current user:", user?.email, "Role:", userRole);
    
    // Add specific path protection for garage dashboard
    if (location.pathname === "/garage-dashboard" && userRole !== "garage") {
      console.log("Access denied to garage dashboard - redirecting");
      navigate("/customer-dashboard");
    }
    
    // Could add more path protection logic here
    
  }, [location.pathname, user, userRole, navigate]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return <>{children}</>;
};

// Create the router with explicit route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/garages",
    element: <Garages />,
  },
  {
    path: "/customer-dashboard",
    element: <CustomerDashboard />,
  },
  {
    path: "/garage-dashboard",
    element: <GarageDashboard />,
  },
  {
    path: "/orders/:orderId",
    element: <OrdersPage />,
  },
  {
    path: "/orders",
    element: <OrdersListPage />,
  },
  {
    path: "/checkout",
    element: <Checkout />,
  },
  {
    path: "/categories",
    element: <CategoryPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

// Main App component
function App() {
  return (
    <AuthProvider>
      <RouterProvider 
        router={router} 
        fallbackElement={<div>Loading...</div>}
      />
    </AuthProvider>
  );
}

export default App;
