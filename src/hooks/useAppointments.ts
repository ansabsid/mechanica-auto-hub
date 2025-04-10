
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Appointment {
  id: string;
  user_id: string;
  garage_id: string;
  service_type: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  garage?: {
    name: string;
    location: string;
  };
}

export interface AvailableSlot {
  date: string;
  time: string;
  garage_id: string;
  garage_name: string;
}

export const useAppointments = () => {
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();

  // Fetch user's appointments
  const fetchUserAppointments = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to view your appointments",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Using raw SQL query to avoid type issues
      const { data, error } = await supabase
        .from('appointments')
        .select('*, garage:garage_id(name, location)')
        .eq('user_id', session.user.id)
        .order('appointment_date', { ascending: true });
      
      if (error) throw error;
      
      // Handle the data with explicit type casting
      if (data) {
        const typedAppointments = data.map(item => ({
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
            name: item.garage.name,
            location: item.garage.location
          } : undefined
        }));
        setUserAppointments(typedAppointments);
      }
    } catch (error: any) {
      console.error("Error fetching appointments:", error.message);
      toast({
        title: "Error",
        description: "Failed to load your appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock function to fetch available slots - in real app, this would fetch from the database
  // based on the garage's availability
  const fetchAvailableSlots = async (garageId: string, serviceType: string, date?: string) => {
    setIsLoading(true);
    
    try {
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
        const filteredSlots = mockSlots.filter(slot => slot.date === date);
        setAvailableSlots(filteredSlots);
      } else {
        setAvailableSlots(mockSlots);
      }
    } catch (error: any) {
      console.error("Error fetching available slots:", error.message);
      toast({
        title: "Error",
        description: "Failed to load available appointment slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Book a new appointment
  const bookAppointment = async (
    garageId: string,
    serviceType: string,
    date: string,
    time: string,
    notes?: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please login to book an appointment",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const { data, error } = await supabase.rpc('insert_appointment', {
        p_user_id: session.user.id,
        p_garage_id: garageId,
        p_service_type: serviceType,
        p_appointment_date: date,
        p_appointment_time: time,
        p_notes: notes || null
      });
      
      if (error) {
        // Fallback to direct insert if RPC isn't available
        const { data: insertData, error: insertError } = await supabase
          .from('appointments')
          .insert({
            user_id: session.user.id,
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
        
        toast({
          title: "Appointment booked",
          description: "Your appointment has been scheduled successfully",
        });
        
        // Refresh appointments list
        await fetchUserAppointments();
        return insertData;
      }
      
      toast({
        title: "Appointment booked",
        description: "Your appointment has been scheduled successfully",
      });
      
      // Refresh appointments list
      await fetchUserAppointments();
      return data;
    } catch (error: any) {
      console.error("Error booking appointment:", error.message);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsBooking(false);
    }
  };

  // Cancel an appointment
  const cancelAppointment = async (appointmentId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('update_appointment_status', { 
        p_appointment_id: appointmentId,
        p_status: 'cancelled'
      });
      
      if (error) {
        // Fallback to direct update if RPC isn't available
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointmentId);
          
        if (updateError) throw updateError;
      }
      
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled",
      });
      
      // Refresh appointments list
      await fetchUserAppointments();
    } catch (error: any) {
      console.error("Error cancelling appointment:", error.message);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize appointments on component mount
  useEffect(() => {
    const initAppointments = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserAppointments();
      }
    };

    initAppointments();
  }, []);

  return {
    userAppointments,
    availableSlots,
    isLoading,
    isBooking,
    fetchUserAppointments,
    fetchAvailableSlots,
    bookAppointment,
    cancelAppointment,
  };
};
