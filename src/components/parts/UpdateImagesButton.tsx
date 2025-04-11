
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateAllPartImages } from "@/utils/updatePartImages";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";

export const UpdateImagesButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdateImages = async () => {
    setIsLoading(true);
    try {
      await updateAllPartImages();
      // Success toast is already handled in the updateAllPartImages function
    } catch (error: any) {
      toast.error(`Failed to update images: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline"
      size="sm"
      onClick={handleUpdateImages}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Updating Images..." : "Update Part Images"}
    </Button>
  );
};
