
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
  // Customer details from the orders table
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
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
      
      // First, fetch appointments with vehicle information
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          vehicle:vehicles(id, make, model, year, license_plate)
        `)
        .eq('garage_id', garageId);
        
      if (appointmentsError) {
        console.error("Supabase query error:", appointmentsError);
        throw appointmentsError;
      }
      
      console.log("Raw appointment data from database:", appointmentsData);
      
      if (!appointmentsData || appointmentsData.length === 0) {
        console.log("No appointments found for garage ID:", garageId);
        setAppointments([]);
        return [];
      }
      
      // Now we need to get user information for each appointment
      // We'll use a separate query to fetch profile information for each user_id
      const userIds = appointmentsData.map(appointment => appointment.user_id);
      
      // Fetch user profiles with explicit selection of firstName and lastName
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, firstName, lastName, phone, email')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without profile data rather than failing completely
      }
      
      // Create a map of user_id to profile data for easy lookup
      const profileMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profileMap.set(profile.id, profile);
        });
      }
      
      // Process the data to format vehicle information consistently and add customer details
      const processedAppointments = appointmentsData.map(appointment => {
        // Extract vehicle data, which should now come through with our updated RLS policies
        const vehicleData = appointment.vehicle;
        const profileData = profileMap.get(appointment.user_id);
        
        console.log(`Processing appointment ${appointment.id}, user_id: ${appointment.user_id}`);
        console.log(`Processing appointment ${appointment.id}, vehicle data:`, vehicleData);
        console.log(`Processing appointment ${appointment.id}, profile data:`, profileData);
        
        // Improved handling of customer name to use the firstName and lastName fields
        let customerName = "Unknown Customer";
        if (profileData) {
          if (profileData.firstName || profileData.lastName) {
            const firstName = profileData.firstName || '';
            const lastName = profileData.lastName || '';
            customerName = `${firstName} ${lastName}`.trim();
            console.log(`Generated customer name: '${customerName}' from firstName: '${profileData.firstName}', lastName: '${profileData.lastName}'`);
          } else {
            console.log(`Profile found for user ${appointment.user_id} but firstName/lastName are empty`);
          }
        } else {
          console.log(`No profile found for user ${appointment.user_id}`);
        }
        
        const formattedAppointment: Appointment = {
          ...appointment,
          vehicle: vehicleData,
          customer_name: customerName,
          customer_phone: profileData?.phone || "Not provided",
          customer_email: profileData?.email || "Not provided"
        };
        
        return formattedAppointment;
      });
      
      console.log("Processed appointments with vehicle data and customer details:", processedAppointments);
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
