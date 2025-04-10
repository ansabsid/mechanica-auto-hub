
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Manufacturer } from "./types";

export const useManufacturers = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch manufacturers
  const fetchManufacturers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('manufacturers')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setManufacturers(data);
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
  };

  return {
    manufacturers,
    isLoading,
    fetchManufacturers
  };
};
