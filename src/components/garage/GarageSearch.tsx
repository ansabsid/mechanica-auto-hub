
import React from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GarageSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GarageSearch = ({ searchQuery, setSearchQuery }: GarageSearchProps) => {
  return (
    <div className="max-w-xl mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input 
          placeholder="Search by location or garage name..." 
          className="bg-white pl-10 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default GarageSearch;
