
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Wrench, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { isAuthenticated, signOut, user } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = useCart();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      console.log("Sign out button clicked, initiating logout...");
      await signOut();
      console.log("Sign out completed, redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/bc5d716e-e89a-48a9-b038-082d8861b31d.png" 
              alt="Bookmyparts Logo" 
              className="h-10" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex space-x-6 ${isMobile ? "hidden" : ""}`}>
            <Link
              to="/"
              className={`text-gray-700 hover:text-mechanica-600 ${
                location.pathname === "/" ? "font-semibold text-mechanica-600" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/categories"
              className={`text-gray-700 hover:text-mechanica-600 ${
                location.pathname === "/categories" ? "font-semibold text-mechanica-600" : ""
              }`}
            >
              Find Parts
            </Link>
            <Link
              to="/garages"
              className={`text-gray-700 hover:text-mechanica-600 ${
                location.pathname === "/garages" ? "font-semibold text-mechanica-600" : ""
              }`}
            >
              Garages
            </Link>
            <Link
              to="/about"
              className={`text-gray-700 hover:text-mechanica-600 ${
                location.pathname === "/about" ? "font-semibold text-mechanica-600" : ""
              }`}
            >
              About
            </Link>
            <Link
              to="/contact"
              className={`text-gray-700 hover:text-mechanica-600 ${
                location.pathname === "/contact" ? "font-semibold text-mechanica-600" : ""
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <CartDrawer />
            
            {isAuthenticated && user ? (
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut size={18} />
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="flex items-center gap-2">
                    <User size={18} />
                    Login
                  </Button>
                </Link>
                <Link to="/login?type=garage&email=ansab.sid123@gmail.com&password=Ammiabbu@12345">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Wrench size={18} />
                    Garage Demo
                  </Button>
                </Link>
                <Link to="/register">
                  <Button>
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`text-gray-700 hover:text-mechanica-600 ${
                  location.pathname === "/" ? "font-semibold text-mechanica-600" : ""
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Home
              </Link>
              <Link
                to="/categories"
                className={`text-gray-700 hover:text-mechanica-600 ${
                  location.pathname === "/categories" ? "font-semibold text-mechanica-600" : ""
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Find Parts
              </Link>
              <Link
                to="/garages"
                className={`text-gray-700 hover:text-mechanica-600 ${
                  location.pathname === "/garages" ? "font-semibold text-mechanica-600" : ""
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Garages
              </Link>
              <Link
                to="/about"
                className={`text-gray-700 hover:text-mechanica-600 ${
                  location.pathname === "/about" ? "font-semibold text-mechanica-600" : ""
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`text-gray-700 hover:text-mechanica-600 ${
                  location.pathname === "/contact" ? "font-semibold text-mechanica-600" : ""
                }`}
                onClick={() => setShowMobileMenu(false)}
              >
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
