
import React, { useState, useEffect } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts, isSearching } = useCarParts();

  // Add effect to update UI when search completes
  useEffect(() => {
    if (!isSearching && parts.length > 0) {
      setShowResults(true);
    }
  }, [isSearching, parts]);

  const handleSearchComplete = (resultsCount: number) => {
    setShowResults(resultsCount > 0);
  };

  return (
    <div className="w-full">
      <CarSearchForm onSearch={handleSearchComplete} />
      <PartsResults parts={parts} visible={showResults} />
    </div>
  );
};

export default CarSearch;
