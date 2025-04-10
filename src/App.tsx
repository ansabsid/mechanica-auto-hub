
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/auth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import About from "./pages/About";
import Garages from "./pages/Garages";
import Contact from "./pages/Contact";
import CustomerDashboard from "./pages/CustomerDashboard";
import GarageDashboard from "./pages/GarageDashboard";
import Checkout from "./pages/Checkout";
import OrdersListPage from "./pages/OrdersListPage";
import OrderDetailPage from "./pages/OrdersPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/garages" element={<Garages />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/garage-dashboard" element={<GarageDashboard />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrdersListPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
