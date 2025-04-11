
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Manufacturer } from "@/hooks/car-parts/types";

interface ManufacturerSelectProps {
  manufacturers: Manufacturer[];
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

const ManufacturerSelect: React.FC<ManufacturerSelectProps> = ({ 
  manufacturers, 
  value, 
  onChange,
  isLoading 
}) => {
  return (
    <div>
      <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">
        Car Manufacturer
      </label>
      <Select 
        onValueChange={(value) => {
          console.log("Manufacturer selected:", value);
          onChange(value);
        }}
        value={value}
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
  );
};

export default ManufacturerSelect;
