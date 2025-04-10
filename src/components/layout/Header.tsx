
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown, Wrench, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

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
    <header className="bg-white shadow-subtle sticky top-0 z-50">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/bc5d716e-e89a-48a9-b038-082d8861b31d.png" 
              alt="Bookmyparts Logo" 
              className="h-10" 
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/garages"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              For Garages
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-gray-900 font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
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

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-gray-900 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-gray-900 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link
                to="/garages"
                className="text-gray-700 hover:text-gray-900 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                For Garages
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-gray-900 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleSignOut();
                      toggleMenu();
                    }}
                    className="w-full justify-center flex items-center gap-2"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link to="/login" onClick={toggleMenu}>
                      <Button
                        variant="outline"
                        className="w-full justify-center flex items-center gap-2"
                      >
                        <User size={18} />
                        Login
                      </Button>
                    </Link>
                    <Link to="/login?type=garage&email=ansab.sid123@gmail.com&password=Ammiabbu@12345" onClick={toggleMenu}>
                      <Button
                        variant="outline"
                        className="w-full justify-center flex items-center gap-2"
                      >
                        <Wrench size={18} />
                        Garage Demo
                      </Button>
                    </Link>
                    <Link to="/register" onClick={toggleMenu}>
                      <Button
                        className="w-full justify-center"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
