
import React, { useState, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching, searchCompleted, resetSearch } = useCarParts();
  const { toast } = useToast();

  // Add effect to update UI when search completes
  useEffect(() => {
    if (searchCompleted) {
      setShowResults(true);
      
      if (parts.length === 0) {
        toast({
          title: "No Results",
          description: "No parts found matching your criteria. Try different search parameters.",
        });
      } else {
        console.log("Parts found:", parts.length);
      }
    }
  }, [searchCompleted, parts.length, toast]);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    setShowResults(true);
  };

  // Enhanced debugging
  console.log("Current parts in CarSearch:", parts); 
  console.log("Show results:", showResults);
  console.log("Search completed:", searchCompleted);
  console.log("Is searching:", isSearching);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Find Parts for Your Vehicle</h2>
        <CarSearchForm onSearch={handleSearchComplete} />
      </div>
      
      <div className="transition-all duration-300">
        {isSearching ? (
          <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-sm">
            <div className="animate-pulse text-center">
              <p className="text-lg text-gray-500">Searching for parts...</p>
            </div>
          </div>
        ) : (
          <div className={`bg-white rounded-xl shadow-sm p-6 ${showResults ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
            <PartsResults parts={parts} visible={showResults} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CarSearch;
