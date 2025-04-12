
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  ShoppingBag, 
  Car, 
  ChevronRight, 
  MapPin, 
  ClipboardCheck, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { orders, fetchUserOrders, isLoading: ordersLoading, currentOrder, fetchOrderDetails } = useOrders();
  const { 
    fetchUserAppointments, 
    cancelAppointment 
  } = useAppointmentBooking();
  const { 
    addVehicle, 
    vehicles, 
    fetchUserVehicles, 
    isLoading: vehicleLoading,
    deleteVehicle
  } = useVehicles();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: ""
  });
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [appointmentDetailsOpen, setAppointmentDetailsOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [vehicleToCancelId, setVehicleToCancelId] = useState<string | null>(null);
  const [cancelVehicleDialogOpen, setCancelVehicleDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [installations, setInstallations] = useState<any[]>([]);
  const [installationsLoading, setInstallationsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchUserVehicles();
      fetchAppointments();
      fetchInstallations();
    }
  }, [user]);

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    try {
      const data = await fetchUserAppointments();
      setAppointments(data || []);
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchInstallations = async () => {
    if (!user) return;
    
    setInstallationsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Authentication required");
        return;
      }
      
      console.log("Fetching scheduled installations for user:", session.user.id);
      
      // Modified query to directly get scheduled installations
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          id, 
          price, 
          quantity, 
          installation_fee, 
          installation_status, 
          scheduled_date, 
          scheduled_time,
          order_id,
          part_id,
          garage_id,
          orders!inner(id, user_id, status),
          garages(id, name, location)
        `)
        .eq('orders.user_id', session.user.id)
        .eq('installation_status', 'scheduled')
        .not('garage_id', 'is', null)
        .not('scheduled_date', 'is', null)
        .not('scheduled_time', 'is', null);
      
      if (error) {
        console.error("Error fetching installations:", error);
        toast.error("Failed to load your scheduled installations");
        return;
      }
      
      console.log("Found scheduled installations:", orderItems?.length || 0);
      
      if (!orderItems || orderItems.length === 0) {
        setInstallations([]);
        setInstallationsLoading(false);
        return;
      }
      
      const partIds = orderItems.map(item => item.part_id);
      
      const { data: parts, error: partsError } = await supabase
        .from('parts')
        .select('id, name, description')
        .in('id', partIds);
      
      if (partsError) {
        console.error("Error fetching part details:", partsError);
      }
      
      const installationsWithDetails = orderItems.map(item => {
        const part = parts?.find(p => p.id === item.part_id);
        return {
          ...item,
          part: part || { name: `Part #${item.part_id}`, description: null }
        };
      });
      
      console.log("Processed installations with details:", installationsWithDetails);
      setInstallations(installationsWithDetails);
    } catch (error) {
      console.error("Error in fetchInstallations:", error);
      toast.error("Failed to load installations");
    } finally {
      setInstallationsLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const result = await addVehicle(newVehicle);
    if (result) {
      setAddVehicleDialogOpen(false);
      setNewVehicle({
        make: "",
        model: "",
        year: new Date().getFullYear(),
        license_plate: ""
      });
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setCancelLoading(true);
    try {
      const success = await cancelAppointment(selectedAppointment.id, selectedAppointment.service_slot_id);
      if (success) {
        setCancelDialogOpen(false);
        await fetchAppointments();
      }
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToCancelId) return;
    
    setCancelLoading(true);
    try {
      await deleteVehicle(vehicleToCancelId);
      setCancelVehicleDialogOpen(false);
      setVehicleToCancelId(null);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };
  
  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'processing':
        return "bg-blue-500";
      case 'completed':
        return "bg-blue-500";
      case 'cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAppointmentStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'completed':
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-500";
      case 'pending':
        return "bg-yellow-500";
      case 'completed':
        return "bg-blue-500";
      case 'cancelled':
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">My Dashboard</h1>
      <p className="text-gray-600 mb-6">View and manage your orders, appointments, and vehicles</p>
      
      <Tabs defaultValue="orders" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto mb-6">
          <TabsTrigger value="orders" className="flex gap-2 items-center justify-center">
            <ShoppingBag className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex gap-2 items-center justify-center">
            <Calendar className="h-4 w-4" /> Appointments
          </TabsTrigger>
          <TabsTrigger value="installations" className="flex gap-2 items-center justify-center">
            <Wrench className="h-4 w-4" /> Installations
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex gap-2 items-center justify-center">
            <Car className="h-4 w-4" /> Vehicles
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Orders</h2>
              <Link to="/orders">
                <Button>View Orders</Button>
              </Link>
            </div>
            
            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No Orders</p>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    You don't have any orders. Place a new order to get started.
                  </p>
                  <Link to="/shop">
                    <Button>Shop Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => (
                  <Card key={order.id} className="overflow-hidden">
                    <div className={`h-2 ${getOrderStatusColor(order.status)}`}></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">Order #{order.id.substring(0, 8)}</CardTitle>
                          <div className="text-sm text-gray-500 mt-1">
                            Placed on {formatDate(order.created_at)}
                          </div>
                        </div>
                        {getOrderStatusIcon(order.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Items:</span>
                          <span>{order.items?.length || 0} items</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total:</span>
                          <span className="font-medium">${order.total_amount}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Status:</span>
                          <Badge className={getOrderStatusColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Link to={`/orders/${order.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center"
                          >
                            View Details <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Appointments</h2>
              <Link to="/garages">
                <Button>Book New Appointment</Button>
              </Link>
            </div>
            
            {appointmentsLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : appointments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Calendar className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No Appointments</p>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    You don't have any appointments booked. Book a service with one of our trusted garages.
                  </p>
                  <Link to="/garages">
                    <Button>Find a Garage</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appointments.map((appointment) => (
                  <Card key={appointment.id} className="overflow-hidden">
                    <div className={`h-2 ${getAppointmentStatusColor(appointment.status)}`}></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{appointment.service_type}</CardTitle>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-mechanica-500" />
                            {appointment.garage?.name}
                          </div>
                        </div>
                        {getAppointmentStatusIcon(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formatDate(appointment.appointment_date)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formatTime(appointment.appointment_time)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Car className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{appointment.vehicle?.make} {appointment.vehicle?.model} ({appointment.vehicle?.year})</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getAppointmentStatusColor(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </Badge>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setAppointmentDetailsOpen(true);
                            }}
                          >
                            Details <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          
                          {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setCancelDialogOpen(true);
                              }}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="installations">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Scheduled Installations</h2>
              <Link to="/orders">
                <Button>View All Orders</Button>
              </Link>
            </div>
            
            {installationsLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : installations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Wrench className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No Scheduled Installations</p>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    You don't have any scheduled installations. When you purchase parts with installation, they will appear here.
                  </p>
                  <Link to="/orders">
                    <Button>Check Your Orders</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {installations.map((installation) => (
                  <Card key={installation.id} className="overflow-hidden">
                    <div className="h-2 bg-green-500"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{installation.part.name}</CardTitle>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-mechanica-500" />
                            {installation.garages?.name || "Unknown Garage"}
                          </div>
                        </div>
                        <Badge className="bg-green-500">
                          <CheckCircle className="mr-1 h-3 w-3" /> Scheduled
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formatDate(installation.scheduled_date)}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formatTime(installation.scheduled_time)}</span>
                        </div>
                        {installation.garages?.location && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                            <span>{installation.garages.location}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm border-t pt-3 mt-3">
                        <div>
                          <div className="font-medium">Order #{installation.order_id.substring(0, 6)}</div>
                          <div className="text-muted-foreground mt-1">
                            Qty: {installation.quantity} x ${installation.price}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-green-600">
                            ${installation.installation_fee} 
                          </div>
                          <div className="text-xs text-muted-foreground">installation fee</div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 pb-3">
                      <Link to={`/orders/${installation.order_id}`} className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                          View Order Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="vehicles">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Vehicles</h2>
              <Button onClick={() => setAddVehicleDialogOpen(true)}>
                <Car className="h-4 w-4 mr-2" /> Add Vehicle
              </Button>
            </div>
            
            {vehicleLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" />
              </div>
            ) : vehicles.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Car className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">No Vehicles</p>
                  <p className="text-gray-500 text-center max-w-sm mb-6">
                    You don't have any vehicles saved. Add a vehicle to make booking appointments easier.
                  </p>
                  <Button onClick={() => setAddVehicleDialogOpen(true)}>Add Vehicle</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden">
                    <div className="bg-gray-100 h-32 flex items-center justify-center">
                      <Car className="h-16 w-16 text-gray-400" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium text-lg">{vehicle.make} {vehicle.model}</h3>
                      <div className="space-y-2 mt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500">Year:</span>
                          <span>{vehicle.year}</span>
                        </div>
                        {vehicle.license_plate && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">License Plate:</span>
                            <span>{vehicle.license_plate}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600"
                          onClick={() => {
                            setVehicleToCancelId(vehicle.id || null);
                            setCancelVehicleDialogOpen(true);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={addVehicleDialogOpen} onOpenChange={setAddVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="make">Make*</Label>
                <Input 
                  id="make" 
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                  placeholder="e.g. Toyota" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model*</Label>
                <Input 
                  id="model" 
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  placeholder="e.g. Camry" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year*</Label>
                <Input 
                  id="year" 
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                  placeholder="e.g. 2022" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license">License Plate</Label>
                <Input 
                  id="license" 
                  value={newVehicle.license_plate || ""}
                  onChange={(e) => setNewVehicle({...newVehicle, license_plate: e.target.value})}
                  placeholder="e.g. ABC123" 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAddVehicleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddVehicle}
              disabled={vehicleLoading}
            >
              {vehicleLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                "Add Vehicle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {selectedAppointment && (
        <Dialog open={appointmentDetailsOpen} onOpenChange={setAppointmentDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" /> Appointment Details
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-3 rounded-md text-center">
                <div className="text-sm text-gray-600">Confirmation Code</div>
                <div className="text-xl font-semibold font-mono tracking-wide">
                  {selectedAppointment.confirmation_code || "N/A"}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Garage</div>
                <div className="font-medium">{selectedAppointment.garage?.name}</div>
                <div className="text-xs text-gray-500 mt-1">{selectedAppointment.garage?.location}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Date</div>
                  <div className="font-medium">{formatDate(selectedAppointment.appointment_date)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Time</div>
                  <div className="font-medium">{formatTime(selectedAppointment.appointment_time)}</div>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Service</div>
                <div className="font-medium">{selectedAppointment.service_type}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Vehicle</div>
                <div className="font-medium">
                  {selectedAppointment.vehicle 
                    ? `${selectedAppointment.vehicle.make} ${selectedAppointment.vehicle.model} (${selectedAppointment.vehicle.year})`
                    : "Not specified"}
                </div>
                {selectedAppointment.vehicle?.license_plate && (
                  <div className="text-xs text-gray-500 mt-1">
                    License: {selectedAppointment.vehicle.license_plate}
                  </div>
                )}
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Status</div>
                <div className="flex items-center mt-1">
                  <Badge className={getAppointmentStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <div className="text-sm text-gray-600">Notes</div>
                  <div className="p-2 bg-gray-50 rounded-md text-sm mt-1">{selectedAppointment.notes}</div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'confirmed') && (
                <Button 
                  variant="outline"
                  className="mr-auto text-red-600"
                  onClick={() => {
                    setAppointmentDetailsOpen(false);
                    setCancelDialogOpen(true);
                  }}
                >
                  Cancel Appointment
                </Button>
              )}
              <Button variant="secondary" onClick={() => setAppointmentDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAppointment && (
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedAppointment.service_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(selectedAppointment.appointment_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{formatTime(selectedAppointment.appointment_time)}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelDialogOpen(false)}
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={cancelVehicleDialogOpen} onOpenChange={setCancelVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Vehicle</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this vehicle? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setCancelVehicleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteVehicle}
              disabled={cancelLoading}
            >
              {cancelLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Removing...
                </>
              ) : (
                "Remove Vehicle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerDashboard;
