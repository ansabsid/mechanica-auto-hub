
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
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('garage_id', garageId);
        
      if (error) throw error;
      
      setAppointments(data || []);
      return data;
    } catch (error: any) {
      console.error("Error fetching appointments:", error.message);
      toast.error("Failed to load appointments");
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

  return {
    fetchAppointments,
    createServiceSlots,
    appointments,
    isLoading,
    fetchLoading
  };
};
