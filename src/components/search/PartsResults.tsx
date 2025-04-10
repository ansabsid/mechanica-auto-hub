
import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";
import { PartCard } from "@/components/parts/PartCard";
import { Package2, SearchX, LayoutGrid } from "lucide-react";

interface PartsResultsProps {
  parts: Part[];
  visible: boolean;
}

const PartsResults: React.FC<PartsResultsProps> = ({ parts, visible }) => {
  // Add detailed console logging to inspect the received props
  useEffect(() => {
    console.log("PartsResults mounted/updated");
    console.log("PartsResults received parts:", parts);
    console.log("PartsResults visibility:", visible);
    console.log("PartsResults parts length:", parts?.length || 0);
  }, [parts, visible]);

  if (!visible) {
    console.log("PartsResults not visible, returning null");
    return null;
  }

  // Check if parts array is empty or undefined
  if (!parts || parts.length === 0) {
    console.log("No parts found in PartsResults component");
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <SearchX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Parts Found</h3>
        <p className="text-gray-500">We couldn't find any parts matching your search criteria. Try another combination.</p>
      </div>
    );
  }

  console.log("Rendering parts list with", parts.length, "items");
  
  return (
    <div className="parts-results-container animate-in fade-in-50 duration-300">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Package2 className="mr-2 h-6 w-6 text-mechanica-500" />
          <h3 className="text-xl font-semibold text-gray-800">
            Parts Matching Your Vehicle ({parts.length} found)
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-mechanica-50">
            <LayoutGrid className="h-4 w-4 mr-1" /> Grid View
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
};

export default PartsResults;
