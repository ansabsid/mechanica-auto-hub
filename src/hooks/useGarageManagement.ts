
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
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all garages from the database
   * @returns Promise resolving to an array of formatted garage info
   */
  const fetchGarages = async () => {
    // If already loading, prevent duplicate fetches
    if (fetchLoading) {
      console.log("Already fetching garages, request ignored");
      return garages;
    }
    
    setFetchLoading(true);
    setError(null);
    try {
      console.log("Fetching garages from the database...");
      
      const { data, error: fetchError } = await supabase
        .from('garages')
        .select('*');
        
      if (fetchError) {
        console.error("Supabase error:", fetchError);
        throw fetchError;
      }
      
      console.log("Raw garage data response:", data);
      
      if (!data) {
        console.log("No data returned from garage query");
        setGarages([]);
        return [];
      }
      
      if (data.length === 0) {
        console.log("No garages found in the database");
        setGarages([]);
        return [];
      }
      
      console.log("Garages fetched successfully:", data);
      
      const formattedGarages = data.map(garage => ({
        id: garage.id,
        name: garage.name,
        area: garage.area || '',
        location: garage.location,
        installationFee: '25.00', // Default installation fee
        images: garage.images // Include the images field
      }));
      
      console.log("Formatted garages:", formattedGarages);
      setGarages(formattedGarages);
      return formattedGarages;
    } catch (error: any) {
      console.error("Error fetching garages:", error.message);
      setError(error.message);
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
      console.log("Adding new garage:", garage);
      
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
      
      console.log("Garage added successfully:", data);
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
    fetchLoading,
    error
  };
};
