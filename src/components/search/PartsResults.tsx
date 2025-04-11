
import React, { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";
import { Package2, SearchX, FileQuestion } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
    
    // Debug parts data to identify any filtering issues
    if (parts && parts.length > 0) {
      console.log("Sample part data:", {
        id: parts[0].id,
        name: parts[0].name,
        manufacturer_id: parts[0].manufacturer_id,
        model_id: parts[0].model_id,
        year: parts[0].year
      });
    }
  }, [parts, visible]);

  if (!visible) {
    console.log("PartsResults not visible, returning null");
    return null;
  }

  // Check if parts array is empty or undefined
  if (!parts || parts.length === 0) {
    console.log("No parts found in PartsResults component");
    return (
      <div className="text-center p-8 bg-blue-50 border-4 border-blue-200 rounded-xl shadow-lg">
        <SearchX className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h3 className="text-2xl font-bold text-blue-800 mb-3">No Parts Found</h3>
        <p className="text-gray-700 text-lg">No parts match your search criteria.</p>
        <p className="text-gray-600 mt-2">Try selecting different manufacturer, model, or year options.</p>
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
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-mechanica-50">
              <TableHead className="font-bold text-mechanica-800">Part Name</TableHead>
              <TableHead className="font-bold text-mechanica-800">Vehicle Details</TableHead>
              <TableHead className="font-bold text-mechanica-800 text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts.map((part) => (
              <TableRow key={part.id} className="hover:bg-mechanica-50">
                <TableCell className="font-medium">{part.name}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  Manufacturer ID: {part.manufacturer_id}, Model ID: {part.model_id}, Year: {part.year}
                </TableCell>
                <TableCell className="text-right font-bold">${part.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PartsResults;
