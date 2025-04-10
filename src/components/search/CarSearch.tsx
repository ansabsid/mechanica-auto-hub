
import React, { useState } from "react";
import CarSearchForm from "./CarSearchForm";
import PartsResults from "./PartsResults";
import { useCarParts } from "@/hooks/useCarParts";

const CarSearch = () => {
  const [showResults, setShowResults] = useState(false);
  const { parts } = useCarParts();

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
