
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { generateMockParts } from "./utils";
import { useToast } from "@/hooks/use-toast";

export const usePartsSearch = (manufacturers: Manufacturer[], models: Model[]) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  const { toast } = useToast();

  // Fetch all parts on mount
  useEffect(() => {
    fetchAllParts();
  }, []);

  // Fetch all available parts from the database
  const fetchAllParts = async () => {
    console.log("Fetching all available parts");
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      console.log("All parts fetched from database:", data?.length || 0);
      
      // Process the parts data with garage information
      const processedParts: Part[] = (data || []).map(part => {
        return {
          ...part,
          garages: part.garage_id ? { 
            name: 'AutoCare Dubai',
            location: 'Dubai Marina'
          } : { 
            name: 'Mechanica Service Center',
            location: 'Dubai, UAE'
          }
        } as Part;
      });
      
      if (processedParts.length > 0) {
        setAllParts(processedParts);
        setParts(processedParts);
      } else {
        console.log("No parts found in database, generating mock parts for initial display");
        const mockParts = generateMockParts(1, 1, 2023, manufacturers, models);
        setAllParts(mockParts);
        setParts(mockParts);
      }
      
      setSearchCompleted(true);
    } catch (error: any) {
      console.error("Error fetching all parts:", error.message);
      
      // Show error toast
      toast({
        title: "Error",
        description: `Error fetching parts: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
      
      // Generate mock parts as fallback
      const mockParts = generateMockParts(1, 1, 2023, manufacturers, models);
      setAllParts(mockParts);
      setParts(mockParts);
      setSearchCompleted(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset search state
  const resetSearch = () => {
    console.log("Resetting search state");
    setParts(allParts);
    setSearchCompleted(true);
    setQueryTime(0);
  };

  // Search for parts - improved to ensure proper state updates and database queries
  const searchParts = async (manufacturerId: string, modelId: string, year: string) => {
    console.log("Searching for parts:", { manufacturerId, modelId, year });
    setIsSearching(true);
    setSearchCompleted(false);
    
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
      
      // Process and enhance the database results with default garage information
      const validParts: Part[] = (data || []).map(part => {
        return {
          ...part,
          garages: part.garage_id ? { 
            name: 'AutoCare Dubai',
            location: 'Dubai Marina'
          } : { 
            // Provide default garage info even when garage_id is null
            name: 'Mechanica Service Center',
            location: 'Dubai, UAE'
          }
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
      
      const errorEndTime = performance.now();
      // We'll just set a default value for the query duration when an error occurs
      const queryDuration = 0; 
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
    allParts,
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    searchParts,
    resetSearch,
    fetchAllParts
  };
};
