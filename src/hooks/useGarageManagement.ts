
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Garage {
  id: string;
  name: string;
  area: string | null;
  location: string;
  images?: string | null;
  installationFee?: number | null;
}

// Add alias to maintain compatibility with GarageTable component
export type GarageInfo = Garage;

export interface NewGarage {
  name: string;
  area: string;
  location: string;
}

/**
 * Hook for managing garage operations
 * Provides functions for fetching and adding garages
 */
export const useGarageManagement = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all garages from the database
   * @returns Promise resolving to an array of formatted garage info
   */
  const fetchGarages = async () => {
    if (fetchLoading) {
      console.log("Already fetching garages, request ignored");
      return garages;
    }
    
    setFetchLoading(true);
    setError(null);
    try {
      console.log("Fetching garages from the database...");
      
      const response = await fetch(
        'https://gwjvqtusnhahjlzafixp.supabase.co/rest/v1/garages?select=id,name,location,area,images&order=location',
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
      
      const formattedGarages = data.map(garage => ({
        id: garage.id,
        name: garage.name,
        location: garage.location,
        area: garage.area,
        images: garage.images
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
  const addGarage = async (garageData: NewGarage) => {
    setIsLoading(true);
    
    try {
      const newGarage = {
        name: garageData.name,
        area: garageData.area || null,
        location: garageData.location,
      };
      
      const { data, error } = await supabase
        .from('garages')
        .insert(newGarage)
        .select()
        .single();
        
      if (error) throw error;
      
      console.log("Garage added successfully:", data);
      toast.success("Garage added successfully!");
      
      await fetchGarages();
      return data;
    } catch (error: any) {
      console.error("Error adding garage:", error);
      toast.error(error.message || "Failed to add garage");
      
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
        .neq('id', '00000000-0000-0000-0000-000000000000');
        
      if (error) throw error;
      
      console.log("All garages cleared successfully");
      toast.success("All garages cleared!");
      setGarages([]);
      return true;
    } catch (error: any) {
      console.error("Clear garages error:", error);
      toast.error(error.message || "Failed to clear garages");
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
