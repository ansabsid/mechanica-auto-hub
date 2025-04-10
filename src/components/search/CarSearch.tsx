
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
      {showResults && <PartsResults parts={parts} visible={true} />}
    </div>
  );
};

export default CarSearch;
