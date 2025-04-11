
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { generateMockParts } from "./utils";
import { useToast } from "@/hooks/use-toast";

// Increase the timeout for fetch operations (in milliseconds)
const FETCH_TIMEOUT = 10000; // 10 seconds
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
        setParts([]);
        setSearchCompleted(false);
        
        toast({
          title: "Parts Loaded Successfully",
          description: `Loaded ${processedParts.length} parts from database`,
          duration: 3000,
        });
      } else {
        console.log("No parts found in database, generating mock parts for initial display");
        const mockParts = generateMockParts(1, 1, 2023, manufacturers, models);
        setAllParts(mockParts);
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
      
      const mockParts = generateMockParts(1, 1, 2023, manufacturers, models);
      setAllParts(mockParts);
      setParts([]);
      setSearchCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset search state
  const resetSearch = () => {
    console.log("Resetting search state");
    // IMPORTANT FIX: Don't set parts to allParts when resetting search
    setSearchCompleted(false); // Mark as not completed so we show all parts
    setParts([]); // Clear the filtered parts
    setQueryTime(0);
  };

  // Search for parts with improved error handling
  const searchParts = async (manufacturerId: string, modelId: string, year: string) => {
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
            name: 'Mechanica Service Center',
            location: 'Dubai, UAE'
          }
        } as Part;
      });
      
      console.log("🔢 Valid parts from DB:", validParts.length);
      
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
        
        // Generate AND filter mock parts in one step - create only parts that match
        const mockParts = generateMockParts(
          mfrId, 
          mdlId, 
          yearNum,
          manufacturers,
          models
        ).filter(part => 
          part.manufacturer_id === mfrId && 
          part.model_id === mdlId && 
          part.year === yearNum
        );
        
        const mockEndTime = performance.now();
        console.log("Using filtered mock parts:", mockParts.length);
        console.log(`Mock data generated in ${(mockEndTime - mockStartTime).toFixed(2)}ms`);
        
        // Verify that all parts match the criteria
        const allMatch = mockParts.every(part => 
          part.manufacturer_id === mfrId && 
          part.model_id === mdlId && 
          part.year === yearNum
        );
        
        console.log("⚠️ All mock parts match search criteria:", allMatch);
        
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
      setParts(finalParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return finalParts.length;
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
      
      const mockParts = generateMockParts(
        mfrId, 
        mdlId, 
        yearNum,
        manufacturers,
        models
      ).filter(part => 
        part.manufacturer_id === mfrId && 
        part.model_id === mdlId && 
        part.year === yearNum
      );
      
      console.log("Using filtered mock parts due to error:", mockParts.length);
      
      // CRITICAL: Update state in the correct order
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
