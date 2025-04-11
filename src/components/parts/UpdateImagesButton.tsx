
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

// This component is now just a placeholder and doesn't perform any functionality
export const UpdateImagesButton = () => {
  return (
    <Button 
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
      disabled={true}
    >
      <RefreshCw className="h-4 w-4" />
      Update Images Disabled
    </Button>
  );
};
