
import { useState, useEffect, useRef, useCallback } from "react";
import { useManufacturers } from "./useManufacturers";
import { useModels } from "./useModels";
import { usePartsSearch } from "./usePartsSearch";
import { generateYearRange } from "./utils";
import { Part, Manufacturer, Model } from "./types";

export * from "./types";

// Create and export the main hook that combines all functionality
export const useCarParts = () => {
  // Add a ref to track initialization
  const initializedRef = useRef<boolean>(false);
  
  // Get manufacturers functionality
  const { 
    manufacturers, 
    isLoading: isLoadingManufacturers, 
    fetchManufacturers 
  } = useManufacturers();
  
  // Get models functionality - direct connection
  const { 
    models, 
    isLoading: isLoadingModels, 
    fetchModels: originalFetchModels 
  } = useModels();
  
  // Wrap fetchModels to handle string to number conversion
  const fetchModels = useCallback((manufacturerId: string) => {
    console.log("Converting manufacturer ID from string to number:", manufacturerId);
    return originalFetchModels(manufacturerId);
  }, [originalFetchModels]);
  
  // Generate years range
  const years = generateYearRange();
  
  // Get parts search functionality
  const {
    parts,
    allParts,
    isLoading: isLoadingParts,
    isSearching,
    searchCompleted,
    queryTime,
    searchParts,
    resetSearch,
    fetchAllParts
  } = usePartsSearch(manufacturers, models);
  
  // Combine loading states
  const isLoading = isLoadingManufacturers || isLoadingModels || isLoadingParts;

  // Fetch data on mount, but only once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      fetchManufacturers();
    }
  }, [fetchManufacturers]);

  return {
    // Data
    manufacturers,
    models,
    parts,
    allParts,
    years,
    
    // State
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    
    // Functions
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch,
    fetchAllParts
  };
};
