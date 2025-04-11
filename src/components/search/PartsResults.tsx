
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";
import { Package2, SearchX, Car } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface PartsResultsProps {
  parts: Part[];
  isLoading: boolean;
  searchCompleted: boolean;
}

// Function to get an appropriate image URL based on part name or category
const getPartImageUrl = (part: Part): string => {
  const name = part.name.toLowerCase();
  const category = part.category?.toLowerCase() || '';
  
  if (name.includes('oil') || category.includes('oil')) {
    return "https://images.unsplash.com/photo-1635954749253-a0642359cdfa?w=800&h=600&auto=format";
  } else if (name.includes('filter') || category.includes('filter')) {
    return "https://images.unsplash.com/photo-1635249576589-6e5c7326ffc1?w=800&h=600&auto=format";
  } else if (name.includes('brake') || category.includes('brake')) {
    return "https://images.unsplash.com/photo-1615384340342-28de71316d2a?w=800&h=600&auto=format";
  } else if (name.includes('spark') || category.includes('ignition')) {
    return "https://images.unsplash.com/photo-1602079836063-583166fbeba2?w=800&h=600&auto=format";
  } else if (name.includes('tire') || category.includes('tire') || name.includes('wheel')) {
    return "https://images.unsplash.com/photo-1591839728094-39242732d4c1?w=800&h=600&auto=format";
  } else if (name.includes('battery') || category.includes('electrical')) {
    return "https://images.unsplash.com/photo-1619641464045-b201ebd9ec0c?w=800&h=600&auto=format";
  } else if (name.includes('belt') || category.includes('belt')) {
    return "https://images.unsplash.com/photo-1629584603667-e9eda1c06851?w=800&h=600&auto=format"; 
  } else {
    // Default auto parts image for other categories
    return "https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=800&h=600&auto=format";
  }
};

const PartsResults: React.FC<PartsResultsProps> = ({ 
  parts, 
  isLoading, 
  searchCompleted 
}) => {
  console.log("PartsResults rendering with:", { 
    partsCount: parts?.length || 0, 
    isLoading, 
    searchCompleted,
    parts // Log actual parts array for debugging
  });
  
  // Don't render anything if search is not completed
  if (!searchCompleted) {
    return null;
  }
  
  // Loading state (should be handled by parent component)
  if (isLoading) {
    return (
      <div className="text-center p-8 bg-blue-50 border-4 border-blue-200 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <Package2 className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h3 className="text-2xl font-bold text-blue-800 mb-3">Searching for parts...</h3>
          <p className="text-gray-600">Please wait while we find matching parts.</p>
        </div>
      </div>
    );
  }

  // Check if parts array is empty
  if (!parts || parts.length === 0) {
    return (
      <div className="text-center p-8 bg-blue-50 border-4 border-blue-200 rounded-xl shadow-lg">
        <SearchX className="mx-auto h-16 w-16 text-blue-500 mb-4" />
        <h3 className="text-2xl font-bold text-blue-800 mb-3">No Parts Found</h3>
        <p className="text-gray-700 text-lg">No parts match your search criteria.</p>
        <p className="text-gray-600 mt-2">Try selecting different manufacturer, model, or year options.</p>
      </div>
    );
  }
  
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
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-md overflow-hidden mr-3">
                      <img 
                        src={getPartImageUrl(part)} 
                        alt={part.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {part.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-start space-x-2">
                    <Car className="h-5 w-5 text-mechanica-500 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        {part.manufacturer_id} - {part.model_id} - {part.year}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {part.description || "Compatible with vehicles matching these exact specifications"}
                      </div>
                    </div>
                  </div>
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
