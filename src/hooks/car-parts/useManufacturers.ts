
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manufacturer } from "./types";

export const useManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch manufacturers
  const fetchManufacturers = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Fetching manufacturers from Supabase...");
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        console.log("Successfully fetched manufacturers:", data.length);
        setManufacturers(data);
      } else {
        console.log("No manufacturers found, using fallback data");
        // Show fallback data if no results
        setManufacturers([
          { id: 1, name: "Toyota" },
          { id: 2, name: "Honda" },
          { id: 3, name: "BMW" },
          { id: 4, name: "Mercedes" },
          { id: 5, name: "Ford" },
          { id: 6, name: "Audi" },
          { id: 7, name: "Nissan" },
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching manufacturers:', error.message);
      // Show fallback data if error
      setManufacturers([
        { id: 1, name: "Toyota" },
        { id: 2, name: "Honda" },
        { id: 3, name: "BMW" },
        { id: 4, name: "Mercedes" },
        { id: 5, name: "Ford" },
        { id: 6, name: "Audi" },
        { id: 7, name: "Nissan" },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    manufacturers,
    isLoading,
    fetchManufacturers
  };
};
