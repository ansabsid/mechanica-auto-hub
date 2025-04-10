
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Manufacturer {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  manufacturer_id: number;
}

interface Part {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  manufacturer_id: number;
  model_id: number;
  year: number;
  garage_id: string | null;
  garages: {
    name: string;
    location: string;
  } | null;
}

const CarSearch = () => {
  const [manufacturer, setManufacturer] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const { toast } = useToast();

  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    const fetchManufacturers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('manufacturers')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setManufacturers(data);
        }
      } catch (error: any) {
        console.error('Error fetching manufacturers:', error.message);
        // Show fallback data if error
        setManufacturers([
          { id: 1, name: "Toyota" },
          { id: 2, name: "Honda" },
          { id: 3, name: "BMW" },
          { id: 4, name: "Mercedes" },
          { id: 5, name: "Ford" },
          { id: 6, name: "Audi" },
          { id: 7, name: "Nissan" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (!manufacturer) {
      setModels([]);
      return;
    }
    
    const fetchModels = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('models')
          .select('*')
          .eq('manufacturer_id', parseInt(manufacturer))
          .order('name');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setModels(data);
        } else {
          // If no models found, provide fallback data
          const mockModels: { [key: string]: Model[] } = {
            "1": [
              { id: 1, name: "Corolla", manufacturer_id: 1 },
              { id: 2, name: "Camry", manufacturer_id: 1 },
              { id: 3, name: "RAV4", manufacturer_id: 1 },
              { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
            ],
            "2": [
              { id: 5, name: "Civic", manufacturer_id: 2 },
              { id: 6, name: "Accord", manufacturer_id: 2 },
              { id: 7, name: "CR-V", manufacturer_id: 2 },
            ],
            "3": [
              { id: 8, name: "3 Series", manufacturer_id: 3 },
              { id: 9, name: "5 Series", manufacturer_id: 3 },
              { id: 10, name: "X5", manufacturer_id: 3 },
            ],
          };
          
          setModels(mockModels[manufacturer] || []);
        }
      } catch (error: any) {
        console.error('Error fetching models:', error.message);
        // Fallback data on error
        const mockModels: { [key: string]: Model[] } = {
          "1": [
            { id: 1, name: "Corolla", manufacturer_id: 1 },
            { id: 2, name: "Camry", manufacturer_id: 1 },
            { id: 3, name: "RAV4", manufacturer_id: 1 },
            { id: 4, name: "Land Cruiser", manufacturer_id: 1 },
          ],
          "2": [
            { id: 5, name: "Civic", manufacturer_id: 2 },
            { id: 6, name: "Accord", manufacturer_id: 2 },
            { id: 7, name: "CR-V", manufacturer_id: 2 },
          ],
          "3": [
            { id: 8, name: "3 Series", manufacturer_id: 3 },
            { id: 9, name: "5 Series", manufacturer_id: 3 },
            { id: 10, name: "X5", manufacturer_id: 3 },
          ],
        };
        
        setModels(mockModels[manufacturer] || []);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchModels();
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

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('parts')
        .select(`
          *,
          garages:garage_id (name, location)
        `)
        .eq('manufacturer_id', parseInt(manufacturer))
        .eq('model_id', parseInt(model))
        .eq('year', parseInt(year));
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Search Results",
        description: `Found ${data?.length || 0} parts matching your search criteria`
      });
      
      console.log("Parts found:", data);
      
    } catch (error: any) {
      console.error("Error searching for parts:", error.message);
      toast({
        variant: "destructive",
        title: "Search failed",
        description: error.message || "An error occurred while searching"
      });
    } finally {
      setIsSearching(false);
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

export default CarSearch;
