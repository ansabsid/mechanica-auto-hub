import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Wrench, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CustomerDashboard = () => {
  const { user, userRole } = useAuth();

  return (
    <MainLayout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>
          
          {userRole === "garage" && (
            <Alert className="mb-6 bg-mechanica-50 border-mechanica-200">
              <Wrench className="h-4 w-4 text-mechanica-500" />
              <AlertTitle>You have garage access</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>You also have access to the Garage Dashboard</span>
                <Link to="/garage-dashboard">
                  <Button variant="outline" className="bg-mechanica-100 hover:bg-mechanica-200 border-mechanica-300">
                    Go to Garage Dashboard
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Rest of the customer dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dashboard content goes here */}
            <div className="col-span-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  The Customer Dashboard is under development and will be available soon.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CustomerDashboard;
