
import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wrench, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPassword, setCustomerPassword] = useState("");
  const [garageEmail, setGarageEmail] = useState("");
  const [garagePassword, setGaragePassword] = useState("");
  
  const { signIn, isLoading } = useAuth();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(customerEmail, customerPassword, "customer");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGarageLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(garageEmail, garagePassword, "garage");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <MainLayout>
      <section className="py-12 md:py-20">
        <div className="container max-w-md mx-auto px-4">
          <Tabs
            defaultValue="customer"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="customer" className="flex items-center justify-center gap-2">
                <User size={18} /> Customer
              </TabsTrigger>
              <TabsTrigger value="garage" className="flex items-center justify-center gap-2">
                <Wrench size={18} /> Garage
              </TabsTrigger>
            </TabsList>

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
