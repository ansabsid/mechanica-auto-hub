
import { useState, useEffect, useRef } from "react";
import { useManufacturers } from "./useManufacturers";
import { useModels } from "./useModels";
import { usePartsSearch } from "./usePartsSearch";
import { generateYearRange } from "./utils";
import { CarPartsSearchState } from "./types";

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

  // Fetch data on mount, but only once
  useEffect(() => {
    if (!initializedRef.current) {
      console.log("Initializing useCarParts hook - fetching data");
      
      // Set the initialized flag to true to prevent future fetches
      initializedRef.current = true;
      
      // Load manufacturers first
      fetchManufacturers();
    }
  }, [fetchManufacturers]);
  
  // Fetch all parts when manufacturers are loaded
  useEffect(() => {
    if (initializedRef.current && manufacturers.length > 0 && !allParts.length && !isLoadingParts) {
      console.log("Manufacturers loaded, now fetching all parts");
      fetchAllParts();
    }
  }, [manufacturers.length, allParts.length, isLoadingParts, fetchAllParts]);

  console.log("useCarParts hook - current manufacturers:", manufacturers?.length || 0);
  console.log("useCarParts hook - current models:", models?.length || 0);
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
