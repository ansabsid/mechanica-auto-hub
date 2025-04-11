
import { useState, useEffect, useRef, useCallback } from "react";
import { useManufacturers } from "./useManufacturers";
import { useModels } from "./useModels";
import { generateYearRange } from "./utils";
import { supabase } from "@/integrations/supabase/client";
import { Part, Manufacturer, Model } from "./types";
import { useToast } from "@/hooks/use-toast";

export * from "./types";

// Create and export the main hook that combines all functionality
export const useCarParts = () => {
  // Add a ref to track initialization
  const initializedRef = useRef<boolean>(false);
  const { toast } = useToast();
  
  // State management
  const [parts, setParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  
  // Get manufacturers functionality
  const { 
    manufacturers, 
    isLoading: isLoadingManufacturers, 
    fetchManufacturers 
  } = useManufacturers();
  
  // Get models functionality
  const { 
    models, 
    isLoading: isLoadingModels, 
    fetchModels 
  } = useModels();
  
  // Generate years range
  const years = generateYearRange();
  
  // Combine loading states
  const isLoadingData = isLoadingManufacturers || isLoadingModels || isLoading;

  // Fetch data on mount, but only once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchManufacturers();
    }
  }, [fetchManufacturers]);
  
  /**
   * Reset search state
   */
  const resetSearch = useCallback(() => {
    console.log("Resetting search state");
    setParts([]);
    setQueryTime(0);
    setIsSearching(false);
    setSearchCompleted(false);
  }, []);

  /**
   * Search for parts based on vehicle criteria
   */
  const searchParts = useCallback(async (manufacturerId: string, modelId: string, year: string) => {
    if (!manufacturerId || !modelId || !year) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select manufacturer, model, and year to search for parts"
      });
      return 0;
    }

    try {
      // Reset previous search results
      resetSearch();
      
      // Start the search
      setIsSearching(true);
      
      // Convert id strings to numbers
      const mfrId = parseInt(manufacturerId);
      const mdlId = parseInt(modelId);
      const yearNum = parseInt(year);
      
      // Start timing the query
      const startTime = performance.now();
      
      // Query the database using Supabase
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
      
      if (error) {
        throw error;
      }
      
      // Process the results
      const foundParts = data || [];
      
      // Enhance parts with garage info
      const processedParts: Part[] = foundParts.map(part => ({
        ...part,
        garages: part.garage_id ? { 
          name: 'AutoCare Dubai',
          location: 'Dubai Marina'
        } : { 
          name: 'Mechanica Service Center',
          location: 'Dubai, UAE'
        }
      }));
      
      console.log("Found parts:", processedParts.length, processedParts);
      
      // If we found parts, show them
      if (processedParts.length > 0) {
        toast({
          title: "Parts Found",
          description: `Found ${processedParts.length} parts matching your vehicle in ${queryDuration.toFixed(0)}ms`,
          duration: 5000,
        });
      } else {
        toast({
          title: "No Parts Found",
          description: `No parts found matching your vehicle. Try different criteria.`,
          variant: "destructive",
          duration: 5000,
        });
      }
      
      // Update state
      setParts(processedParts);
      setIsSearching(false);
      setSearchCompleted(true);
      
      return processedParts.length;
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      
      setQueryTime(0);
      setIsSearching(false);
      setSearchCompleted(true);
      setParts([]);
      
      toast({
        title: "Search Error",
        description: `Error searching for parts: ${error.message}`,
        variant: "destructive",
        duration: 5000,
      });
      
      return 0;
    }
  }, [resetSearch, toast]);

  return {
    manufacturers,
    models,
    parts,
    years,
    isLoading: isLoadingData,
    isSearching,
    searchCompleted,
    queryTime,
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch
  };
};
