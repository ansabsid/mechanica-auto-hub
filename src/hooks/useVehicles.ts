
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Vehicle {
  id?: string;
  user_id?: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  vin?: string;
  engine_details?: {
    type: string;
    size: string;
    fuel: string;
  };
  body_style?: string;
  transmission?: string;
}

export const useVehicles = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    fetchUserVehicles();
  }, []);

  /**
   * Fetches all vehicles for the current user
   */
  const fetchUserVehicles = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      console.log("No authenticated user found");
      return [];
    }
    
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      console.log("Fetched vehicles:", data);
      setVehicles(data || []);
      return data;
    } catch (error: any) {
      console.error("Error fetching vehicles:", error.message);
      toast.error("Failed to load your vehicles");
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  /**
   * Adds a new vehicle for the current user
   */
  const addVehicle = async (vehicle: Vehicle) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      toast.error("You must be signed in to add a vehicle");
      return null;
    }

    setIsLoading(true);
    try {
      // Extract the engine_details and other extended fields
      const { engine_details, body_style, transmission, ...vehicleData } = vehicle;
      
      // Store the main vehicle information in the vehicles table
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          ...vehicleData,
          user_id: session.user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Vehicle added successfully!");
      
      // Refresh vehicles list
      await fetchUserVehicles();
      
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to add vehicle");
      console.error("Add vehicle error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Updates an existing vehicle
   */
  const updateVehicle = async (id: string, updates: Partial<Vehicle>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success("Vehicle updated successfully");
      
      // Refresh vehicles list
      await fetchUserVehicles();
      
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to update vehicle");
      console.error("Update vehicle error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Deletes a vehicle
   */
  const deleteVehicle = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success("Vehicle deleted successfully");
      
      // Refresh vehicles list
      await fetchUserVehicles();
      
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to delete vehicle");
      console.error("Delete vehicle error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    vehicles,
    isLoading,
    fetchLoading,
    fetchUserVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
};
