
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Garages from "@/pages/Garages";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import CustomerDashboard from "@/pages/CustomerDashboard";
import GarageDashboard from "@/pages/GarageDashboard";
import OrdersPage from "@/pages/OrdersPage";
import OrdersListPage from "@/pages/OrdersListPage";
import Checkout from "@/pages/Checkout";
import { AuthProvider } from "@/hooks/auth/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { initializePartImages } from "@/utils/initializeImages";
import './App.css';

function App() {
  // Run initialization once when the app loads
  useEffect(() => {
    initializePartImages();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="garages" element={<Garages />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="garage-dashboard" element={<GarageDashboard />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders-list" element={<OrdersListPage />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
