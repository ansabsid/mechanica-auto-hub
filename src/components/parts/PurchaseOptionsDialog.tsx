import React, { useState, useEffect } from "react";
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
import { Part } from "@/hooks/car-parts/types";
import { InstallationOptionsDialog } from "@/components/parts/InstallationOptionsDialog";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/cart";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { refreshCart } = useCart();
  
  useEffect(() => {
    if (isOpen) {
      refreshCart();
    }
  }, [isOpen, refreshCart]);
  
  const handleBuyWithInstallation = () => {
    setShowInstallationOptions(true);
    onClose();
  };
  
  const handleInstallationComplete = () => {
    setShowInstallationOptions(false);
    setTimeout(() => {
      refreshCart();
    }, 100);
  };
  
  const handleCartOnlyClick = async () => {
    try {
      console.log("Handling cart only click");
      setIsAddingToCart(true);
      await onAddToCartOnly();
      await refreshCart();
      onClose();
      
      toast({
        title: "Success",
        description: "Item has been added to your cart",
      });
    } catch (error) {
      console.error("Error adding part to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add part to cart",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) onClose();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Options</DialogTitle>
            <DialogDescription>
              How would you like to proceed with your purchase?
            </DialogDescription>
          </DialogHeader>
          
          {isAddingToCart ? (
            <div className="py-8 flex justify-center">
              <LoadingSpinner />
              <p className="ml-3 text-gray-500">Adding to cart...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 py-4">
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={handleCartOnlyClick}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Buy Part Only</h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Add this part to your cart and checkout
                </p>
              </div>
              
              <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                   onClick={handleBuyWithInstallation}>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Wrench className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg">Buy With Installation</h3>
                <p className="text-sm text-gray-500 text-center mt-1">
                  Purchase this part and have it installed by a professional
                </p>
              </div>
            </div>
          )}
          
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
