
import { useState, useCallback } from "react";
import { Part } from "./types";

/**
 * Hook that manages state for parts search functionality with optimized state updates
 * Centralizes state management for parts search to avoid prop drilling and redundant re-renders
 * @returns State and memoized state updater functions
 */
export const usePartsSearchState = () => {
  // State declarations for parts search
  const [parts, setParts] = useState<Part[]>([]);            // Parts that match current search criteria
  const [allParts, setAllParts] = useState<Part[]>([]);      // All available parts in system
  const [isLoading, setIsLoading] = useState<boolean>(false);// Loading state during API calls
  const [isSearching, setIsSearching] = useState<boolean>(false);// Active search in progress
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);// Flag for search completion
  const [queryTime, setQueryTime] = useState<number>(0);     // Performance metric for query time
  
  // Memoize state updaters to prevent unnecessary re-renders
  const updateParts = useCallback((newParts: Part[]) => {
    setParts(newParts);
  }, []);
  
  const updateAllParts = useCallback((newAllParts: Part[]) => {
    setAllParts(newAllParts);
  }, []);
  
  const updateIsLoading = useCallback((newIsLoading: boolean) => {
    setIsLoading(newIsLoading);
  }, []);
  
  const updateIsSearching = useCallback((newIsSearching: boolean) => {
    setIsSearching(newIsSearching);
  }, []);
  
  const updateSearchCompleted = useCallback((newSearchCompleted: boolean) => {
    setSearchCompleted(newSearchCompleted);
  }, []);
  
  const updateQueryTime = useCallback((newQueryTime: number) => {
    setQueryTime(newQueryTime);
  }, []);
  
  return {
    // State
    parts,
    allParts,
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    
    // State updaters
    setParts: updateParts,
    setAllParts: updateAllParts,
    setIsLoading: updateIsLoading,
    setIsSearching: updateIsSearching,
    setSearchCompleted: updateSearchCompleted,
    setQueryTime: updateQueryTime
  };
};
