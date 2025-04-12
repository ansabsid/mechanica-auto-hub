
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AvailableSlot } from "@/types/appointment.types";

/**
 * Fetches all appointments for a specific user from the database
 * @param userId The UUID of the user to fetch appointments for
 * @returns Promise resolving to an array of Appointment objects
 */
export const fetchUserAppointmentsFromApi = async (userId: string): Promise<Appointment[]> => {
  try {
    // Using consistent naming for the vehicle join with the garage appointments
    const { data, error } = await (supabase
      .from('appointments') as any)
      .select('*, garage:garage_id(name, location), vehicle:vehicle_id(*)')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    
    // Handle the data with explicit type casting
    if (data) {
      return data.map((item: any) => {
        let vehicleData = null;
        
        // Handle the nested vehicle data consistently
        if (item.vehicle && Array.isArray(item.vehicle) && item.vehicle.length > 0) {
          vehicleData = item.vehicle[0];
        }
        
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
          vehicle: vehicleData ? {
            id: vehicleData.id,
            make: vehicleData.make,
            model: vehicleData.model,
            year: vehicleData.year,
            license_plate: vehicleData.license_plate,
          } : undefined,
          garage: item.garage ? {
            name: item.garage.name || 'Unknown',
            location: item.garage.location || 'Unknown'
          } : undefined
        };
      });
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching appointments:", error.message);
    throw error;
  }
};

/**
 * Mock function that simulates fetching available time slots for appointments
 * In a production environment, this would query the database for actual availability
 * @param garageId The ID of the garage to fetch slots for
 * @param date Optional date to filter slots by
 * @returns Array of available appointment slots
 */
export const mockFetchAvailableSlots = (garageId: string, date?: string): AvailableSlot[] => {
  // This is a mock implementation - in real app, this would query the database
  // for available time slots based on garage schedule and existing appointments
  const mockSlots: AvailableSlot[] = [
    { date: '2025-04-15', time: '09:00', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-15', time: '11:30', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-15', time: '14:00', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-16', time: '10:00', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-16', time: '13:30', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-17', time: '09:30', garage_id: garageId, garage_name: 'Auto Care Dubai' },
    { date: '2025-04-17', time: '12:00', garage_id: garageId, garage_name: 'Auto Care Dubai' },
  ];
  
  if (date) {
    return mockSlots.filter(slot => slot.date === date);
  } else {
    return mockSlots;
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
    console.log("Booking appointment with vehicle ID:", vehicleId);
    
    // Try to use the RPC function if available
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
        
      if (insertError) throw insertError;
      return insertData;
    }
    
    return data;
  } catch (error: any) {
    console.error("Error booking appointment:", error.message);
    throw error;
  }
};

/**
 * Cancels an existing appointment by updating its status
 * Tries to use an RPC function first, falls back to direct update if unavailable
 * @param appointmentId The ID of the appointment to cancel
 * @returns True if cancellation was successful
 */
export const cancelAppointmentApi = async (appointmentId: string) => {
  try {
    // Try to use the RPC function if available
    const { error } = await (supabase as any).rpc('update_appointment_status', { 
      p_appointment_id: appointmentId,
      p_status: 'cancelled'
    });
    
    if (error) {
      // Fallback to direct update if RPC isn't available
      const { error: updateError } = await (supabase
        .from('appointments') as any)
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);
        
      if (updateError) throw updateError;
    }
    
    return true;
  } catch (error: any) {
    console.error("Error cancelling appointment:", error.message);
    throw error;
  }
};
