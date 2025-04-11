
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// This component is completely disabled as we're no longer using automatic image updates
export const UpdateImagesButton = () => {
  return (
    <Button 
      variant="outline"
      size="sm"
      className="flex items-center gap-2 hidden" // Added hidden class to completely remove from view
      disabled={true}
    >
      <RefreshCw className="h-4 w-4" />
      Update Images Disabled
    </Button>
  );
};
