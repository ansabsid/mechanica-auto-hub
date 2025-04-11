
import { useState, useCallback } from "react";
import { Part } from "./types";

/**
 * Hook that manages state for parts search functionality with optimized state updates
 * @returns State and memoized state updater functions
 */
export const usePartsSearchState = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  
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
