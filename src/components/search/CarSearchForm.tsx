
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCarParts, Manufacturer, Model } from "@/hooks/useCarParts";

interface CarSearchFormProps {
  onSearch: (results: number) => void;
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
    searchParts
  } = useCarParts();

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (manufacturer) {
      fetchModels(manufacturer);
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
      const count = await searchParts(manufacturer, model, year);
      onSearch(count);
      
      toast({
        title: "Search Results",
        description: `Found ${count} parts matching your search criteria`
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "An error occurred while searching"
      });
    }
  };

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
              setManufacturer(value);
              setModel(""); // Reset model when manufacturer changes
            }}
            disabled={isLoading}
          >
            <SelectTrigger id="manufacturer" className="w-full">
              <SelectValue placeholder="Select manufacturer" />
            </SelectTrigger>
            <SelectContent>
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
            onValueChange={(value) => setModel(value)} 
            disabled={!manufacturer || isLoading}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue placeholder={manufacturer ? "Select model" : "Select manufacturer first"} />
            </SelectTrigger>
            <SelectContent>
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
          <Select onValueChange={(value) => setYear(value)}>
            <SelectTrigger id="year" className="w-full">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
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
      </div>
    </div>
  );
};

export default CarSearchForm;
