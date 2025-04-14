
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Appointment, AvailableSlot } from "@/types/appointment.types";
import { 
  fetchUserAppointmentsFromApi, 
  mockFetchAvailableSlots,
  bookAppointmentApi,
  cancelAppointmentApi
} from "@/api/appointmentApi";

export type { Appointment, AvailableSlot };

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
      const appointments = await fetchUserAppointmentsFromApi(session.user.id);
      setUserAppointments(appointments);
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

  // Function to fetch available slots - using the mock function
  const fetchAvailableSlots = async (garageId: string, serviceType: string, date?: string) => {
    setIsLoading(true);
    
    try {
      const slots = mockFetchAvailableSlots(garageId, date);
      setAvailableSlots(slots);
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
      const appointment = await bookAppointmentApi(
        session.user.id,
        garageId,
        serviceType,
        date,
        time,
        undefined, // vehicleId (optional)
        notes
      );
      
      toast({
        title: "Appointment booked",
        description: "Your appointment has been scheduled successfully",
      });
      
      // Refresh appointments list
      await fetchUserAppointments();
      return appointment;
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
      await cancelAppointmentApi(appointmentId);
      
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
