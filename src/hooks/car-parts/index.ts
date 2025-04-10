
import { useState } from "react";
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
    isSearching,
    searchCompleted,
    searchParts,
    resetSearch
  } = usePartsSearch(manufacturers, models);
  
  // Generate years range
  const years = generateYearRange();
  
  // Combine loading states
  const isLoading = isLoadingManufacturers || isLoadingModels;

  return {
    manufacturers,
    models,
    parts,
    years,
    isLoading,
    isSearching,
    searchCompleted,
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch
  };
};
