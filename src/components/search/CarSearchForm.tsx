
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCarParts, Manufacturer, Model } from "@/hooks/useCarParts";

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
    console.log("Fetching manufacturers...");
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (manufacturer) {
      console.log("Manufacturer selected:", manufacturer);
      console.log("Fetching models for manufacturer:", manufacturer);
      fetchModels(manufacturer);
      // Reset model when manufacturer changes
      setModel("");
    }
  }, [manufacturer]);

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
      
      console.log("Starting search with params:", { manufacturer, model, year });
      const count = await searchParts(manufacturer, model, year);
      console.log("Search returned count:", count);
      
      // Pass count to parent component to update the UI
      onSearch(count);
    } catch (error: any) {
      console.error("Search failed:", error);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "An error occurred while searching"
      });
    }
  };

  console.log("Current manufacturers:", manufacturers);
  console.log("Current models:", models);
  console.log("Current selection - manufacturer:", manufacturer, "model:", model, "year:", year);

  return (
    <div className="bg-white p-6 rounded-xl shadow-card max-w-4xl w-full mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Find the perfect parts for your vehicle
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
            Car Manufacturer
          </label>
          <Select 
            onValueChange={(value) => {
              console.log("Manufacturer selected:", value);
              setManufacturer(value);
              setModel(""); // Reset model when manufacturer changes
            }}
            disabled={isLoading}
            value={manufacturer}
          >
            <SelectTrigger id="manufacturer" className="w-full">
              <SelectValue placeholder="Select manufacturer" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white z-50">
              {manufacturers.map((mfr) => (
                <SelectItem key={mfr.id} value={mfr.id.toString()}>
                  {mfr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
            Car Model
          </label>
          <Select 
            onValueChange={(value) => {
              console.log("Model selected:", value);
              setModel(value);
            }} 
            disabled={!manufacturer || isLoading}
            value={model}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue placeholder={manufacturer ? "Select model" : "Select manufacturer first"} />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white z-50">
              {models.map((mdl) => (
                <SelectItem key={mdl.id} value={mdl.id.toString()}>
                  {mdl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
            Make Year
          </label>
          <Select 
            onValueChange={(value) => {
              console.log("Year selected:", value);
              setYear(value);
            }}
            value={year}
          >
            <SelectTrigger id="year" className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white z-50">
              {years.map((yr) => (
                <SelectItem key={yr} value={yr.toString()}>
                  {yr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6">
        <Button 
          onClick={handleSearch} 
          className="w-full bg-mechanica-500 hover:bg-mechanica-600 h-12 text-base"
          disabled={!manufacturer || !model || !year || isSearching}
        >
          <Search className="mr-2 h-5 w-5" /> 
          {isSearching ? "Searching..." : "Find Parts"}
        </Button>
        
        <div className="text-center mt-3 text-sm text-gray-500">
          {!manufacturer || !model || !year ? (
            <p>Please select all vehicle details above to search</p>
          ) : (
            <p>Click to search for parts compatible with your {year} {models.find(m => m.id.toString() === model)?.name}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarSearchForm;
