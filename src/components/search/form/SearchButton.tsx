
import React from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Model } from "@/hooks/car-parts/types";

interface SearchButtonProps {
  onClick: () => void;
  disabled: boolean;
  isSearching: boolean;
  hasSelections: boolean;
  year: string;
  selectedModel?: Model;
}

const SearchButton: React.FC<SearchButtonProps> = ({ 
  onClick, 
  disabled, 
  isSearching,
  hasSelections,
  year,
  selectedModel
}) => {
  return (
    <div>
      <Button 
        onClick={onClick} 
        className="w-full bg-mechanica-500 hover:bg-mechanica-600 h-12 text-base"
        disabled={disabled}
      >
        <Search className="mr-2 h-5 w-5" /> 
        {isSearching ? "Searching..." : "Find Parts"}
      </Button>
      
      <div className="text-center mt-3 text-sm text-gray-500">
        {!hasSelections ? (
          <p>Please select all vehicle details above to search</p>
        ) : (
          <p>Click to search for parts compatible with your {year} {selectedModel?.name}</p>
        )}
      </div>
    </div>
  );
};

export default SearchButton;
