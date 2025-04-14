
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ServiceSlot {
  id?: string;
  garage_id: string;
  service_type: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  is_available: boolean;
}

export const useServiceSlots = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<ServiceSlot[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  /**
   * Fetches all service slots for a specific garage
   */
  const fetchServiceSlots = async (garageId: string, date?: string) => {
    if (!garageId) {
      console.log("[SLOT DEBUG] No garage ID provided for fetching slots");
      return [];
    }
    
    console.log("[SLOT DEBUG] Fetching service slots for garage:", garageId);
    if (date) {
      console.log("[SLOT DEBUG] Filtering by date:", date);
    }
    
    setFetchLoading(true);
    try {
      let query = supabase
        .from('service_slots')
        .select('*')
        .eq('garage_id', garageId)
        .eq('is_available', true);
        
      if (date) {
        query = query.eq('date', date);
      }
      
      const { data, error } = await query.order('date', { ascending: true }).order('start_time', { ascending: true });
        
      if (error) {
        console.error("[SLOT DEBUG] Error fetching service slots:", error);
        throw error;
      }
      
      console.log("[SLOT DEBUG] Fetched slots:", data ? data.length : 0);
      if (data && data.length > 0) {
        console.log("[SLOT DEBUG] First slot:", data[0]);
        console.log("[SLOT DEBUG] Available dates:", [...new Set(data.map(slot => slot.date))]);
      } else {
        console.log("[SLOT DEBUG] No slots available for the selected criteria");
      }
      
      setSlots(data || []);
      return data;
    } catch (error: any) {
      console.error("[SLOT DEBUG] Error fetching service slots:", error.message);
      toast.error("Failed to load service slots");
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  /**
   * Creates a new service slot for a garage
   */
  const createServiceSlot = async (slot: ServiceSlot) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_slots')
        .insert({
          garage_id: slot.garage_id,
          service_type: slot.service_type,
          date: slot.date,
          start_time: slot.start_time,
          end_time: slot.end_time,
          duration_minutes: slot.duration_minutes || 60,
          is_available: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Service slot created successfully!");
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to create service slot");
      console.error("Create service slot error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates a service slot availability status
   */
  const updateSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_slots')
        .update({ is_available: isAvailable })
        .eq('id', slotId);
      
      if (error) throw error;
      
      toast.success(`Slot ${isAvailable ? 'restored' : 'marked as unavailable'}`);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to update slot availability");
      console.error("Update slot error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a service slot
   */
  const deleteServiceSlot = async (slotId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('service_slots')
        .delete()
        .eq('id', slotId);
      
      if (error) throw error;
      
      toast.success("Service slot deleted successfully");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete service slot");
      console.error("Delete service slot error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createServiceSlot,
    fetchServiceSlots,
    updateSlotAvailability,
    deleteServiceSlot,
    slots,
    isLoading,
    fetchLoading
  };
};
