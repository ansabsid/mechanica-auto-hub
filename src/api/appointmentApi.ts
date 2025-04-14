
// Update or create this file

import { supabase } from "@/integrations/supabase/client";
import { Appointment, AvailableSlot } from "@/types/appointment.types";

/**
 * Fetches all appointments for a specific user from the database
 * @param userId The UUID of the user to fetch appointments for
 * @returns Promise resolving to an array of Appointment objects
 */
export const fetchUserAppointmentsFromApi = async (userId: string): Promise<Appointment[]> => {
  try {
    console.log("[APPOINTMENT DEBUG] Fetching appointments for user:", userId);
    
    // Using consistent vehicle join approach with the garage appointments
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        garage:garages(name, location),
        vehicle:vehicles(id, make, model, year, license_plate)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) {
      console.error("[APPOINTMENT DEBUG] Error fetching appointments:", error);
      throw error;
    }
    
    console.log("[APPOINTMENT DEBUG] Found appointments:", data ? data.length : 0);
    
    // Process the data with explicit type casting
    if (data) {
      return data.map((item: any) => {
        return {
          id: item.id,
          user_id: item.user_id,
          garage_id: item.garage_id,
          service_type: item.service_type,
          appointment_date: item.appointment_date,
          appointment_time: item.appointment_time,
          status: item.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          confirmation_code: item.confirmation_code,
          vehicle_id: item.vehicle_id,
          vehicle: item.vehicle,
          garage: item.garage ? {
            name: item.garage.name || 'Unknown',
            location: item.garage.location || 'Unknown'
          } : undefined
        };
      });
    }
    return [];
  } catch (error: any) {
    console.error("[APPOINTMENT DEBUG] Error fetching appointments:", error.message);
    throw error;
  }
};

/**
 * Books a new appointment in the database
 * Tries to use an RPC function first, falls back to direct insert if unavailable
 * @param userId The user booking the appointment
 * @param garageId The garage where the appointment will take place
 * @param serviceType The type of service requested
 * @param date The appointment date
 * @param time The appointment time
 * @param vehicleId The ID of the vehicle for the appointment
 * @param notes Optional notes for the appointment
 * @returns The created appointment data
 */
export const bookAppointmentApi = async (
  userId: string,
  garageId: string,
  serviceType: string,
  date: string,
  time: string,
  vehicleId?: string,
  notes?: string
) => {
  try {
    console.log("[APPOINTMENT DEBUG] Booking appointment with params:", {
      userId,
      garageId,
      serviceType,
      date,
      time,
      vehicleId: vehicleId || "none",
      notes: notes || "none"
    });
    
    // Try to use the RPC function if available
    console.log("[APPOINTMENT DEBUG] Attempting to book via RPC function");
    const { data, error } = await (supabase as any).rpc('insert_appointment', {
      p_user_id: userId,
      p_garage_id: garageId,
      p_service_type: serviceType,
      p_appointment_date: date,
      p_appointment_time: time,
      p_vehicle_id: vehicleId || null,
      p_notes: notes || null
    });
    
    if (error) {
      console.log("[APPOINTMENT DEBUG] RPC function not available or failed:", error.message);
      console.log("[APPOINTMENT DEBUG] Falling back to direct insert");
      
      // Fallback to direct insert if RPC isn't available
      const { data: insertData, error: insertError } = await (supabase
        .from('appointments') as any)
        .insert({
          user_id: userId,
          garage_id: garageId,
          service_type: serviceType,
          appointment_date: date,
          appointment_time: time,
          vehicle_id: vehicleId || null,
          notes: notes || null,
          status: 'pending'
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("[APPOINTMENT DEBUG] Error in direct insert:", insertError);
        throw insertError;
      }
      
      console.log("[APPOINTMENT DEBUG] Appointment booked successfully via direct insert:", insertData ? insertData.id : "Unknown");
      return insertData;
    }
    
    console.log("[APPOINTMENT DEBUG] Appointment booked successfully via RPC:", data ? data.id : "Unknown");
    return data;
  } catch (error: any) {
    console.error("[APPOINTMENT DEBUG] Error booking appointment:", error.message);
    throw error;
  }
};
