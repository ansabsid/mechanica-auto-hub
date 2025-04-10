
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
          description: "No parts found matching your criteria. Showing example parts instead.",
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
    <div className="w-full">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      <div className="mt-8 border-t pt-6 transition-all">
        {isSearching ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse text-center">
              <p className="text-lg text-gray-500">Searching for parts...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Always pass the parts array to PartsResults, but control visibility */}
            <PartsResults parts={parts} visible={showResults} />
          </>
        )}
      </div>
    </div>
  );
};

export default CarSearch;
