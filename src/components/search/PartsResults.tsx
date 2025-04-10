
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
      <div className="text-center p-8 bg-red-50 border-4 border-red-200 rounded-xl shadow-lg">
        <SearchX className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h3 className="text-2xl font-bold text-red-800 mb-3">No Parts Found</h3>
        <p className="text-gray-700 text-lg">We couldn't find any parts matching your search criteria.</p>
        <p className="text-gray-600 mt-2">Try another combination of manufacturer, model, and year.</p>
      </div>
    );
  }

  console.log("Rendering parts list with", parts.length, "items");
  
  return (
    <div className="parts-results-container animate-in fade-in-50 duration-300">
      <div className="mb-6 flex items-center justify-between bg-mechanica-100 p-6 rounded-lg border-2 border-mechanica-300 shadow-md">
        <div className="flex items-center">
          <Package2 className="mr-3 h-8 w-8 text-mechanica-600" />
          <h3 className="text-2xl font-bold text-gray-800">
            Parts Matching Your Vehicle
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white py-2 px-3 text-base">
            <span className="text-mechanica-600 font-semibold">{parts.length}</span> parts found
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parts.map((part) => (
          <PartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
};

export default PartsResults;
