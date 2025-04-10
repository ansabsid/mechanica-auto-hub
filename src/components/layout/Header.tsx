
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ChevronDown } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#9b87f5] shadow-subtle sticky top-0 z-50">
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
              className="text-white hover:text-gray-100 font-medium"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-gray-100 font-medium"
            >
              About Us
            </Link>
            <Link
              to="/garages"
              className="text-white hover:text-gray-100 font-medium"
            >
              For Garages
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gray-100 font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#9b87f5] border-white">
                <User size={18} />
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#7E69AB] hover:bg-[#6E59A5] text-white border border-white">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
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
                className="text-white hover:text-gray-100 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white hover:text-gray-100 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                About Us
              </Link>
              <Link
                to="/garages"
                className="text-white hover:text-gray-100 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                For Garages
              </Link>
              <Link
                to="/contact"
                className="text-white hover:text-gray-100 font-medium px-2 py-2"
                onClick={toggleMenu}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={toggleMenu}>
                  <Button
                    variant="outline"
                    className="w-full justify-center flex items-center gap-2 bg-white hover:bg-gray-100 text-[#9b87f5] border-white"
                  >
                    <User size={18} />
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={toggleMenu}>
                  <Button
                    className="w-full justify-center bg-[#7E69AB] hover:bg-[#6E59A5] text-white border border-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
