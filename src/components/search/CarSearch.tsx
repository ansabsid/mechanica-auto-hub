
import React, { useState, useEffect, useRef } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Loader2, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(true); // Set to true by default to show all parts
  const { parts, isSearching, searchCompleted, queryTime, resetSearch } = useCarParts();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  console.log("CarSearch render - parts:", parts?.length || 0);
  console.log("CarSearch render - searchCompleted:", searchCompleted);
  console.log("CarSearch render - showResults:", showResults);
  console.log("CarSearch render - queryTime:", queryTime);

  // Update UI when search completes
  useEffect(() => {
    console.log("Search completed effect triggered:", searchCompleted);
    console.log("Parts in effect:", parts?.length || 0);
    
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

  // Format the query time to display nicely
  const formattedQueryTime = queryTime > 0 ? `${queryTime.toFixed(0)}ms` : '';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      {searchCompleted && queryTime > 0 && (
        <div className="flex justify-between items-center mt-6 mb-2 px-4">
          <div className="flex items-center text-mechanica-600">
            <Clock className="mr-2 h-5 w-5" />
            <span className="text-sm font-medium">Search completed in {formattedQueryTime}</span>
          </div>
          
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
      )}
      
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
        {isSearching ? (
          <div className="flex justify-center items-center p-12 bg-white rounded-xl shadow-md">
            <div className="animate-pulse text-center">
              <Loader2 className="animate-spin h-12 w-12 text-mechanica-500 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-700">Searching for parts...</p>
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
              parts={parts} 
              visible={showResults} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CarSearch;
