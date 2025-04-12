
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "garage">("customer");
  const [error, setError] = useState<string | null>(null);
  const { signIn, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the redirect path and parameters from location state
  const from = location.state?.from || "/";
  const garageName = location.state?.garageName;
  const garageId = location.state?.garageId;

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (isAuthenticated) {
      if (from.startsWith('/book-appointment/')) {
        // If they were trying to book an appointment, redirect there with the garage info
        navigate(from, { 
          state: { 
            garageName,
            garageId 
          },
          replace: true 
        });
      } else {
        // Otherwise redirect to home or previous location
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, garageName, garageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    
    try {
      await signIn(email, password, role);
      // Redirect happens in the useEffect when isAuthenticated changes
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Failed to login. Please check your credentials.");
    }
  };

  const handleDemoLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (role === "customer") {
      setEmail("demo@customer.com");
      setPassword("demo123");
    } else {
      setEmail("demo@garage.com");
      setPassword("demo123");
    }
    
    try {
      toast.info(`Logging in as demo ${role}`);
      await signIn(
        role === "customer" ? "demo@customer.com" : "demo@garage.com", 
        "demo123", 
        role
      );
      // Redirect happens in useEffect
    } catch (error: any) {
      console.error("Demo login error:", error);
      setError(error.message || "Failed to login with demo account");
    }
  };

  return (
    <div className="flex justify-center items-center p-4 md:p-8 min-h-[calc(100vh-150px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login to BookMyParts</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
            {from !== "/" && (
              <div className="mt-2 text-mechanica-600 font-semibold">
                Login required to continue
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="customer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="customer" 
              onClick={() => setRole("customer")}
            >
              Customer
            </TabsTrigger>
            <TabsTrigger 
              value="garage"
              onClick={() => setRole("garage")}
            >
              Garage
            </TabsTrigger>
          </TabsList>
          
          <CardContent className="pt-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="#" className="text-sm text-mechanica-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-mechanica-600" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                >
                  Try Demo Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center w-full">
            Don't have an account?{" "}
            <Link to="/register" className="text-mechanica-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
