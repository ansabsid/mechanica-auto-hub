
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AppointmentBooking {
  garage_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  vehicle_id: string;
  service_slot_id?: string;
  notes?: string;
}

export interface BookingResult {
  id: string;
  confirmation_code: string;
  status: string;
  created_at: string;
}

export const useAppointmentBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [appointment, setAppointment] = useState<BookingResult | null>(null);

  /**
   * Books a new appointment
   */
  const bookAppointment = async (booking: AppointmentBooking) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error("You must be signed in to book an appointment");
      return null;
    }

    setIsLoading(true);
    try {
      // Check if the slot is still available (in case someone else just booked it)
      if (booking.service_slot_id) {
        const { data: slot, error: slotError } = await supabase
          .from('service_slots')
          .select('*')
          .eq('id', booking.service_slot_id)
          .eq('is_available', true)
          .single();
          
        if (slotError || !slot) {
          toast.error("Sorry, this slot is no longer available. Please choose another time.");
          return null;
        }
      }
      
      // Insert the appointment
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          user_id: session.user.id,
          garage_id: booking.garage_id,
          service_type: booking.service_type,
          appointment_date: booking.appointment_date,
          appointment_time: booking.appointment_time,
          vehicle_id: booking.vehicle_id,
          service_slot_id: booking.service_slot_id,
          notes: booking.notes,
          status: 'pending'
        })
        .select('id, confirmation_code, status, created_at')
        .single();
      
      if (error) throw error;
      
      // If a service slot was used, mark it as no longer available
      if (booking.service_slot_id) {
        const { error: updateError } = await supabase
          .from('service_slots')
          .update({ is_available: false })
          .eq('id', booking.service_slot_id);
          
        if (updateError) {
          console.error("Error updating slot availability:", updateError);
          // We don't throw here as the appointment was created successfully
        }
      }
      
      toast.success("Appointment booked successfully!");
      setAppointment(data);
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to book appointment");
      console.error("Book appointment error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches user's appointments
   */
  const fetchUserAppointments = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }
    
    try {
      // Fix: Use explicit select with separate joins instead of nested relations
      // This avoids the "Could not find a relationship between 'appointments' and 'garages'" error
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id, 
          user_id, 
          garage_id, 
          service_type, 
          appointment_date, 
          appointment_time, 
          status, 
          notes, 
          created_at, 
          updated_at,
          vehicle_id,
          confirmation_code
        `)
        .eq('user_id', session.user.id)
        .order('appointment_date', { ascending: true });
        
      if (error) throw error;
      
      // If we have data, fetch the related garage and vehicle information
      if (data && data.length > 0) {
        // Get all garage IDs and vehicle IDs to fetch in bulk
        const garageIds = data.map(appointment => appointment.garage_id);
        const vehicleIds = data.filter(appointment => appointment.vehicle_id)
                                .map(appointment => appointment.vehicle_id);
        
        // Fetch garage information
        const { data: garages, error: garageError } = await supabase
          .from('garages')
          .select('id, name, location')
          .in('id', garageIds);
          
        if (garageError) {
          console.error("Error fetching garage details:", garageError);
        }
        
        // Fetch vehicle information
        const { data: vehicles, error: vehicleError } = await supabase
          .from('vehicles')
          .select('id, make, model, year, license_plate')
          .in('id', vehicleIds);
          
        if (vehicleError) {
          console.error("Error fetching vehicle details:", vehicleError);
        }
        
        // Create lookup objects for faster access
        const garageLookup: Record<string, any> = {};
        const vehicleLookup: Record<string, any> = {};
        
        if (garages) {
          garages.forEach(garage => {
            garageLookup[garage.id] = garage;
          });
        }
        
        if (vehicles) {
          vehicles.forEach(vehicle => {
            vehicleLookup[vehicle.id] = vehicle;
          });
        }
        
        // Combine data to create complete appointment objects
        const appointmentsWithDetails = data.map(appointment => {
          const garage = garageLookup[appointment.garage_id];
          const vehicle = appointment.vehicle_id ? vehicleLookup[appointment.vehicle_id] : null;
          
          return {
            ...appointment,
            garage: garage ? { 
              name: garage.name, 
              location: garage.location 
            } : undefined,
            vehicle: vehicle ? {
              make: vehicle.make,
              model: vehicle.model,
              year: vehicle.year,
              license_plate: vehicle.license_plate
            } : undefined
          };
        });
        
        console.log("Fetched appointments with details:", appointmentsWithDetails);
        return appointmentsWithDetails;
      }
      
      return data;
    } catch (error: any) {
      console.error("Error fetching appointments:", error.message);
      toast.error("Failed to load appointments");
      return [];
    }
  };

  /**
   * Fetches garage's appointments
   */
  const fetchGarageAppointments = async (garageId: string) => {
    if (!garageId) return [];
    
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          vehicle:vehicles(make, model, year, license_plate)
        `)
        .eq('garage_id', garageId)
        .order('appointment_date', { ascending: true });
        
      if (error) throw error;
      
      console.log("Fetched garage appointments:", data);
      return data;
    } catch (error: any) {
      console.error("Error fetching garage appointments:", error.message);
      toast.error("Failed to load garage appointments");
      return [];
    }
  };

  /**
   * Updates appointment status
   */
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      toast.success(`Appointment status updated to ${status}`);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update appointment status");
      console.error("Update appointment status error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancels an appointment
   */
  const cancelAppointment = async (appointmentId: string, slotId?: string) => {
    setIsLoading(true);
    try {
      // Update appointment status to cancelled
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // If there's a slot ID, make it available again
      if (slotId) {
        const { error: slotError } = await supabase
          .from('service_slots')
          .update({ is_available: true })
          .eq('id', slotId);
          
        if (slotError) {
          console.error("Error restoring slot availability:", slotError);
        }
      }
      
      toast.success("Appointment cancelled successfully");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel appointment");
      console.error("Cancel appointment error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bookAppointment,
    fetchUserAppointments,
    fetchGarageAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    appointment,
    isLoading
  };
};
