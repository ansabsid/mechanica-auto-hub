
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
      
      // Use a direct fetch with the anon key to bypass authentication completely
      // This is a more reliable approach than setting auth to null
      const response = await fetch(
        'https://gwjvqtusnhahjlzafixp.supabase.co/rest/v1/garages?select=id,name,location,area,images,installation_fee&order=location',
        {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3anZxdHVzbmhhaGpsemFmaXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMTUzMjcsImV4cCI6MjA1OTg5MTMyN30.LTh4vNu2-Ck0Chg8cSeSF01Dl_Tb4q6DByACQLwTV1M',
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw garage data response:", data);
      
      if (!data || data.length === 0) {
        console.log("No garages found in the database");
        setGarages([]);
        setFetchLoading(false);
        return [];
      }
      
      console.log("Garages fetched successfully:", data);
      console.log("Sample first garage data:", data[0]);
      
      // Map the data to our expected format (converting installation_fee to installationFee)
      const formattedGarages = data.map(garage => ({
        id: garage.id,
        name: garage.name,
        location: garage.location,
        area: garage.area,
        images: garage.images,
        installationFee: garage.installation_fee
      }));
      
      console.log("Formatted garages:", formattedGarages);
      setGarages(formattedGarages);
      return formattedGarages;
    } catch (error: any) {
      console.error("Error fetching garages:", error.message);
      console.error("Full error object:", error);
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
      
      // Convert installationFee string to number or null before insertion
      const installation_fee = garage.installationFee 
        ? parseFloat(garage.installationFee) 
        : null;
        
      const { data, error } = await supabase
        .from('garages')
        .insert({
          name: garage.name,
          area: garage.area,
          location: garage.location,
          images: garage.images,
          installation_fee: installation_fee
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

  /**
   * Clears all garages from the database (for testing purposes)
   */
  const clearAllGarages = async () => {
    setIsLoading(true);
    try {
      console.log("Clearing all garages...");
      
      const { error } = await supabase
        .from('garages')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except this impossible ID (safety measure)
        
      if (error) throw error;
      
      console.log("All garages cleared successfully");
      toast.success("All garages cleared!");
      setGarages([]);
      return true;
    } catch (error: any) {
      toast.error(error.message || "Failed to clear garages");
      console.error("Clear garages error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchGarages,
    addGarage,
    clearAllGarages,
    garages,
    isLoading,
    fetchLoading,
    error
  };
};
