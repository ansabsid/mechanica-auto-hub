
import React, { useState } from "react";
import { ShoppingCart, Wrench } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Part } from "@/hooks/useCarParts";
import { InstallationOptionsDialog } from "@/components/parts/InstallationOptionsDialog";
import { useToast } from "@/hooks/use-toast";

interface PurchaseOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  part: Part;
  onAddToCartOnly: () => void;
}

export const PurchaseOptionsDialog = ({
  isOpen,
  onClose,
  part,
  onAddToCartOnly,
}: PurchaseOptionsDialogProps) => {
  const [showInstallationOptions, setShowInstallationOptions] = useState(false);
  const { toast } = useToast();
  
  const handleBuyWithInstallation = () => {
    setShowInstallationOptions(true);
  };
  
  const handleInstallationComplete = () => {
    // Close both dialogs when installation is complete
    setShowInstallationOptions(false);
    onClose();
  };
  
  const handleCartOnlyClick = async () => {
    try {
      // Call the passed callback to add to cart
      await onAddToCartOnly();
      // Close the dialog after adding to cart
      onClose();
    } catch (error) {
      console.error("Error adding part to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add part to cart",
        variant: "destructive",
      });
    }
  };
  
  return (
    <>
      <Dialog open={isOpen && !showInstallationOptions} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Options</DialogTitle>
            <DialogDescription>
              How would you like to proceed with your purchase?
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                 onClick={handleCartOnlyClick}>
              <div className="w-12 h-12 rounded-full bg-mechanica-100 flex items-center justify-center mb-3">
                <ShoppingCart className="h-6 w-6 text-mechanica-600" />
              </div>
              <h3 className="font-medium text-lg">Buy Part Only</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Add this part to your cart and checkout
              </p>
            </div>
            
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                 onClick={handleBuyWithInstallation}>
              <div className="w-12 h-12 rounded-full bg-mechanica-100 flex items-center justify-center mb-3">
                <Wrench className="h-6 w-6 text-mechanica-600" />
              </div>
              <h3 className="font-medium text-lg">Buy With Installation</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Purchase this part and have it installed by a professional
              </p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <InstallationOptionsDialog 
        isOpen={showInstallationOptions}
        onClose={() => setShowInstallationOptions(false)}
        onComplete={handleInstallationComplete}
        part={part}
      />
    </>
  );
};
