
import { useCallback } from "react";
import { Manufacturer, Model, Part } from "./types";
import { useToast } from "@/hooks/use-toast";
import { usePartsSearchState } from "./usePartsSearchState";
import { 
  fetchAllPartsFromDB, 
  fetchPartsForVehicle, 
  createMockPartsForVehicle 
} from "./services/partsService";

export const usePartsSearch = (manufacturers: Manufacturer[], models: Model[]) => {
  const { 
    parts, setParts,
    allParts, setAllParts,
    isLoading, setIsLoading,
    isSearching, setIsSearching,
    searchCompleted, setSearchCompleted,
    queryTime, setQueryTime
  } = usePartsSearchState();
  
  const { toast } = useToast();

  /**
   * Fetches all available parts from the database
   */
  const fetchAllParts = useCallback(async () => {
    console.log("Fetching all available parts");
    
    if (isLoading) {
      console.log("Already loading parts, skipping duplicate fetch");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const processedParts = await fetchAllPartsFromDB();
      
      if (processedParts.length > 0) {
        setAllParts(processedParts);
        // Clear filtered parts when fetching all parts
        setParts([]);
        setSearchCompleted(false);
        
        toast({
          title: "Parts Loaded Successfully",
          description: `Loaded ${processedParts.length} parts from database`,
          duration: 3000,
        });
      } else {
        console.log("No parts found in database, generating mock parts for initial display");
        const mockParts = createMockPartsForVehicle(1, 1, 2023, manufacturers, models);
        setAllParts(mockParts);
        // Clear filtered parts when generating mock parts
        setParts([]);
        setSearchCompleted(false);
        
        toast({
          title: "Using Sample Data",
          description: "No parts found in database. Showing sample data instead.",
          variant: "default",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error fetching all parts:", error.message);
      
      toast({
        title: "Error Loading Parts",
        description: `Could not load parts: ${error.message}. Using sample data instead.`,
        variant: "destructive",
        duration: 5000,
      });
      
      const mockParts = createMockPartsForVehicle(1, 1, 2023, manufacturers, models);
      setAllParts(mockParts);
      setParts([]);
      setSearchCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, manufacturers, models, toast, setAllParts, setParts, setSearchCompleted, setIsLoading]);

  /**
   * Reset search state
   */
  const resetSearch = useCallback(() => {
    console.log("Resetting search state");
    setSearchCompleted(false);
    setParts([]);
    setQueryTime(0);
  }, [setParts, setSearchCompleted, setQueryTime]);

  /**
   * Search for parts based on vehicle criteria
   * @param manufacturerId The manufacturer ID 
   * @param modelId The model ID
   * @param year The year
   * @returns Number of parts found
   */
  const searchParts = useCallback(async (manufacturerId: string, modelId: string, year: string) => {
    console.log("🔍 SEARCHING FOR PARTS:", { manufacturerId, modelId, year });
    setIsSearching(true);
    setSearchCompleted(false);
    
    try {
      // Start timing the query
      const startTime = performance.now();
      
      // Convert id strings to numbers
      const mfrId = parseInt(manufacturerId);
      const mdlId = parseInt(modelId);
      const yearNum = parseInt(year);
      
      // Fetch parts from database
      const validParts = await fetchPartsForVehicle(mfrId, mdlId, yearNum);
      
      // End timing the query
      const endTime = performance.now();
      const queryDuration = endTime - startTime;
      setQueryTime(queryDuration);
      
      console.log(`Database query completed in ${queryDuration.toFixed(2)}ms`);
      
      let finalParts: Part[];
      
      if (validParts.length > 0) {
        finalParts = validParts;
        console.log("Using database parts:", validParts.length);
        
        // Verify that all parts match the criteria
        const allMatch = finalParts.every(part => 
          part.manufacturer_id === mfrId && 
          part.model_id === mdlId && 
          part.year === yearNum
        );
        
        console.log("⚠️ All database parts match search criteria:", allMatch);
        
        toast({
          title: "Parts Found",
          description: `Found ${validParts.length} parts matching your vehicle in ${queryDuration.toFixed(0)}ms`,
          duration: 5000,
        });
      } else {
        console.log("No parts found in database, generating mock parts for the specific vehicle...");
        const mockStartTime = performance.now();
        
        // Create mock parts for the vehicle
        const mockParts = createMockPartsForVehicle(mfrId, mdlId, yearNum, manufacturers, models);
        
        const mockEndTime = performance.now();
        console.log("Using filtered mock parts:", mockParts.length);
        console.log(`Mock data generated in ${(mockEndTime - mockStartTime).toFixed(2)}ms`);
        
        finalParts = mockParts;
        
        toast({
          title: "Using Sample Data",
          description: `No exact matches found in ${queryDuration.toFixed(0)}ms. Showing ${mockParts.length} sample parts.`,
          variant: "default",
          duration: 5000,
        });
      }
      
      console.log("🔄 SETTING FINAL PARTS:", finalParts.length);
      console.log("Sample final parts:", finalParts.slice(0, 2));
      
      // CRITICAL: Important order - first set the parts array, then update other states
      // Make sure finalParts only contains parts that match our search criteria
      const filteredParts = finalParts.filter(part => 
        part.manufacturer_id === mfrId && 
        part.model_id === mdlId && 
        part.year === yearNum
      );
      
      console.log("Filtered parts after additional verification:", filteredParts.length);
      
      setParts(filteredParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return filteredParts.length;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      
      setQueryTime(0);
      
      toast({
        title: "Search Error",
        description: `Error searching for parts: ${error.message}. Showing sample data instead.`,
        variant: "destructive",
        duration: 5000,
      });
      
      // Create properly filtered mock data on error
      const mfrId = parseInt(manufacturerId);
      const mdlId = parseInt(modelId);
      const yearNum = parseInt(year);
      
      const mockParts = createMockPartsForVehicle(mfrId, mdlId, yearNum, manufacturers, models);
      
      console.log("Using filtered mock parts due to error:", mockParts.length);
      
      // CRITICAL: Update state in the correct order
      setParts(mockParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return mockParts.length;
    }
  }, [manufacturers, models, toast, setParts, setIsSearching, setSearchCompleted, setQueryTime]);

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
