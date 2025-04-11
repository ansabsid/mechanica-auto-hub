
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface GarageInfo {
  id: string; // Required field
  name: string;
  area: string | null;
  location: string;
  images?: string | null;
  installationFee?: number | null; // Added the installationFee property
}

// New interface for adding a new garage (without id)
export interface NewGarageInfo {
  name: string;
  area: string | null;
  location: string;
  images?: string | null;
  installationFee?: string | null; // Added the installationFee property
}

/**
 * Hook for managing garage operations
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
      
      // Only select the fields we need for the card display
      const { data, error: fetchError } = await supabase
        .from('garages')
        .select('id, name, location, area, images, installation_fee')
        .order('location');
        
      if (fetchError) {
        console.error("Supabase error:", fetchError);
        throw fetchError;
      }
      
      console.log("Raw garage data response:", data);
      
      if (!data) {
        console.log("No data returned from garage query");
        setGarages([]);
        setFetchLoading(false);
        return [];
      }
      
      if (data.length === 0) {
        console.log("No garages found in the database");
        setGarages([]);
        setFetchLoading(false);
        return [];
      }
      
      console.log("Garages fetched successfully:", data);
      
      // Map the data to our expected format (converting installation_fee to installationFee)
      const formattedGarages = data.map(garage => ({
        id: garage.id,
        name: garage.name,
        location: garage.location,
        area: garage.area,
        images: garage.images,
        installationFee: garage.installation_fee
      }));
      
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
   * @param garage The garage information to add (without id)
   * @returns Promise resolving to the created garage data or null on error
   */
  const addGarage = async (garage: NewGarageInfo) => {
    setIsLoading(true);
    try {
      console.log("Adding new garage:", garage);
      
      const { data, error } = await supabase
        .from('garages')
        .insert({
          name: garage.name,
          area: garage.area,
          location: garage.location,
          images: garage.images,
          installation_fee: garage.installationFee
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
