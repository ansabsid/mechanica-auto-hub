
import React, { useState, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching, searchCompleted, resetSearch } = useCarParts();
  const { toast } = useToast();

  // Add detailed logging for debugging
  console.log("CarSearch render - parts:", parts);
  console.log("CarSearch render - searchCompleted:", searchCompleted);
  console.log("CarSearch render - showResults:", showResults);

  // Add effect to update UI when search completes
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
      }
    }
  }, [searchCompleted, parts, toast]);

  const handleSearchComplete = (resultsCount: number) => {
    console.log("Search completed with", resultsCount, "results");
    // This function will be called after search is completed and should reflect the found parts
    setShowResults(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      <div className="mt-8 transition-all duration-300">
        {isSearching ? (
          <div className="flex justify-center items-center p-8 bg-white rounded-xl shadow-sm">
            <div className="animate-pulse text-center">
              <p className="text-lg text-gray-500">Searching for parts...</p>
            </div>
          </div>
        ) : (
          showResults && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Pass parts data explicitly to ensure it's not lost */}
              <PartsResults parts={parts} visible={showResults} />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CarSearch;
