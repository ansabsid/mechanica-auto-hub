
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Plus, Trash2, RefreshCw, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useServiceSlots, ServiceSlot } from "@/hooks/useServiceSlots";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";

interface ServiceSlotManagerProps {
  garageId: string;
}

const ServiceSlotManager: React.FC<ServiceSlotManagerProps> = ({ garageId }) => {
  const [newSlot, setNewSlot] = useState<Omit<ServiceSlot, 'id' | 'is_available'>>({
    garage_id: garageId,
    service_type: "",
    date: "",
    start_time: "",
    end_time: "",
    duration_minutes: 60
  });
  
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("");
  
  const { 
    fetchServiceSlots, 
    createServiceSlot, 
    deleteServiceSlot, 
    slots, 
    isLoading, 
    fetchLoading 
  } = useServiceSlots();

  useEffect(() => {
    if (garageId) {
      fetchServiceSlots(garageId);
    }
  }, [garageId]);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSlot.service_type || !newSlot.date || !newSlot.start_time || !newSlot.end_time) {
      return;
    }
    
    await createServiceSlot({
      ...newSlot,
      is_available: true
    });
    
    // Reset form
    setNewSlot({
      garage_id: garageId,
      service_type: "",
      date: "",
      start_time: "",
      end_time: "",
      duration_minutes: 60
    });
    
    // Refresh slots
    fetchServiceSlots(garageId, filterDate || undefined);
  };

  const handleDeleteSlot = async () => {
    if (!selectedSlotId) return;
    
    const success = await deleteServiceSlot(selectedSlotId);
    if (success) {
      setDeleteDialogOpen(false);
      setSelectedSlotId(null);
      fetchServiceSlots(garageId, filterDate || undefined);
    }
  };

  const handleRefresh = () => {
    fetchServiceSlots(garageId, filterDate || undefined);
  };

  const handleFilterDate = (date: string) => {
    setFilterDate(date);
    fetchServiceSlots(garageId, date || undefined);
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

  const isInThePast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateStr);
    return date < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Service Time Slots</h3>
          <p className="text-sm text-gray-600">Create and manage available appointment slots</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => handleFilterDate(e.target.value)}
            className="w-40"
          />
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <form onSubmit={handleCreateSlot} className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="font-medium mb-4">Create New Service Slot</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label htmlFor="service-type">Service Type*</Label>
            <Select
              value={newSlot.service_type}
              onValueChange={(value) => setNewSlot({...newSlot, service_type: value})}
              required
            >
              <SelectTrigger id="service-type">
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oil-change">Oil Change</SelectItem>
                <SelectItem value="brake-service">Brake Service</SelectItem>
                <SelectItem value="full-service">Full Car Service</SelectItem>
                <SelectItem value="ac-service">AC Service</SelectItem>
                <SelectItem value="tire-change">Tire Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="slot-date">Date*</Label>
            <Input 
              id="slot-date"
              type="date"
              value={newSlot.date}
              onChange={(e) => setNewSlot({...newSlot, date: e.target.value})}
              min={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time*</Label>
            <Input 
              id="start-time"
              type="time"
              value={newSlot.start_time}
              onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time*</Label>
            <Input 
              id="end-time"
              type="time"
              value={newSlot.end_time}
              onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (min)*</Label>
            <Select
              value={newSlot.duration_minutes.toString()}
              onValueChange={(value) => setNewSlot({...newSlot, duration_minutes: parseInt(value)})}
              required
            >
              <SelectTrigger id="duration">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="90">90 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="mt-4 bg-mechanica-600" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create Service Slot
            </>
          )}
        </Button>
      </form>
      
      <div className="mt-6">
        <h4 className="font-medium mb-4">Available Service Slots</h4>
        
        {fetchLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : slots.length === 0 ? (
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertDescription>
              {filterDate ? 
                `No service slots available for ${format(new Date(filterDate), 'MMMM d, yyyy')}. Add some slots above.` : 
                "No service slots available. Add some slots above."}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="text-left p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right p-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-mechanica-500" />
                        <span className={isInThePast(slot.date) ? "text-gray-400" : ""}>
                          {format(new Date(slot.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-mechanica-500" />
                        <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                      </div>
                    </td>
                    <td className="p-3">{renderServiceTypeLabel(slot.service_type)}</td>
                    <td className="p-3">{slot.duration_minutes} min</td>
                    <td className="p-3">
                      <Badge className={slot.is_available ? "bg-green-500" : "bg-gray-500"}>
                        {slot.is_available ? "Available" : "Booked"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => {
                          setSelectedSlotId(slot.id || "");
                          setDeleteDialogOpen(true);
                        }}
                        disabled={!slot.is_available}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <ConfirmDialog 
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteSlot}
        title="Delete Service Slot"
        description="Are you sure you want to delete this service slot? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={isLoading}
      />
    </div>
  );
};

export default ServiceSlotManager;
