import React, { useState, useEffect, useRef } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Loader2, Clock, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(true); // Set to true to show all parts by default
  const { 
    parts, 
    allParts, 
    isLoading,
    isSearching, 
    searchCompleted, 
    queryTime, 
    resetSearch, 
    fetchAllParts 
  } = useCarParts();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef<boolean>(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Add explicit logging for debugging
  console.log("🔍 CarSearch render - parts length:", parts?.length || 0);
  console.log("🔍 CarSearch render - allParts length:", allParts?.length || 0);
  console.log("🔍 CarSearch render - searchCompleted:", searchCompleted);
  
  // Update UI when search completes
  useEffect(() => {
    console.log("🔄 Search completed effect triggered:", searchCompleted);
    console.log("🔢 Parts in effect:", parts?.length || 0);
    
    if (searchCompleted) {
      setShowResults(true);
      
      // Scroll to results section with a slight delay
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [searchCompleted, parts]);

  // Make sure we have data to display, but only on initial load
  useEffect(() => {
    if (!initialLoadRef.current && !isLoading && (!allParts || allParts.length === 0)) {
      console.log("Initial load: No parts found, fetching all parts...");
      initialLoadRef.current = true; // Set the flag to prevent repeated fetches
      fetchAllParts();
    }
  }, [isLoading, allParts, fetchAllParts]);

  // Clean up any retry timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    if (resultsCount === 0) {
      toast({
        title: "No Results",
        description: "No parts found matching your criteria. Try different search parameters.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleClearSearch = () => {
    resetSearch();
    toast({
      title: "Search Cleared",
      description: "Showing all available parts",
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    // Clean up any existing retry timeouts
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    toast({
      title: "Refreshing Parts",
      description: "Getting the latest parts data...",
      duration: 3000,
    });
    
    fetchAllParts();
  };

  // Format the query time to display nicely
  const formattedQueryTime = queryTime > 0 ? `${queryTime.toFixed(0)}ms` : '';

  // CRITICAL FIX: Ensure we're showing the correct parts based on search state
  // When search is completed, show ONLY the filtered parts
  // Otherwise show all parts
  const displayParts = searchCompleted ? parts : allParts;
  
  // Critical debug logging
  console.log("⚠️ FINAL DISPLAY STATE:");
  console.log("- Search completed:", searchCompleted);
  console.log("- Filtered parts count:", parts?.length || 0);
  console.log("- All parts count:", allParts?.length || 0);
  console.log("- Actually displaying:", displayParts?.length || 0, "parts");

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      <div className="flex justify-between items-center mt-6 mb-2 px-4">
        {searchCompleted && queryTime > 0 && (
          <div className="flex items-center text-mechanica-600">
            <Clock className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Search completed in {formattedQueryTime}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearSearch}
            className="text-sm"
          >
            <Search className="mr-2 h-4 w-4" />
            Show All Parts
          </Button>
        </div>
      </div>
      
      {isSearching ? (
        <div className="flex items-center justify-center mt-8 mb-4">
          <div className="flex items-center text-mechanica-600 animate-pulse">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span className="text-lg font-medium">Searching for parts...</span>
          </div>
        </div>
      ) : null}
      
      <div 
        id="search-results-section" 
        ref={resultsRef}
        className={`mt-8 transition-all duration-300 ${searchCompleted ? 'border-t-4 border-mechanica-300 pt-8' : ''}`}
      >
        {isLoading ? (
          <div className="flex flex-col justify-center items-center p-12 bg-white rounded-xl shadow-md">
            <div className="animate-pulse text-center">
              <Loader2 className="animate-spin h-12 w-12 text-mechanica-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700">Loading parts...</p>
              <p className="text-gray-500 mt-2">This may take a moment</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-mechanica-200">
            {queryTime > 0 && (
              <div className="mb-4 flex items-center justify-end text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Query time: {formattedQueryTime}</span>
              </div>
            )}
            <PartsResults 
              parts={displayParts || []} 
              visible={showResults} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CarSearch;
