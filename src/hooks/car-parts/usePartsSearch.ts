
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { generateMockParts } from "./utils";
import { useToast } from "@/hooks/use-toast";

export const usePartsSearch = (manufacturers: Manufacturer[], models: Model[]) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  const { toast } = useToast();

  // Reset search state
  const resetSearch = () => {
    console.log("Resetting search state");
    setParts([]);
    setSearchCompleted(false);
    setQueryTime(0);
  };

  // Search for parts - improved to ensure proper state updates and database queries
  const searchParts = async (manufacturerId: string, modelId: string, year: string) => {
    console.log("Searching for parts:", { manufacturerId, modelId, year });
    setIsSearching(true);
    setSearchCompleted(false);
    // Clear previous results at the start of a new search
    setParts([]);
    
    try {
      // Start timing the query
      const startTime = performance.now();
      
      // Convert id strings to numbers
      const mfrId = parseInt(manufacturerId);
      const mdlId = parseInt(modelId);
      const yearNum = parseInt(year);
      
      // Query the database for matching parts
      console.log(`Querying Supabase for parts: mfr=${mfrId}, model=${mdlId}, year=${yearNum}`);
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .eq('manufacturer_id', mfrId)
        .eq('model_id', mdlId)
        .eq('year', yearNum);
      
      // End timing the query
      const endTime = performance.now();
      const queryDuration = endTime - startTime;
      setQueryTime(queryDuration);
      
      console.log(`Database query completed in ${queryDuration.toFixed(2)}ms`);
      
      if (error) {
        throw error;
      }
      
      console.log("Supabase query result:", data);
      
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
      
      let finalParts: Part[];
      
      if (validParts.length > 0) {
        finalParts = validParts;
        console.log("Using database parts:", validParts.length);
        
        // Show success toast message
        toast({
          title: "Parts Found",
          description: `Found ${validParts.length} parts matching your vehicle in ${queryDuration.toFixed(0)}ms`,
          duration: 5000,
        });
      } else {
        // Only generate mock parts if no real parts found
        console.log("No parts found in database, generating mock parts...");
        const mockStartTime = performance.now();
        const mockParts = generateMockParts(
          mfrId, 
          mdlId, 
          yearNum,
          manufacturers,
          models
        );
        const mockEndTime = performance.now();
        console.log("Using mock parts:", mockParts.length);
        console.log(`Mock data generated in ${(mockEndTime - mockStartTime).toFixed(2)}ms`);
        finalParts = mockParts;
        
        // Show toast message for mock data
        toast({
          title: "Using Sample Data",
          description: `No exact matches found in ${queryDuration.toFixed(0)}ms. Showing ${mockParts.length} sample parts.`,
          variant: "default",
          duration: 5000,
        });
      }
      
      console.log("Final parts being set:", finalParts);
      
      // Update state in the correct order
      setParts(finalParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return finalParts.length;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      
      // Store the startTime in a variable that's in scope for this catch block
      const errorEndTime = performance.now();
      // The startTime isn't defined in this scope, so we can't calculate an accurate time
      // We'll just set a default value for the query duration when an error occurs
      const queryDuration = 0; // We don't know the actual duration in the error case
      setQueryTime(queryDuration);
      
      // Show error toast
      toast({
        title: "Search Error",
        description: `Error searching for parts: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
      
      // Show mock data on error for better user experience
      const mockParts: Part[] = generateMockParts(
        parseInt(manufacturerId), 
        parseInt(modelId), 
        parseInt(year),
        manufacturers,
        models
      );
      console.log("Using mock parts due to error:", mockParts);
      
      // Update state in the correct order
      setParts(mockParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return mockParts.length;
    }
  };

  return {
    parts,
    isSearching,
    searchCompleted,
    queryTime,
    searchParts,
    resetSearch
  };
};
