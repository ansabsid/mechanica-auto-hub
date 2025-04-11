
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Part } from "@/hooks/useCarParts";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPin, Clock, PhoneCall } from "lucide-react";

interface InstallationOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  part: Part;
}

// Mock data for garages
const mockGarages = [
  { id: "g1", name: "AutoCare Dubai", location: "Dubai Marina", distance: "2.3 km", installationFee: 45 },
  { id: "g2", name: "SparkTech Auto", location: "Al Quoz", distance: "4.7 km", installationFee: 35 },
  { id: "g3", name: "BrakeMax", location: "Deira", distance: "7.1 km", installationFee: 50 },
  { id: "g4", name: "FilterPro", location: "Business Bay", distance: "3.5 km", installationFee: 40 },
];

// Mock data for areas
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
  const [selectedGarage, setSelectedGarage] = useState<any>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  const handleAreaSelect = (value: string) => {
    setArea(value);
    setStep(2);
  };
  
  const handleGarageSelect = (garage: any) => {
    setSelectedGarage(garage);
    setConfirmationOpen(true);
  };
  
  const handleConfirm = () => {
    // Add part with installation info to cart
    addToCart(part.id, 1, {
      installationRequired: true,
      garageId: selectedGarage.id,
      garageName: selectedGarage.name,
      installationFee: selectedGarage.installationFee
    });
    
    toast({
      title: "Added to cart",
      description: `${part.name} with installation at ${selectedGarage.name} has been added to your cart`,
    });
    
    setConfirmationOpen(false);
    onComplete();
  };
  
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      onClose();
    }
  };
  
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
              {mockGarages.map((garage) => (
                <div 
                  key={garage.id}
                  onClick={() => handleGarageSelect(garage)}
                  className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-base">{garage.name}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 mr-1" /> {garage.location} ({garage.distance})
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3.5 w-3.5 mr-1" /> Available tomorrow
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-mechanica-600">
                        ${garage.installationFee}
                      </p>
                      <p className="text-xs text-gray-500">Installation fee</p>
                    </div>
                  </div>
                </div>
              ))}
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
