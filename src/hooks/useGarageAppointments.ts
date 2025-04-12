import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceSlot {
  id?: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  interval: string;
  garage_id?: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  garage_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle_id?: string;
  confirmation_code?: string;
  vehicle?: {
    id?: string;
    make: string;
    model: string;
    year: number;
    license_plate?: string;
  };
  // Optional fields for UI display that might come from joins or be populated manually
  customer?: string;
  phone?: string;
  car?: string;
}

/**
 * Hook for garage owners to manage appointments and service slots
 * Provides functions for fetching appointments and creating service time slots
 */
export const useGarageAppointments = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  /**
   * Fetches all appointments for a specific garage
   * @param garageId The UUID of the garage to fetch appointments for
   * @returns Promise resolving to an array of appointments
   */
  const fetchAppointments = async (garageId: string) => {
    if (!garageId) return [];
    
    setFetchLoading(true);
    try {
      console.log("Fetching appointments for garage ID:", garageId);
      
      // Use a direct query with explicit JOIN for clearer debugging
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          vehicles:vehicle_id (*)
        `)
        .eq('garage_id', garageId);
        
      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      console.log("Raw appointment data from database:", data);
      
      if (!data || data.length === 0) {
        console.log("No appointments found for garage ID:", garageId);
        setAppointments([]);
        return [];
      }
      
      // Process the data to ensure consistent structure
      const processedAppointments = data.map(appointment => {
        console.log("Processing appointment:", appointment.id, "Vehicle data:", appointment.vehicles);
        
        // Create a properly structured appointment object
        return {
          ...appointment,
          vehicle: appointment.vehicles || undefined
        };
      });
      
      console.log("Processed appointments:", processedAppointments);
      setAppointments(processedAppointments);
      return processedAppointments;
    } catch (error: any) {
      console.error("Error fetching garage appointments:", error.message);
      toast.error("Failed to load garage appointments");
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  /**
   * Creates service time slots for a garage
   * In a production app, this would create actual database entries
   * @param slot The service slot configuration (service type, date, time range, interval)
   * @param garageId The UUID of the garage to create slots for
   * @returns Promise resolving to boolean indicating success
   */
  const createServiceSlots = async (slot: ServiceSlot, garageId: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would create available time slots
      // in a separate table. For this demo, we'll just return success.
      console.log("Creating service slots:", { ...slot, garage_id: garageId });
      
      // Example of what would happen in a real implementation:
      // const { startTime, endTime, interval, date, service } = slot;
      // const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      // const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
      // const intervalMinutes = parseInt(interval);
      
      // Generate slots at intervalMinutes apart
      // for (let time = startMinutes; time < endMinutes; time += intervalMinutes) {
      //   const slotTime = `${Math.floor(time / 60).toString().padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;
      //   await supabase.from('service_slots').insert({
      //     garage_id: garageId,
      //     service_type: service,
      //     date,
      //     time: slotTime,
      //     is_booked: false
      //   });
      // }
      
      toast.success("Service slots created successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to create service slots");
      console.error("Create service slots error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an appointment's status
   * @param appointmentId The UUID of the appointment to update
   * @param status The new status value
   * @returns Promise resolving to the updated appointment
   */
  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update the appointment in the local state
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app.id === appointmentId ? { ...app, status } : app
        )
      );
      
      return data;
    } catch (error: any) {
      console.error("Error updating appointment status:", error.message);
      toast.error("Failed to update appointment status");
      throw error;
    }
  };

  return {
    fetchAppointments,
    createServiceSlots,
    updateAppointmentStatus,
    appointments,
    isLoading,
    fetchLoading
  };
};
