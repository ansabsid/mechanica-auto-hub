
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Manufacturer {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
}

export interface Part {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  manufacturer_id: number;
  model_id: number;
  year: number;
  garage_id: string | null;
  garages: {
    name: string;
    location: string;
  } | null;
}

export const useCarParts = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

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

  // Search for parts
  const searchParts = async (manufacturerId: string, modelId: string, year: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(`
          *,
          garages:garage_id (name, location)
        `)
        .eq('manufacturer_id', parseInt(manufacturerId))
        .eq('model_id', parseInt(modelId))
        .eq('year', parseInt(year));
      
      if (error) {
        throw error;
      }
      
      setParts(data || []);
      return data?.length || 0;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      setParts([]);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  return {
    manufacturers,
    models,
    parts,
    years,
    isLoading,
    isSearching,
    fetchManufacturers,
    fetchModels,
    searchParts
  };
};
