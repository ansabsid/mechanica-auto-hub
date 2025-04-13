
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import Register from './pages/Register';
import OrdersPage from './pages/OrdersPage';
import OrdersListPage from './pages/OrdersListPage';
import Checkout from './pages/Checkout';
import CustomerDashboard from './pages/CustomerDashboard';
import Garages from './pages/Garages';
import GarageDashboard from './pages/GarageDashboard';
import Contact from './pages/Contact';
import About from './pages/About';
import PartScanner from './pages/PartScanner';
import Categories from './pages/Categories';
import CategoryPage from './components/categories/CategoryPage';
import BookAppointment from './pages/BookAppointment';
import PitchDeck from './pages/PitchDeck';
import Settings from './pages/Settings';
import VinDecoder from './pages/VinDecoder';
import { AuthProvider } from './hooks/auth';
import { ThemeProvider } from './providers/ThemeProvider';
import { useCapacitor } from './hooks/useCapacitor';
import './App.css';

function App() {
  const { isCapacitor } = useCapacitor();
  
  // Apply any mobile-specific initializations here
  useEffect(() => {
    if (isCapacitor) {
      // Add mobile-specific initialization code here
      // For example, adjusting the status bar, handling deep links, etc.
      console.log("Initializing mobile app features");
      
      // Add a class to the body for mobile-specific styling
      document.body.classList.add('capacitor-app');
    }
  }, [isCapacitor]);
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="orders/:orderId" element={<OrdersPage />} />
              <Route path="orders" element={<OrdersListPage />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="customer-dashboard" element={<CustomerDashboard />} />
              <Route path="garages" element={<Garages />} />
              <Route path="book-appointment/:id" element={<BookAppointment />} />
              <Route path="garage-dashboard" element={<GarageDashboard />} />
              <Route path="contact" element={<Contact />} />
              <Route path="about" element={<About />} />
              <Route path="categories" element={<Categories />} />
              <Route path="category/:categoryName" element={<CategoryPage />} />
              <Route path="scanner" element={<PartScanner />} />
              <Route path="scan" element={<PartScanner />} /> {/* Adding this route as well for backward compatibility */}
              <Route path="pitch-deck" element={<PitchDeck />} />
              <Route path="settings" element={<Settings />} />
              <Route path="vin-decoder" element={<VinDecoder />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
