
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";
import { PartCard } from "@/components/parts/PartCard";
import { Package2, AlertCircle } from "lucide-react";

interface PartsResultsProps {
  parts: Part[];
  visible: boolean;
}

const PartsResults: React.FC<PartsResultsProps> = ({ parts, visible }) => {
  if (!visible) {
    return null;
  }

  console.log("Parts in PartsResults:", parts); // Debug log

  if (!parts || parts.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Parts Found</h3>
        <p className="text-gray-500">We couldn't find any parts matching your search criteria. Try another combination.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center">
        <Package2 className="mr-2 h-6 w-6 text-mechanica-500" />
        <h3 className="text-xl font-semibold text-gray-800">
          Parts Matching Your Vehicle ({parts.length} found)
        </h3>
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
