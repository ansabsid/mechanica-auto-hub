
import { useCallback, useMemo } from "react";
import { Manufacturer, Model, Part } from "./types";
import { useToast } from "@/hooks/use-toast";
import { usePartsSearchState } from "./usePartsSearchState";
import { 
  fetchAllPartsFromDB, 
  fetchPartsForVehicle, 
  createMockPartsForVehicle 
} from "./services/partsService";
import { fetchWithCache } from "./utils/network";

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
   * @param showToast Whether to show a toast notification
   */
  const fetchAllParts = useCallback(async (showToast = false) => {
    console.log("Fetching all available parts, showToast:", showToast);
    
    if (isLoading) {
      console.log("Already loading parts, skipping duplicate fetch");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use cache to avoid redundant fetches
      const processedParts = await fetchWithCache(
        'all-parts',
        fetchAllPartsFromDB,
        300000 // 5 minutes cache for all parts
      );
      
      console.log("fetchAllPartsFromDB returned:", processedParts.length, "parts");
      
      if (processedParts.length > 0) {
        setAllParts(processedParts);
        // Don't set filtered parts when fetching all parts
        // We only want to set filtered parts after a search
        setSearchCompleted(false);
        
        // Only show toast notification if explicitly requested
        if (showToast) {
          toast({
            title: "Parts Loaded Successfully",
            description: `Loaded ${processedParts.length} parts from database`,
            duration: 3000,
          });
        }
      } else {
        console.log("No parts found in database, ready for search");
        setAllParts([]);
        setSearchCompleted(false);
      }
    } catch (error: any) {
      console.error("Error fetching all parts:", error.message);
      
      if (showToast) {
        toast({
          title: "Error Loading Parts",
          description: `Could not load parts: ${error.message}. Please try again.`,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      setAllParts([]);
      setParts([]);
      setSearchCompleted(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, toast, setAllParts, setParts, setSearchCompleted, setIsLoading]);

  /**
   * Reset search state
   */
  const resetSearch = useCallback(() => {
    console.log("Resetting search state");
    setSearchCompleted(false);
    setParts([]);
    setQueryTime(0);
    setIsSearching(false);
  }, [setParts, setSearchCompleted, setQueryTime, setIsSearching]);

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
    setParts([]); // Clear any existing parts before searching
    
    try {
      // Start timing the query
      const startTime = performance.now();
      
      // Convert id strings to numbers
      const mfrId = parseInt(manufacturerId);
      const mdlId = parseInt(modelId);
      const yearNum = parseInt(year);
      
      console.log(`Using numeric values for search: mfrId=${mfrId}, mdlId=${mdlId}, yearNum=${yearNum}`);
      
      // Create a unique cache key for this search
      const cacheKey = `parts-${mfrId}-${mdlId}-${yearNum}`;
      
      // Fetch parts from database using cache
      let validParts = await fetchWithCache(
        cacheKey,
        () => fetchPartsForVehicle(mfrId, mdlId, yearNum),
        120000 // 2 minutes cache for specific vehicle parts
      );
      
      // End timing the query
      const endTime = performance.now();
      const queryDuration = endTime - startTime;
      setQueryTime(queryDuration);
      
      console.log(`Database query completed in ${queryDuration.toFixed(2)}ms, found ${validParts.length} parts`);
      
      let finalParts: Part[];
      
      if (validParts.length > 0) {
        finalParts = validParts;
        console.log("Using database parts:", validParts.length);
        
        toast({
          title: "Parts Found",
          description: `Found ${validParts.length} parts matching your vehicle in ${queryDuration.toFixed(0)}ms`,
          duration: 5000,
        });
      } else {
        console.log("No parts found in database, generating mock parts for the specific vehicle...");
        
        // Generate mock parts for the vehicle
        finalParts = createMockPartsForVehicle(mfrId, mdlId, yearNum, manufacturers, models);
        
        console.log("Generated mock parts:", finalParts.length);
        
        if (finalParts.length > 0) {
          toast({
            title: "Using Sample Data",
            description: `No exact matches found in ${queryDuration.toFixed(0)}ms. Showing ${finalParts.length} sample parts.`,
            variant: "default",
            duration: 5000,
          });
        } else {
          toast({
            title: "No Parts Found",
            description: "No parts match your search criteria.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      console.log("🔢 RESULTS AFTER SEARCH: ", finalParts.length, "parts");
      
      // Double check that all parts match the search criteria - using memoization would improve this
      const strictlyFilteredParts = useMemo(() => 
        finalParts.filter(part => 
          part.manufacturer_id === mfrId && 
          part.model_id === mdlId && 
          part.year === yearNum
        ), [finalParts, mfrId, mdlId, yearNum]
      );
      
      console.log("🔎 STRICT FILTERING CHECK:");
      console.log(`- Before strict filtering: ${finalParts.length} parts`);
      console.log(`- After strict filtering: ${strictlyFilteredParts.length} parts`);
      
      if (strictlyFilteredParts.length !== finalParts.length) {
        console.warn("⚠️ WARNING: Some parts were removed during strict filtering!");
        console.log("Parts removed:", finalParts.length - strictlyFilteredParts.length);
      }
      
      // Set the parts array with strictly filtered results
      setParts(strictlyFilteredParts);
      
      // Important: Update state in the correct order - set search completed after setting parts
      setIsSearching(false);
      setSearchCompleted(true);
      
      return strictlyFilteredParts.length;
    } catch (error: any) {
      console.error("Error searching for parts:", error);
      
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
      
      // Update state in the correct order
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
