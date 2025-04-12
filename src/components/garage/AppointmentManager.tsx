
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Check, 
  X, 
  RefreshCw,
  Filter,
  Phone,
  MessageSquare,
  InfoIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { useAppointmentBooking } from "@/hooks/useAppointmentBooking";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AppointmentManagerProps {
  garageId: string;
}

const AppointmentManager: React.FC<AppointmentManagerProps> = ({ garageId }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const { 
    fetchGarageAppointments, 
    updateAppointmentStatus 
  } = useAppointmentBooking();

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGarageAppointments(garageId);
      setAppointments(data || []);
      
      // Add a console log to help with debugging
      console.log(`Loaded ${data?.length || 0} appointments for garage ${garageId}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (garageId) {
      loadAppointments();
      
      // Set up auto-refresh every minute to catch new appointments
      const intervalId = setInterval(() => {
        loadAppointments();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [garageId]);

  const handleRefresh = () => {
    loadAppointments();
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    const success = await updateAppointmentStatus(appointmentId, status);
    if (success) {
      await loadAppointments();
      
      if (selectedAppointment?.id === appointmentId) {
        const updatedAppointment = appointments.find(a => a.id === appointmentId);
        if (updatedAppointment) {
          setSelectedAppointment({...updatedAppointment, status});
        }
      }
      
      setDetailsOpen(false);
    }
  };

  const handleShowDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setDetailsOpen(true);
  };

  const getFilteredAppointments = () => {
    if (statusFilter === "all") {
      return appointments;
    }
    return appointments.filter(appointment => appointment.status === statusFilter);
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

  const getStatusColor = (status: string) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      case 'completed':
        return <Check className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };

  const renderVehicleInfo = (vehicle: any) => {
    if (!vehicle) return "Not specified";
    return `${vehicle.make} ${vehicle.model} (${vehicle.year})${vehicle.license_plate ? ` • ${vehicle.license_plate}` : ''}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
          <p className="text-sm text-gray-600">Manage customer service appointments</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                <span>Filter</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : appointments.length === 0 ? (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No appointments found for this garage.
          </AlertDescription>
        </Alert>
      ) : getFilteredAppointments().length === 0 ? (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertDescription>
            No {statusFilter} appointments found.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Confirmation</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAppointments().map((appointment) => (
                <tr key={appointment.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-sm">
                    {appointment.confirmation_code || "N/A"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-mechanica-500" />
                        <span>{formatDate(appointment.appointment_date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatTime(appointment.appointment_time)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">{appointment.service_type}</td>
                  <td className="p-3">{renderVehicleInfo(appointment.vehicle)}</td>
                  <td className="p-3">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex space-x-1">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleShowDetails(appointment)}
                      >
                        Details
                      </Button>
                      
                      {appointment.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleUpdateStatus(appointment.id, 'confirmed')}
                        >
                          <Check className="h-4 w-4 mr-1" /> Confirm
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedAppointment && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
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
                <div className="font-medium">{renderVehicleInfo(selectedAppointment.vehicle)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Current Status</div>
                <div className="flex items-center mt-1">
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span className="ml-1">
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <div className="text-sm text-gray-600">Notes</div>
                  <div className="p-2 bg-gray-50 rounded-md text-sm mt-1">{selectedAppointment.notes}</div>
                </div>
              )}
              
              <div className="border-t pt-4 mt-2">
                <div className="text-sm font-medium mb-2">Update Status</div>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-green-200 hover:bg-green-50 text-green-600"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                    disabled={selectedAppointment.status === 'confirmed'}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-200 hover:bg-blue-50 text-blue-600"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    disabled={selectedAppointment.status === 'completed'}
                  >
                    <Check className="h-4 w-4 mr-1" /> Complete
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-200 hover:bg-red-50 text-red-600 col-span-2"
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    disabled={selectedAppointment.status === 'cancelled'}
                  >
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AppointmentManager;
