
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Wrench, AlertTriangle, Car, ShoppingBag, Calendar, Settings, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
          
          {/* Dashboard content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Cards */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-mechanica-500" />
                  My Orders
                </CardTitle>
                <CardDescription>View your order history</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-center text-gray-700">0</p>
                <p className="text-center text-gray-500 text-sm">Total Orders</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/orders">View Orders</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-mechanica-500" />
                  My Vehicles
                </CardTitle>
                <CardDescription>Manage your vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-center text-gray-700">0</p>
                <p className="text-center text-gray-500 text-sm">Saved Vehicles</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Add Vehicle</Button>
              </CardFooter>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-mechanica-500" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>Your scheduled service appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-center text-gray-700">0</p>
                <p className="text-center text-gray-500 text-sm">Scheduled Services</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Book Service</Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card className="col-span-1 md:col-span-2 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Commonly used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="flex flex-col h-24 items-center justify-center gap-2">
                    <ShoppingBag className="h-6 w-6" />
                    <span>Shop Parts</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-24 items-center justify-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span>Book Service</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-24 items-center justify-center gap-2">
                    <Car className="h-6 w-6" />
                    <span>Add Vehicle</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col h-24 items-center justify-center gap-2">
                    <Settings className="h-6 w-6" />
                    <span>Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Account Activity</CardTitle>
                <CardDescription>Recent activity on your account</CardDescription>
              </CardHeader>
              <CardContent className="h-48 overflow-auto">
                <div className="space-y-4">
                  <div className="flex items-start gap-2 pb-2 border-b border-gray-100">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Settings className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Account created</p>
                      <p className="text-xs text-gray-500">Your account was successfully created</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="bg-green-100 p-2 rounded-full">
                      <BarChart className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">First login</p>
                      <p className="text-xs text-gray-500">You've logged in to your account</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CustomerDashboard;
