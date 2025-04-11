
import React, { useRef, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clock, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const CarSearch = () => {
  const { 
    parts, 
    isLoading,
    isSearching, 
    searchCompleted, 
    queryTime, 
    resetSearch
  } = useCarParts();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Log the state changes for debugging
  useEffect(() => {
    console.log("CarSearch state updated:", { 
      partsCount: parts?.length || 0, 
      isLoading, 
      isSearching, 
      searchCompleted,
      parts // Log the actual parts array
    });
  }, [parts, isLoading, isSearching, searchCompleted]);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    
    // Scroll to results section with a slight delay when results are found
    if (searchCompleted) {
      setTimeout(() => {
        if (resultsRef.current) {
          console.log("Scrolling to results");
          resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  };
  
  const handleClearSearch = () => {
    resetSearch();
    toast({
      title: "Search Cleared",
      description: "Ready for a new search",
      duration: 3000,
    });
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Search",
      description: "Ready for a new search",
      duration: 3000,
    });
    
    resetSearch();
  };

  // Format the query time to display nicely
  const formattedQueryTime = queryTime > 0 ? `${queryTime.toFixed(0)}ms` : '';

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
            Clear Search
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
      ) : (
        <div 
          id="search-results-section" 
          ref={resultsRef}
          className="mt-8"
        >
          <PartsResults 
            parts={parts || []} 
            isLoading={isLoading}
            searchCompleted={searchCompleted} 
          />
        </div>
      )}
    </div>
  );
};

export default CarSearch;
