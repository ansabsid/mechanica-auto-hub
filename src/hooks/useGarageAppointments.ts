
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
  vehicle?: {
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
      // First, fetch appointments
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
          confirmation_code,
          vehicle_id,
          service_slot_id
        `)
        .eq('garage_id', garageId);
        
      if (error) throw error;
      
      // If we have appointments, fetch the vehicle information
      if (data && data.length > 0) {
        // Get all vehicle IDs to fetch in bulk
        const vehicleIds = data
          .filter(appointment => appointment.vehicle_id)
          .map(appointment => appointment.vehicle_id);
        
        let vehicleLookup: Record<string, any> = {};
        
        // Only fetch vehicles if we have vehicle IDs
        if (vehicleIds.length > 0) {
          const { data: vehicles, error: vehicleError } = await supabase
            .from('vehicles')
            .select('id, make, model, year, license_plate')
            .in('id', vehicleIds);
            
          if (vehicleError) {
            console.error("Error fetching vehicle details:", vehicleError);
          } else if (vehicles) {
            // Create lookup object for faster access
            vehicles.forEach(vehicle => {
              vehicleLookup[vehicle.id] = vehicle;
            });
          }
        }
        
        // Combine data to create complete appointment objects
        const appointmentsWithVehicles = data.map(appointment => {
          const vehicle = appointment.vehicle_id ? vehicleLookup[appointment.vehicle_id] : null;
          
          return {
            ...appointment,
            vehicle: vehicle || null
          };
        });
        
        console.log("Fetched garage appointments with vehicle data:", appointmentsWithVehicles);
        setAppointments(appointmentsWithVehicles || []);
        return appointmentsWithVehicles;
      }
      
      setAppointments(data || []);
      return data;
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

  return {
    fetchAppointments,
    createServiceSlots,
    appointments,
    isLoading,
    fetchLoading
  };
};
