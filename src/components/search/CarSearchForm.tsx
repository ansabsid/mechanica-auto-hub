
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCarParts } from "@/hooks/useCarParts";
import FormHeader from "./form/FormHeader";
import ManufacturerSelect from "./form/ManufacturerSelect";
import ModelSelect from "./form/ModelSelect";
import YearSelect from "./form/YearSelect";
import SearchButton from "./form/SearchButton";

interface CarSearchFormProps {
  onSearch: (resultsCount: number) => void;
}

const CarSearchForm: React.FC<CarSearchFormProps> = ({ onSearch }) => {
  const [manufacturer, setManufacturer] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const { toast } = useToast();

  const {
    manufacturers,
    models,
    years,
    isLoading,
    isSearching,
    fetchManufacturers,
    fetchModels,
    searchParts,
    resetSearch
  } = useCarParts();

  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  useEffect(() => {
    if (manufacturer) {
      fetchModels(manufacturer);
      // Reset model when manufacturer changes
      setModel("");
    }
  }, [manufacturer, fetchModels]);

  const handleSearch = async () => {
    if (!manufacturer || !model || !year) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select manufacturer, model, and year to search for parts"
      });
      return;
    }

    try {
      // Reset previous search results
      resetSearch();
      
      const count = await searchParts(manufacturer, model, year);
      
      // Notify parent component about search completion
      onSearch(count);
    } catch (error: any) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "An error occurred while searching"
      });
      
      // Even on error, notify parent that search is complete (with 0 results)
      onSearch(0);
    }
  };

  // Find the selected model object
  const selectedModel = models.find(m => m.id.toString() === model);

  return (
    <div className="bg-white p-6 rounded-xl shadow-card max-w-4xl w-full mx-auto">
      <FormHeader />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ManufacturerSelect 
          manufacturers={manufacturers}
          value={manufacturer}
          onChange={setManufacturer}
          isLoading={isLoading}
        />

        <ModelSelect 
          models={models}
          value={model}
          onChange={setModel}
          disabled={!manufacturer || isLoading}
          isLoading={isLoading}
          manufacturerSelected={!!manufacturer}
        />

        <YearSelect 
          years={years}
          value={year}
          onChange={setYear}
        />
      </div>

      <div className="mt-6">
        <SearchButton 
          onClick={handleSearch}
          disabled={!manufacturer || !model || !year || isSearching}
          isSearching={isSearching}
          hasSelections={!!manufacturer && !!model && !!year}
          year={year}
          selectedModel={selectedModel}
        />
      </div>
    </div>
  );
};

export default CarSearchForm;
