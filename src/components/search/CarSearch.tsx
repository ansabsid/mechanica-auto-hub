
import React, { useState, useEffect, useRef } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Loader2 } from "lucide-react";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching, searchCompleted, resetSearch } = useCarParts();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  console.log("CarSearch render - parts:", parts);
  console.log("CarSearch render - searchCompleted:", searchCompleted);
  console.log("CarSearch render - showResults:", showResults);

  // Update UI when search completes
  useEffect(() => {
    console.log("Search completed effect triggered:", searchCompleted);
    console.log("Parts in effect:", parts);
    
    if (searchCompleted) {
      setShowResults(true);
      
      if (parts.length === 0) {
        toast({
          title: "No Results",
          description: "No parts found matching your criteria. Try different search parameters.",
          variant: "destructive",
          duration: 5000,
        });
      } else {
        console.log("Parts found effect:", parts.length);
        toast({
          title: "Parts Found",
          description: `Found ${parts.length} parts matching your vehicle.`,
          duration: 5000,
        });
        
        // Scroll to results section with a slight delay
        setTimeout(() => {
          if (resultsRef.current) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }
  }, [searchCompleted, parts, toast]);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    // We'll now rely on the searchCompleted effect to handle showing results
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      {(isSearching || (searchCompleted && showResults)) && (
        <div className="flex flex-col items-center justify-center mt-8 mb-4">
          {isSearching ? (
            <div className="flex items-center text-mechanica-600 animate-pulse">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <span className="text-lg font-medium">Searching for parts...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-bounce">
              <p className="text-mechanica-600 font-semibold mb-2 text-lg">Scroll down to see results</p>
              <ArrowDown className="text-mechanica-500" size={32} />
            </div>
          )}
        </div>
      )}
      
      <div 
        id="search-results-section" 
        ref={resultsRef}
        className="mt-8 transition-all duration-300 border-t-4 border-mechanica-300 pt-8"
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
          searchCompleted && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-mechanica-200">
              <PartsResults 
                parts={parts} 
                visible={showResults} 
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CarSearch;
