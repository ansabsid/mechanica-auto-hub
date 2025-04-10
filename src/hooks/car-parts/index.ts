
import { useState, useEffect } from "react";
import { useManufacturers } from "./useManufacturers";
import { useModels } from "./useModels";
import { usePartsSearch } from "./usePartsSearch";
import { generateYearRange } from "./utils";
import { CarPartsSearchState } from "./types";

export * from "./types";

// Create and export the main hook that combines all functionality
export const useCarParts = () => {
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
  
  // Generate years range
  const years = generateYearRange();
  
  // Combine loading states
  const isLoading = isLoadingManufacturers || isLoadingModels || isLoadingParts;

  // Fetch all parts on component mount
  useEffect(() => {
    // Load all manufacturers first
    fetchManufacturers();
    
    // Then fetch all parts
    fetchAllParts();
  }, [fetchManufacturers, fetchAllParts]);

  console.log("useCarParts hook - current parts state:", parts?.length || 0);
  console.log("useCarParts hook - all parts count:", allParts?.length || 0);
  console.log("useCarParts hook - searchCompleted:", searchCompleted);
  console.log("useCarParts hook - queryTime:", queryTime);
  console.log("useCarParts hook - isLoading:", isLoading);

  return {
    manufacturers,
    models,
    parts,
    allParts,
    years,
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch,
    fetchAllParts
  };
};
