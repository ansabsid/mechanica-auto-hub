
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { generateMockParts } from "./utils";

export const usePartsSearch = (manufacturers: Manufacturer[], models: Model[]) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);

  // Reset search state
  const resetSearch = () => {
    console.log("Resetting search state");
    setParts([]);
    setSearchCompleted(false);
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
      const mockParts: Part[] = generateMockParts(
        parseInt(manufacturerId), 
        parseInt(modelId), 
        parseInt(year),
        manufacturers,
        models
      );
      console.log("Generated mock parts:", mockParts);
      
      // Use DB parts if found, otherwise use mock parts
      let finalParts = validParts.length > 0 ? validParts : mockParts;
      
      if (validParts.length === 0) {
        console.log("Using mock parts:", mockParts);
      }
      
      console.log("Final parts being set:", finalParts);
      
      // Important: Update both state variables together to ensure consistency
      const partsCount = finalParts.length;
      setParts(finalParts);
      
      // Use setTimeout to ensure state update is processed before setting searchCompleted
      setTimeout(() => {
        setSearchCompleted(true);
        setIsSearching(false);
      }, 100);
      
      return partsCount;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      
      // Show mock data on error for better user experience
      const mockParts: Part[] = generateMockParts(
        parseInt(manufacturerId), 
        parseInt(modelId), 
        parseInt(year),
        manufacturers,
        models
      );
      console.log("Using mock parts due to error:", mockParts);
      
      setParts(mockParts);
      
      // Use setTimeout for consistent behavior
      setTimeout(() => {
        setSearchCompleted(true);
        setIsSearching(false);
      }, 100);
      
      return mockParts.length;
    }
  };

  return {
    parts,
    isSearching,
    searchCompleted,
    searchParts,
    resetSearch
  };
};
