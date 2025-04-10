
import React, { useState, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching, searchCompleted } = useCarParts();
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
      }
    }
  }, [searchCompleted, parts.length, toast]);

  const handleSearchComplete = (resultsCount: number) => {
    setShowResults(true);
  };

  return (
    <div className="w-full">
      <CarSearchForm onSearch={handleSearchComplete} />
      
      {/* Always render the results container, but conditionally show results */}
      <div className="mt-8 border-t pt-6 transition-all">
        {isSearching ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-pulse text-center">
              <p className="text-lg text-gray-500">Searching for parts...</p>
            </div>
          </div>
        ) : (
          showResults && <PartsResults parts={parts} visible={true} />
        )}
      </div>
    </div>
  );
};

export default CarSearch;
