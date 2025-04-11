import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Car, 
  Info, 
  MapPin,
  ArrowLeft,
  Check,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useServiceSlots, ServiceSlot } from "@/hooks/useServiceSlots";
import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAppointmentBooking, AppointmentBooking } from "@/hooks/useAppointmentBooking";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";

const BookAppointment = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const garageName = location.state?.garageName || "Garage";
  const garageId = id || location.state?.garageId;
  
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<ServiceSlot | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [step, setStep] = useState<number>(1);
  const [addVehicleDialogOpen, setAddVehicleDialogOpen] = useState<boolean>(false);
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    make: "",
    model: "",
    year: new Date().getFullYear(),
    license_plate: ""
  });
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  
  const { 
    fetchServiceSlots, 
    slots, 
    fetchLoading: slotsLoading 
  } = useServiceSlots();
  
  const { 
    vehicles, 
    fetchLoading: vehiclesLoading, 
    isLoading: vehicleActionLoading,
    addVehicle 
  } = useVehicles();
  
  const { 
    bookAppointment, 
    isLoading: bookingLoading,
    appointment 
  } = useAppointmentBooking();

  useEffect(() => {
    if (!garageId) {
      navigate('/garages');
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to book an appointment");
      navigate('/login', { state: { redirectTo: `/book-appointment/${garageId}` } });
      return;
    }
    
    fetchServiceSlots(garageId);
  }, [garageId, user]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    fetchServiceSlots(garageId, date);
    setStep(2);
  };

  const handleSlotSelect = (slot: ServiceSlot) => {
    setSelectedSlot(slot);
    setStep(3);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
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
      setSelectedVehicle(result.id || "");
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedVehicle) {
      toast.error("Please select a time slot and vehicle");
      return;
    }
    
    const booking: AppointmentBooking = {
      garage_id: garageId,
      service_type: selectedSlot.service_type,
      appointment_date: selectedSlot.date,
      appointment_time: selectedSlot.start_time,
      vehicle_id: selectedVehicle,
      service_slot_id: selectedSlot.id,
      notes: notes
    };
    
    const result = await bookAppointment(booking);
    if (result) {
      setShowConfirmation(true);
    }
  };

  const getAvailableDates = () => {
    const uniqueDates = new Set<string>();
    slots.forEach(slot => uniqueDates.add(slot.date));
    return Array.from(uniqueDates).sort();
  };

  const getAvailableSlots = (date: string) => {
    return slots.filter(slot => slot.date === date);
  };

  const renderServiceTypeLabel = (type: string) => {
    switch (type) {
      case 'oil-change':
        return 'Oil Change';
      case 'brake-service':
        return 'Brake Service';
      case 'full-service':
        return 'Full Car Service';
      case 'ac-service':
        return 'AC Service';
      case 'tire-change':
        return 'Tire Change';
      default:
        return type;
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, MMMM do, yyyy');
  };

  const calculateDurationMinutes = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  if (showConfirmation && appointment) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-center text-2xl text-green-700">Appointment Confirmed!</CardTitle>
            <CardDescription className="text-center text-green-600">
              Your appointment has been successfully scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="text-center mb-4 pb-4 border-b">
                <h3 className="text-lg font-semibold">Confirmation Code</h3>
                <p className="text-3xl font-mono font-bold tracking-wider text-mechanica-600 mt-2">
                  {appointment.confirmation_code}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Please save this code for check-in at the garage
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Garage:</span>
                  <span className="font-medium">{garageName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{selectedSlot && renderServiceTypeLabel(selectedSlot.service_type)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedSlot && formatDate(selectedSlot.date)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedSlot && formatTime(selectedSlot.start_time)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-yellow-500">Pending</Badge>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button 
              onClick={() => navigate('/customer-dashboard')}
              className="w-full"
            >
              View My Appointments
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/garages')}
            >
              Back to Garages
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Button 
        variant="ghost" 
        className="mb-6" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-2">Book an Appointment</h1>
      <div className="flex items-center text-gray-600 mb-6">
        <MapPin className="h-4 w-4 mr-1 text-mechanica-500" />
        <span>{garageName}</span>
      </div>
      
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 1 ? 'bg-mechanica-600 text-white' : 'bg-gray-200'}`}>1</div>
          <div className={`h-1 w-12 ${step >= 2 ? 'bg-mechanica-600' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 2 ? 'bg-mechanica-600 text-white' : 'bg-gray-200'}`}>2</div>
          <div className={`h-1 w-12 ${step >= 3 ? 'bg-mechanica-600' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step >= 3 ? 'bg-mechanica-600 text-white' : 'bg-gray-200'}`}>3</div>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Select Date</span>
          <span>Select Time</span>
          <span>Vehicle Details</span>
        </div>
      </div>
      
      <Tabs defaultValue="dates" value={step === 1 ? "dates" : step === 2 ? "times" : "vehicle"}>
        <TabsContent value="dates" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" /> Select a Date
              </CardTitle>
              <CardDescription>
                Choose a date for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : getAvailableDates().length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No available appointment dates found for this garage.</p>
                  <p className="text-sm text-gray-500 mt-2">Please check back later or contact the garage directly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getAvailableDates().map(date => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className="border rounded-lg p-3 text-center hover:border-mechanica-500 transition-colors"
                    >
                      <p className="font-medium">{format(new Date(date), 'EEE')}</p>
                      <p className="text-2xl font-bold">{format(new Date(date), 'd')}</p>
                      <p className="text-gray-600">{format(new Date(date), 'MMM')}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="times" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" /> Select a Time
              </CardTitle>
              <CardDescription>
                Available appointments on {selectedDate && formatDate(selectedDate)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {slotsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : getAvailableSlots(selectedDate).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No available time slots found for this date.</p>
                  <p className="text-sm text-gray-500 mt-2">Please select a different date.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getAvailableSlots(selectedDate).map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
                      className="w-full flex justify-between items-center border rounded-lg p-4 hover:border-mechanica-500 transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <Clock className="h-5 w-5 text-mechanica-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{formatTime(slot.start_time)}</p>
                          <p className="text-sm text-gray-600">{renderServiceTypeLabel(slot.service_type)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{calculateDurationMinutes(slot.start_time, slot.end_time)} mins</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => setStep(1)}>Back to Dates</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="vehicle" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Car className="h-5 w-5 mr-2" /> Vehicle Information
              </CardTitle>
              <CardDescription>
                Select a vehicle for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">You don't have any vehicles in your account.</p>
                  <Button 
                    onClick={() => setAddVehicleDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add a Vehicle
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleSelect(vehicle.id || "")}
                      className={`w-full flex justify-between items-center border rounded-lg p-4 transition-colors ${
                        selectedVehicle === vehicle.id 
                          ? 'border-mechanica-500 bg-mechanica-50' 
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-full mr-3">
                          <Car className="h-5 w-5 text-mechanica-500" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-600">{vehicle.year} {vehicle.license_plate && `• ${vehicle.license_plate}`}</p>
                        </div>
                      </div>
                      {selectedVehicle === vehicle.id && (
                        <Check className="h-5 w-5 text-mechanica-500" />
                      )}
                    </button>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setAddVehicleDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Another Vehicle
                  </Button>
                </div>
              )}
              
              <div className="mt-6">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  placeholder="Enter any special instructions or details about your service needs"
                  className="mt-2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              {selectedSlot && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Appointment Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-20 text-gray-600">Service:</span>
                      <span>{renderServiceTypeLabel(selectedSlot.service_type)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-gray-600">Date:</span>
                      <span>{formatDate(selectedSlot.date)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-gray-600">Time:</span>
                      <span>{formatTime(selectedSlot.start_time)}</span>
                    </div>
                    <div className="flex">
                      <span className="w-20 text-gray-600">Duration:</span>
                      <span>{selectedSlot.duration_minutes} minutes</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!selectedVehicle || bookingLoading}
                className="bg-mechanica-600"
              >
                {bookingLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={addVehicleDialogOpen} onOpenChange={setAddVehicleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a Vehicle</DialogTitle>
            <DialogDescription>
              Enter your vehicle information for the appointment
            </DialogDescription>
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
              disabled={vehicleActionLoading}
            >
              {vehicleActionLoading ? (
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
    </div>
  );
};

export default BookAppointment;
