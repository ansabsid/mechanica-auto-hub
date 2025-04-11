
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Part } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPin, Clock, PhoneCall } from "lucide-react";
import { getGaragesForPart } from "@/api/cartApi";
import { Garage } from "@/types/cart.types";

interface InstallationOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  part: Part;
}

// Areas for filtering
const areas = [
  "Dubai Marina",
  "Jumeirah",
  "Downtown Dubai",
  "Deira",
  "Al Quoz",
  "Business Bay",
  "JLT",
  "Palm Jumeirah",
  "Silicon Oasis",
  "Al Barsha"
];

export const InstallationOptionsDialog = ({
  isOpen,
  onClose,
  onComplete,
  part,
}: InstallationOptionsDialogProps) => {
  const [area, setArea] = useState("");
  const [step, setStep] = useState(1);
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // Fetch garages that have this part when the dialog opens
  useEffect(() => {
    if (isOpen && part) {
      fetchGarages();
    }
  }, [isOpen, part]);
  
  const fetchGarages = async () => {
    setIsLoading(true);
    try {
      const garagesData = await getGaragesForPart(part.id);
      setGarages(garagesData);
    } catch (error) {
      console.error("Error fetching garages:", error);
      toast({
        title: "Error",
        description: "Failed to load available garages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAreaSelect = (value: string) => {
    setArea(value);
    setStep(2);
  };
  
  const handleGarageSelect = (garage: Garage) => {
    setSelectedGarage(garage);
    setConfirmationOpen(true);
  };
  
  const handleConfirm = async () => {
    if (!selectedGarage) return;
    
    try {
      // Create installation data object
      const installationData = {
        installationRequired: true,
        garageId: selectedGarage.id,
        garageName: selectedGarage.name,
        installationFee: selectedGarage.installationFee
      };
      
      // Add part with installation info to cart
      await addToCart(part.id, 1, installationData);
      
      toast({
        title: "Added to cart",
        description: `${part.name} with installation at ${selectedGarage.name} has been added to your cart`,
      });
      
      // Close all dialogs
      setConfirmationOpen(false);
      onComplete(); // This will signal parent to close all dialogs
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };
  
  // Filter garages by selected area if step 2
  const filteredGarages = step === 2 && area 
    ? garages.filter(garage => garage.location.includes(area)) 
    : garages;
  
  const totalPrice = part.price + (selectedGarage ? selectedGarage.installationFee : 0);
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 1 ? "Select Your Area" : "Choose a Garage for Installation"}
            </DialogTitle>
            <DialogDescription>
              {step === 1 
                ? "Please select your area to find nearby garages" 
                : `Garages near ${area} that can install your part`}
            </DialogDescription>
          </DialogHeader>
          
          {step === 1 ? (
            <div className="py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="area">Your Area</Label>
                  <Select onValueChange={handleAreaSelect}>
                    <SelectTrigger id="area">
                      <SelectValue placeholder="Select your area" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.map((areaOption) => (
                        <SelectItem key={areaOption} value={areaOption}>
                          {areaOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {isLoading ? (
                <div className="text-center py-8">Loading available garages...</div>
              ) : filteredGarages.length === 0 ? (
                <div className="text-center py-8">
                  No garages found in {area} that can install this part.
                </div>
              ) : (
                filteredGarages.map((garage) => (
                  <div 
                    key={garage.id}
                    onClick={() => handleGarageSelect(garage)}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-base">{garage.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" /> {garage.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <Clock className="h-3.5 w-3.5 mr-1" /> Available tomorrow
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-mechanica-600">
                          ${garage.installationFee.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Installation fee</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={handleBack}>
              {step === 1 ? "Cancel" : "Back"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Installation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to add the following to your cart:
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedGarage && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <p className="font-medium">{part.name}</p>
                  <p className="text-sm text-gray-500">${part.price.toFixed(2)}</p>
                </div>
                
                <div className="border-b pb-2">
                  <p className="font-medium">Installation at {selectedGarage.name}</p>
                  <p className="text-sm text-gray-500">${selectedGarage.installationFee.toFixed(2)}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" /> {selectedGarage.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <PhoneCall className="h-3.5 w-3.5 mr-1" /> The garage will contact you to schedule the installation
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between">
                    <p className="font-medium">Total:</p>
                    <p className="font-bold">${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-mechanica-500 hover:bg-mechanica-600">
              Add to Cart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
