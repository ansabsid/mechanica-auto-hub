
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Part } from "@/hooks/useCarParts";

interface PartsResultsProps {
  parts: Part[];
  visible: boolean;
}

const PartsResults: React.FC<PartsResultsProps> = ({ parts, visible }) => {
  if (!visible || parts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Parts Matching Your Vehicle
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.map((part) => (
          <Card key={part.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{part.name}</CardTitle>
              <CardDescription>
                {part.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-mechanica-600">
                  ${part.price.toFixed(2)}
                </span>
                <Badge variant={part.stock > 0 ? "default" : "destructive"}>
                  {part.stock > 0 ? `${part.stock} in stock` : "Out of stock"}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-2 text-sm text-gray-500">
              {part.garages ? (
                <span>Available at: {part.garages.name} ({part.garages.location})</span>
              ) : (
                <span>Available at multiple locations</span>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PartsResults;
