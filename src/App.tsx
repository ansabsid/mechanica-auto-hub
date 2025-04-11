
import React, { useEffect } from "react";
import { createBrowserRouter, RouterProvider, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
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
    
    if (!isLoading) {
      // Handle garage-specific routes
      if (location.pathname === "/garage-dashboard") {
        if (!user) {
          console.log("Access denied to garage dashboard - not logged in - redirecting to login");
          navigate("/login");
          return;
        }
        
        if (userRole !== "garage") {
          console.log("Access denied to garage dashboard - not a garage - redirecting to customer dashboard");
          navigate("/customer-dashboard");
          return;
        }
        
        console.log("Access granted to garage dashboard for garage user");
        return;
      }
      
      // Handle customer-specific routes
      if (location.pathname === "/customer-dashboard" || 
          location.pathname === "/categories" || 
          location.pathname.startsWith("/orders")) {
        if (!user) {
          console.log("Access denied to customer route - not logged in - redirecting to login");
          navigate("/login");
          return;
        }
        
        if (userRole === "garage") {
          console.log("Access denied to customer route - garage user - redirecting to garage dashboard");
          navigate("/garage-dashboard");
          return;
        }
        
        console.log("Access granted to customer route for customer user");
        return;
      }
      
      // Redirect authenticated users from login page based on role
      if (location.pathname === "/login" && user) {
        if (userRole === "garage") {
          console.log("User already logged in as garage - redirecting to garage dashboard");
          navigate("/garage-dashboard");
        } else {
          console.log("User already logged in as customer - redirecting to customer dashboard");
          navigate("/customer-dashboard");
        }
      }
    }
  }, [location.pathname, user, userRole, navigate, isLoading]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return <>{children}</>;
};

// Create the router with explicit route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <RouteGuard><Index /></RouteGuard>,
  },
  {
    path: "/about",
    element: <RouteGuard><About /></RouteGuard>,
  },
  {
    path: "/contact",
    element: <RouteGuard><Contact /></RouteGuard>,
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
    element: <RouteGuard><Garages /></RouteGuard>,
  },
  {
    path: "/customer-dashboard",
    element: <RouteGuard><CustomerDashboard /></RouteGuard>,
  },
  {
    path: "/garage-dashboard",
    element: <RouteGuard><GarageDashboard /></RouteGuard>,
  },
  {
    path: "/orders/:orderId",
    element: <RouteGuard><OrdersPage /></RouteGuard>,
  },
  {
    path: "/orders",
    element: <RouteGuard><OrdersListPage /></RouteGuard>,
  },
  {
    path: "/checkout",
    element: <RouteGuard><Checkout /></RouteGuard>,
  },
  {
    path: "/categories",
    element: <RouteGuard><CategoryPage /></RouteGuard>,
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
