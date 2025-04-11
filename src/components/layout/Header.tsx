
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, ShoppingCart, LogOut, Home, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InstallationRequestsNotification } from "@/components/garage/InstallationRequestsNotification";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("Sign out completed, redirecting to login...");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDashboardClick = () => {
    if (userRole === "garage") {
      navigate("/garage-dashboard");
    } else {
      navigate("/customer-dashboard");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-mechanica-600">BookMyParts</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-mechanica-500 transition-colors">
              Home
            </Link>
            
            {/* Show Parts and Garages links only to customers or non-authenticated users */}
            {userRole !== "garage" && (
              <>
                <Link to="/categories" className="text-gray-700 hover:text-mechanica-500 transition-colors">
                  Parts
                </Link>
                <Link to="/garages" className="text-gray-700 hover:text-mechanica-500 transition-colors">
                  Garages
                </Link>
              </>
            )}
            
            <Link to="/about" className="text-gray-700 hover:text-mechanica-500 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-mechanica-500 transition-colors">
              Contact
            </Link>
          </nav>

          {/* User Menu & Action Buttons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Only show cart for customers */}
                {userRole !== "garage" && <CartDrawer />}

                {userRole === "garage" && <InstallationRequestsNotification />}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <p className="font-medium truncate">{user?.email}</p>
                      <p className="text-sm text-gray-500 capitalize">{userRole || "User"}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDashboardClick}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>{(userRole === "garage") ? "Garage Dashboard" : "My Dashboard"}</span>
                    </DropdownMenuItem>
                    
                    {/* Only show orders for customers */}
                    {userRole !== "garage" && (
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>My Orders</span>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="outline">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 -mr-1 text-gray-600 hover:text-mechanica-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-mechanica-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Show Parts and Garages links only to customers or non-authenticated users */}
              {userRole !== "garage" && (
                <>
                  <Link
                    to="/categories"
                    className="text-gray-700 hover:text-mechanica-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Parts
                  </Link>
                  <Link
                    to="/garages"
                    className="text-gray-700 hover:text-mechanica-500 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Garages
                  </Link>
                </>
              )}
              
              <Link
                to="/about"
                className="text-gray-700 hover:text-mechanica-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-mechanica-500 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {isAuthenticated && userRole === "garage" && (
                <Link 
                  to="/garage-dashboard"
                  className="text-mechanica-600 font-medium hover:text-mechanica-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Garage Dashboard
                </Link>
              )}
              
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
