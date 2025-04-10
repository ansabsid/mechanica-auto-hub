
import React, { useState, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown } from "lucide-react";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching, searchCompleted, resetSearch } = useCarParts();
  const { toast } = useToast();

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
        });
      } else {
        console.log("Parts found effect:", parts.length);
        toast({
          title: "Parts Found",
          description: `Found ${parts.length} parts matching your vehicle.`,
          duration: 3000,
        });
        
        // Scroll to results section
        setTimeout(() => {
          const resultsSection = document.getElementById('search-results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  }, [searchCompleted, parts, toast]);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      {(isSearching || (searchCompleted && showResults)) && (
        <div className="flex justify-center mt-6 animate-bounce">
          <ArrowDown className="text-mechanica-500" size={32} />
          <span className="sr-only">Scroll down to see results</span>
        </div>
      )}
      
      <div id="search-results-section" className="mt-8 transition-all duration-300">
        {isSearching ? (
          <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-sm">
            <div className="animate-pulse text-center">
              <p className="text-lg text-gray-500">Searching for parts...</p>
            </div>
          </div>
        ) : (
          searchCompleted && (
            <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-mechanica-100">
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
