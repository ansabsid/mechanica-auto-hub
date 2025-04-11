
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Model } from "@/hooks/car-parts/types";

interface ModelSelectProps {
  models: Model[];
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  isLoading: boolean;
  manufacturerSelected: boolean;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ 
  models, 
  value, 
  onChange, 
  disabled,
  isLoading,
  manufacturerSelected
}) => {
  return (
    <div>
      <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
        Car Model
      </label>
      <Select 
        onValueChange={(value) => {
          console.log("Model selected:", value);
          onChange(value);
        }} 
        disabled={disabled}
        value={value}
      >
        <SelectTrigger id="model" className="w-full">
          <SelectValue placeholder={manufacturerSelected ? (isLoading ? "Loading models..." : "Select model") : "Select manufacturer first"} />
        </SelectTrigger>
        <SelectContent position="popper" className="bg-white z-50 max-h-60 overflow-y-auto">
          {models && models.length > 0 ? (
            models.map((mdl) => (
              <SelectItem key={mdl.id} value={mdl.id.toString()}>
                {mdl.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-models" disabled>No models available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ModelSelect;
