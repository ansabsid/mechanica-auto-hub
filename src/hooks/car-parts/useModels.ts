
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Model } from "./types";

export const useModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch models for a manufacturer
  const fetchModels = async (manufacturerId: string) => {
    if (!manufacturerId) {
      setModels([]);
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('models')
        .select('*')
        .eq('manufacturer_id', parseInt(manufacturerId))
        .order('name');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        setModels(data);
      } else {
        // If no models found, provide fallback data
        const mockModels: { [key: string]: Model[] } = {
          "1": [
            { id: 1, name: "Corolla", manufacturer_id: 1 },
            { id: 2, name: "Camry", manufacturer_id: 1 },
            { id: 3, name: "RAV4", manufacturer_id: 1 },
            { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
          ],
          "2": [
            { id: 5, name: "Civic", manufacturer_id: 2 },
            { id: 6, name: "Accord", manufacturer_id: 2 },
            { id: 7, name: "CR-V", manufacturer_id: 2 },
          ],
          "3": [
            { id: 8, name: "3 Series", manufacturer_id: 3 },
            { id: 9, name: "5 Series", manufacturer_id: 3 },
            { id: 10, name: "X5", manufacturer_id: 3 },
          ],
        };
        
        setModels(mockModels[manufacturerId] || []);
      }
    } catch (error: any) {
      console.error('Error fetching models:', error.message);
      // Fallback data on error
      const mockModels: { [key: string]: Model[] } = {
        "1": [
          { id: 1, name: "Corolla", manufacturer_id: 1 },
          { id: 2, name: "Camry", manufacturer_id: 1 },
          { id: 3, name: "RAV4", manufacturer_id: 1 },
          { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
        ],
        "2": [
          { id: 5, name: "Civic", manufacturer_id: 2 },
          { id: 6, name: "Accord", manufacturer_id: 2 },
          { id: 7, name: "CR-V", manufacturer_id: 2 },
        ],
        "3": [
          { id: 8, name: "3 Series", manufacturer_id: 3 },
          { id: 9, name: "5 Series", manufacturer_id: 3 },
          { id: 10, name: "X5", manufacturer_id: 3 },
        ],
      };
      
      setModels(mockModels[manufacturerId] || []);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    models,
    isLoading,
    fetchModels
  };
};
