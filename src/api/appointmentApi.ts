
import { supabase } from "@/integrations/supabase/client";
import { Appointment, AvailableSlot } from "@/types/appointment.types";

export const fetchUserAppointmentsFromApi = async (userId: string): Promise<Appointment[]> => {
  try {
    // Using raw SQL query to avoid type issues with type assertion
    const { data, error } = await (supabase
      .from('appointments') as any)
      .select('*, garage:garage_id(name, location)')
      .eq('user_id', userId)
      .order('appointment_date', { ascending: true });
    
    if (error) throw error;
    
    // Handle the data with explicit type casting
    if (data) {
      return data.map((item: any) => ({
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
        garage: item.garage ? {
          name: item.garage.name || 'Unknown',
          location: item.garage.location || 'Unknown'
        } : undefined
      }));
    }
    return [];
  } catch (error: any) {
    console.error("Error fetching appointments:", error.message);
    throw error;
  }
};

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

export const bookAppointmentApi = async (
  userId: string,
  garageId: string,
  serviceType: string,
  date: string,
  time: string,
  notes?: string
) => {
  try {
    const { data, error } = await (supabase as any).rpc('insert_appointment', {
      p_user_id: userId,
      p_garage_id: garageId,
      p_service_type: serviceType,
      p_appointment_date: date,
      p_appointment_time: time,
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

export const cancelAppointmentApi = async (appointmentId: string) => {
  try {
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
