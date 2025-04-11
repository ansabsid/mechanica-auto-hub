
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface YearSelectProps {
  years: number[];
  value: string;
  onChange: (value: string) => void;
}

const YearSelect: React.FC<YearSelectProps> = ({ years, value, onChange }) => {
  return (
    <div>
      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
        Make Year
      </label>
      <Select 
        onValueChange={(value) => {
          console.log("Year selected:", value);
          onChange(value);
        }}
        value={value}
      >
        <SelectTrigger id="year" className="w-full">
          <SelectValue placeholder="Select year" />
        </SelectTrigger>
        <SelectContent position="popper" className="bg-white z-50 max-h-60 overflow-y-auto">
          {years.map((yr) => (
            <SelectItem key={yr} value={yr.toString()}>
              {yr}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default YearSelect;
