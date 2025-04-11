
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GarageInfo {
  id?: string;
  name: string;
  area: string;
  location: string;
  installationFee: string;
  images?: string | null;
}

/**
 * Hook for managing garage operations (admin functionality)
 * Provides functions for fetching and adding garages
 */
export const useGarageManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [garages, setGarages] = useState<GarageInfo[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);

  /**
   * Fetches all garages from the database
   * @returns Promise resolving to an array of formatted garage info
   */
  const fetchGarages = async () => {
    setFetchLoading(true);
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*');
        
      if (error) throw error;
      
      const formattedGarages = data.map(garage => ({
        id: garage.id,
        name: garage.name,
        area: garage.area || '',
        location: garage.location,
        installationFee: '', // This might be stored elsewhere in a real app
        images: garage.images // Include the images field
      }));
      
      setGarages(formattedGarages);
      return formattedGarages;
    } catch (error: any) {
      console.error("Error fetching garages:", error.message);
      toast.error("Failed to load garages");
      return [];
    } finally {
      setFetchLoading(false);
    }
  };

  /**
   * Adds a new garage to the database
   * @param garage The garage information to add
   * @returns Promise resolving to the created garage data or null on error
   */
  const addGarage = async (garage: GarageInfo) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('garages')
        .insert({
          name: garage.name,
          area: garage.area,
          location: garage.location,
          images: garage.images
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Garage added successfully!");
      await fetchGarages(); // Refresh the garages list
      return data;
    } catch (error: any) {
      toast.error(error.message || "Failed to add garage");
      console.error("Add garage error:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchGarages,
    addGarage,
    garages,
    isLoading,
    fetchLoading
  };
};
