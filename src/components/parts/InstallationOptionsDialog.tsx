import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Part } from "@/hooks/useCarParts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/hooks/useCart";
import { Garage, InstallationOptions } from "@/types/cart.types";

interface InstallationOptionsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  part: Part;
}

export const InstallationOptionsDialog = ({
  isOpen,
  onClose,
  onComplete,
  part,
}: InstallationOptionsDialogProps) => {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState("");
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { addToCart, refreshCart } = useCart();
  
  // Function to add to cart with installation
  const handleConfirmInstallation = async () => {
    if (!selectedGarage) {
      toast({
        title: "Error",
        description: "Please select a garage for installation",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const installationOptions: InstallationOptions = {
        installationRequired: true,
        garageId: selectedGarage.id,
        garageName: selectedGarage.name,
        installationFee: selectedGarage.installationFee
      };
      
      // Add item to cart with installation
      console.log("Adding to cart with installation:", {
        partId: part.id,
        installationOptions
      });
      
      await addToCart(part.id, 1, installationOptions);
      
      toast({
        title: "Success",
        description: `${part.name} with installation has been added to your cart`,
      });
      
      // Close all dialogs
      setConfirmationOpen(false);
      
      // Reset state for clean re-opening
      setStep(1);
      setArea("");
      setSelectedGarage(null);
      
      // Signal parent to close all dialogs and refresh cart
      onComplete();
      
      // Force a cart refresh after adding to ensure it updates properly
      setTimeout(() => {
        refreshCart();
      }, 100);
    } catch (error) {
      console.error("Error adding to cart with installation:", error);
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <DialogDescription>
              Let us know your general location so we can find local garages.
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  placeholder="e.g. Dubai Marina"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={() => setStep(2)}
                disabled={!area}
              >
                Next
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogDescription>
              Select a garage for the installation of your part.
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="garage">Garage</Label>
                <Select onValueChange={(value) => {
                  const garage = part.availableGarages?.find(g => g.id === value);
                  setSelectedGarage(garage || null);
                }}>
                  <SelectTrigger id="garage">
                    <SelectValue placeholder="Select a garage" />
                  </SelectTrigger>
                  <SelectContent>
                    {part.availableGarages?.map((garage) => (
                      <SelectItem key={garage.id} value={garage.id}>
                        {garage.name} - {garage.location} (+
                        {garage.installationFee})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={() => setStep(3)}
                disabled={!selectedGarage}
              >
                Next
              </Button>
            </DialogFooter>
          </>
        );
      case 3:
        return (
          <>
            <DialogDescription>
              Confirm your installation details.
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <p>
                  <strong>Part:</strong> {part.name}
                </p>
                <p>
                  <strong>Garage:</strong> {selectedGarage?.name}
                </p>
                <p>
                  <strong>Location:</strong> {selectedGarage?.location}
                </p>
                <p>
                  <strong>Installation Fee:</strong>{" "}
                  {selectedGarage?.installationFee}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep(2)}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleConfirmInstallation}
                disabled={loading}
              >
                Confirm Installation
              </Button>
            </DialogFooter>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Installation Options</DialogTitle>
        </DialogHeader>
        {renderStepContent()}
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};
