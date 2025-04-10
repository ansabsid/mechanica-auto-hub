
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { generateMockParts } from "./utils";
import { useToast } from "@/hooks/use-toast";

// Increase the timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 10000; // Increase from 5000 to 10000 ms (10 seconds)
const MAX_RETRIES = 2;

export const usePartsSearch = (manufacturers: Manufacturer[], models: Model[]) => {
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  const { toast } = useToast();

  // Create a fetch with timeout function to handle network timeouts
  const fetchWithTimeout = async (promise, retryCount = 0) => {
    let timeoutId;
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("Request timed out"));
        }, FETCH_TIMEOUT);
      });

      const result = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // If we have retries left, retry the fetch with exponential backoff
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying fetch (${retryCount + 1}/${MAX_RETRIES})...`);
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return fetchWithTimeout(promise, retryCount + 1);
      }
      
      throw error;
    }
  };

  // Fetch all available parts from the database with improved error handling
  const fetchAllParts = async () => {
    console.log("Fetching all available parts");
    
    // If already loading, don't start another fetch
    if (isLoading) {
      console.log("Already loading parts, skipping duplicate fetch");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const fetchPromise = supabase
        .from('parts')
        .select('*');
      
      const { data, error } = await fetchWithTimeout(fetchPromise);
      
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
        setSearchCompleted(true);
        
        // Show success toast only if we got real data
        toast({
          title: "Parts Loaded Successfully",
          description: `Loaded ${processedParts.length} parts from database`,
          duration: 3000,
        });
      } else {
        console.log("No parts found in database, generating mock parts for initial display");
        const mockParts = generateMockParts(1, 1, 2023, manufacturers, models);
        setAllParts(mockParts);
        setParts(mockParts);
        setSearchCompleted(true);
        
        // Show toast for mock data
        toast({
          title: "Using Sample Data",
          description: "No parts found in database. Showing sample data instead.",
          variant: "default",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Error fetching all parts:", error.message);
      
      // Show error toast with retry option
      toast({
        title: "Error Loading Parts",
        description: `Could not load parts: ${error.message}. Using sample data instead.`,
        variant: "destructive",
        duration: 5000,
      });
      
      // Generate mock parts as fallback
      console.log("Generating mock parts as fallback due to fetch error");
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

  // Search for parts with improved error handling
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
      
      // Query the database for matching parts with timeout
      console.log(`Querying Supabase for parts: mfr=${mfrId}, model=${mdlId}, year=${yearNum}`);
      
      const queryPromise = supabase
        .from('parts')
        .select('*')
        .eq('manufacturer_id', mfrId)
        .eq('model_id', mdlId)
        .eq('year', yearNum);
      
      const { data, error } = await fetchWithTimeout(queryPromise);
      
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
      setQueryTime(0);
      
      // Show error toast
      toast({
        title: "Search Error",
        description: `Error searching for parts: ${error.message}. Showing sample data instead.`,
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
