
import { useState } from "react";
import { Part } from "./types";

/**
 * Hook that manages state for parts search functionality
 * @returns State and state updater functions
 */
export const usePartsSearchState = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchCompleted, setSearchCompleted] = useState<boolean>(false);
  const [queryTime, setQueryTime] = useState<number>(0);
  
  return {
    // State
    parts,
    allParts,
    isLoading,
    isSearching,
    searchCompleted,
    queryTime,
    
    // State updaters
    setParts,
    setAllParts,
    setIsLoading,
    setIsSearching,
    setSearchCompleted,
    setQueryTime
  };
};
