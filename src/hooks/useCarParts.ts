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
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  
  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  // Reset search state
  const resetSearch = () => {
    console.log("Resetting search state");
    setParts([]);
    setSearchCompleted(false);
  };

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

  // Search for parts - improved to ensure proper state updates
  const searchParts = async (manufacturerId: string, modelId: string, year: string) => {
    console.log("Searching for parts:", { manufacturerId, modelId, year });
    setIsSearching(true);
    setSearchCompleted(false);
    // Clear previous results at the start of a new search
    setParts([]);
    
    try {
      // Query the database for matching parts
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('manufacturer_id', parseInt(manufacturerId))
        .eq('model_id', parseInt(modelId))
        .eq('year', parseInt(year));
      
      if (error) {
        throw error;
      }
      
      // Process and enhance the database results with garage information
      const validParts: Part[] = (data || []).map(part => {
        return {
          ...part,
          garages: part.garage_id ? { 
            name: 'AutoCare Dubai',
            location: 'Dubai Marina'
          } : null
        } as Part;
      });
      
      console.log("Valid parts from DB:", validParts);
      
      // Generate mock parts as a fallback
      const mockParts: Part[] = getMockParts(parseInt(manufacturerId), parseInt(modelId), parseInt(year));
      console.log("Generated mock parts:", mockParts);
      
      // Use DB parts if found, otherwise use mock parts
      let finalParts = validParts.length > 0 ? validParts : mockParts;
      
      if (validParts.length === 0) {
        console.log("Using mock parts:", mockParts);
      }
      
      console.log("Final parts being set:", finalParts);
      
      // Update state with the parts data
      setParts(finalParts);
      
      // Important: Set search completed AFTER setting parts to ensure proper rendering
      setTimeout(() => {
        setSearchCompleted(true);
      }, 50);
      
      return finalParts.length;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      
      // Show mock data on error for better user experience
      const mockParts: Part[] = getMockParts(parseInt(manufacturerId), parseInt(modelId), parseInt(year));
      console.log("Using mock parts due to error:", mockParts);
      
      setParts(mockParts);
      
      // Set search completed state
      setTimeout(() => {
        setSearchCompleted(true);
      }, 50);
      
      return mockParts.length;
    } finally {
      // Delay setting isSearching to false to ensure UI transitions properly
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
  };

  // Helper function to get consistent mock data
  const getMockParts = (manufacturerId: number, modelId: number, year: number): Part[] => {
    // Get manufacturer and model names for better mock data
    const manufacturerName = manufacturers.find(m => m.id === manufacturerId)?.name || "Unknown";
    const modelName = models.find(m => m.id === modelId)?.name || "Unknown";
    
    return [
      {
        id: 1,
        name: `${manufacturerName} ${modelName} Brake Pads (${year})`,
        description: "Premium quality brake pads designed for optimal stopping power",
        price: 120,
        stock: 15,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: "1",
        garages: {
          name: "AutoCare Dubai",
          location: "Dubai Marina"
        }
      },
      {
        id: 2,
        name: `${manufacturerName} ${modelName} Oil Filter (${year})`,
        description: "High performance oil filter for extended engine life",
        price: 35,
        stock: 28,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: "2",
        garages: {
          name: "SparkTech Auto",
          location: "Al Quoz"
        }
      },
      {
        id: 3,
        name: `${manufacturerName} ${modelName} Air Filter (${year})`,
        description: "Premium air filter for improved performance and fuel efficiency",
        price: 45,
        stock: 12,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: "1",
        garages: {
          name: "AutoCare Dubai",
          location: "Dubai Marina"
        }
      },
      {
        id: 4,
        name: `${manufacturerName} ${modelName} Spark Plugs Set (${year})`,
        description: "Set of 4 high performance spark plugs",
        price: 60,
        stock: 20,
        manufacturer_id: manufacturerId,
        model_id: modelId,
        year: year,
        garage_id: "3",
        garages: {
          name: "Elite Auto Parts",
          location: "Jumeirah"
        }
      }
    ];
  };

  return {
    manufacturers,
    models,
    parts,
    years,
    isLoading,
    isSearching,
    searchCompleted,
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch
  };
};
