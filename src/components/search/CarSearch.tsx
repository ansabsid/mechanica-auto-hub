
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

// Mock data for demonstration
const manufacturers = [
  { id: 1, name: "Toyota" },
  { id: 2, name: "Honda" },
  { id: 3, name: "BMW" },
  { id: 4, name: "Mercedes" },
  { id: 5, name: "Ford" },
  { id: 6, name: "Audi" },
  { id: 7, name: "Nissan" },
];

const models = {
  1: [
    { id: 1, name: "Corolla" },
    { id: 2, name: "Camry" },
    { id: 3, name: "RAV4" },
    { id: 4, name: "Land Cruiser" },
  ],
  2: [
    { id: 5, name: "Civic" },
    { id: 6, name: "Accord" },
    { id: 7, name: "CR-V" },
  ],
  3: [
    { id: 8, name: "3 Series" },
    { id: 9, name: "5 Series" },
    { id: 10, name: "X5" },
  ],
  // Add models for other manufacturers as needed
};

const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);

const CarSearch = () => {
  const [manufacturer, setManufacturer] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const handleSearch = () => {
    console.log("Searching for parts with:", { manufacturer, model, year });
    // Handle search logic here
  };

  const getModelsForManufacturer = () => {
    if (!manufacturer) return [];
    return models[Number(manufacturer) as keyof typeof models] || [];
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
          <Select onValueChange={(value) => setManufacturer(value)}>
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
            disabled={!manufacturer}
          >
            <SelectTrigger id="model" className="w-full">
              <SelectValue placeholder={manufacturer ? "Select model" : "Select manufacturer first"} />
            </SelectTrigger>
            <SelectContent>
              {getModelsForManufacturer().map((mdl: any) => (
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
        >
          <Search className="mr-2 h-5 w-5" /> Find Parts
        </Button>
      </div>
    </div>
  );
};

export default CarSearch;
