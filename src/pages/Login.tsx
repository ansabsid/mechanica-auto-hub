import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wrench, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { isAdminUser } from "@/hooks/auth/authUtils";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [garageEmail, setGarageEmail] = useState("");
  const [garagePassword, setGaragePassword] = useState("");
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  
  const location = useLocation();
  const { signIn, isLoading, isAuthenticated, user, userRole } = useAuth();
  const navigate = useNavigate();

  const checkAdminStatus = (email: string) => {
    setIsAdmin(isAdminUser(email));
  };

  useEffect(() => {
    checkAdminStatus(customerEmail);
    
    const queryParams = new URLSearchParams(location.search);
    const type = queryParams.get("type");
    const email = queryParams.get("email");
    const password = queryParams.get("password");

    if (type === "garage" && email && password) {
      setActiveTab("garage");
      setGarageEmail(email);
      setGaragePassword(password);
    }
    
    if (isAuthenticated && user) {
      console.log("Login page - User is authenticated with role:", userRole);
      if (userRole === 'admin') {
        console.log("Admin user detected - redirecting to garage dashboard");
        navigate("/garage-dashboard");
      } else if (userRole === 'garage') {
        console.log("Redirecting to garage dashboard");
        navigate("/garage-dashboard");
      } else {
        console.log("Redirecting to customer dashboard");
        navigate("/customer-dashboard");
      }
    }
  }, [location, isAuthenticated, user, userRole, navigate, customerEmail]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!customerEmail || !customerPassword) {
        setError("Please enter both email and password");
        return;
      }
      console.log("Attempting customer login with:", customerEmail);
      await signIn(customerEmail, customerPassword, "customer");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const handleGarageLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (!garageEmail || !garagePassword) {
        setError("Please enter both email and password");
        return;
      }
      console.log("Attempting garage login with:", garageEmail);
      await signIn(garageEmail, garagePassword, "garage");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-20">
        <div className="container max-w-md mx-auto px-4">
          <Tabs
            defaultValue="customer"
            value={activeTab}
            className="w-full"
            onValueChange={(value) => {
              if (value === "garage" && !isAdmin) {
                setError("Only administrators can access the garage login");
                return;
              }
              
              setActiveTab(value);
              setError("");
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="customer" className="flex items-center justify-center gap-2">
                <User size={18} /> Customer
              </TabsTrigger>
              <TabsTrigger 
                value="garage" 
                className={`flex items-center justify-center gap-2 ${!isAdmin ? 'opacity-50' : ''}`}
                disabled={!isAdmin}
              >
                <Wrench size={18} /> Garage
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isAdmin && (
              <Alert className="mb-4 bg-green-100 border-green-400">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">Admin access granted. You may use the garage login.</AlertDescription>
              </Alert>
            )}

            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Customer Login</CardTitle>
                  <CardDescription>
                    Log in to search for parts and book services for your vehicle
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCustomerLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="customer-email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <Input
                          id="customer-email"
                          type="email"
                          placeholder="name@example.com"
                          className="pl-10"
                          required
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="customer-password" className="text-sm font-medium">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-sm text-mechanica-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                        <Input
                          id="customer-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          required
                          value={customerPassword}
                          onChange={(e) => setCustomerPassword(e.target.value)}
                        />
                        <div 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-gray-400" />
                          ) : (
                            <Eye size={18} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full bg-mechanica-500 hover:bg-mechanica-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <p className="mt-4 text-center text-sm text-gray-600">
                      Don't have an account?{" "}
                      <Link to="/register" className="text-mechanica-600 hover:underline font-medium">
                        Sign up
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>

            <TabsContent value="garage">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Garage Login</CardTitle>
                  <CardDescription>
                    Log in to manage your parts inventory and service appointments
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleGarageLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="garage-email" className="text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={18} className="text-gray-400" />
                        </div>
                        <Input
                          id="garage-email"
                          type="email"
                          placeholder="garage@example.com"
                          className="pl-10"
                          required
                          value={garageEmail}
                          onChange={(e) => setGarageEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label htmlFor="garage-password" className="text-sm font-medium">
                          Password
                        </label>
                        <Link to="/forgot-password" className="text-sm text-mechanica-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={18} className="text-gray-400" />
                        </div>
                        <Input
                          id="garage-password"
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10"
                          required
                          value={garagePassword}
                          onChange={(e) => setGaragePassword(e.target.value)}
                        />
                        <div 
                          className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff size={18} className="text-gray-400" />
                          ) : (
                            <Eye size={18} className="text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col">
                    <Button 
                      type="submit" 
                      className="w-full bg-mechanica-500 hover:bg-mechanica-600"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Login"}
                    </Button>
                    <p className="mt-4 text-center text-sm text-gray-600">
                      Not registered yet?{" "}
                      <Link to="/garages" className="text-mechanica-600 hover:underline font-medium">
                        Join as a garage
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </MainLayout>
  );
};

export default Login;
