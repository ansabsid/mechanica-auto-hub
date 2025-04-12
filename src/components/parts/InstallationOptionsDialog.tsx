
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Part, Garage } from "@/hooks/car-parts/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/useCart";
import { InstallationOptions } from "@/types/cart.types";
import { MapPin } from "lucide-react";
import { useGarageManagement } from "@/hooks/useGarageManagement";

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
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedGarageId, setSelectedGarageId] = useState<string>("");
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const { toast } = useToast();
  const { addToCart, refreshCart } = useCart();
  const { fetchGarages, garages } = useGarageManagement();

  // Fetch garages on component mount
  useEffect(() => {
    fetchGarages();
  }, [fetchGarages]);

  // Extract available areas from garages
  useEffect(() => {
    if (garages && garages.length > 0) {
      const areas = Array.from(new Set(
        garages
          .map(garage => garage.area)
          .filter(area => area !== null && area !== undefined && area !== "")
      ));
      
      setAvailableAreas(areas);
      
      if (areas.length === 1) {
        setSelectedArea(areas[0]);
      }
      
      console.log("Available areas extracted from all garages:", areas);
    } else {
      console.log("No garages available or garages don't have areas");
      setAvailableAreas([]);
    }
  }, [garages]);

  // Filter garages by selected area
  useEffect(() => {
    if (selectedArea && garages && garages.length > 0) {
      const garagesInArea = garages.filter(
        garage => garage.area === selectedArea
      );
      
      console.log("Filtered garages for area", selectedArea, ":", garagesInArea);
      
      // Reset garage selection when area changes
      setSelectedGarageId("");
      setSelectedGarage(null);
      
      const convertedGarages: Garage[] = garagesInArea.map(garage => ({
        id: garage.id,
        name: garage.name,
        location: garage.location,
        area: garage.area || "",
        installationFee: garage.installationFee || 0
      }));
      
      setFilteredGarages(convertedGarages);
    }
  }, [selectedArea, garages]);
  
  // A more robust way to handle garage selection
  const handleGarageSelection = useCallback((value: string) => {
    console.log("Garage selection triggered with value:", value);
    
    if (!value) {
      console.log("Empty garage value, clearing selection");
      setSelectedGarageId("");
      setSelectedGarage(null);
      return;
    }
    
    // Find the garage in our filtered list
    const selectedGarageObj = filteredGarages.find(g => g.id === value);
    
    if (selectedGarageObj) {
      console.log("Found matching garage:", selectedGarageObj);
      
      // Update both states synchronously
      setSelectedGarageId(value);
      setSelectedGarage(selectedGarageObj);
    } else {
      console.log("No matching garage found for ID:", value);
      setSelectedGarageId("");
      setSelectedGarage(null);
    }
  }, [filteredGarages]);
  
  // Go to next step function
  const goToNextStep = useCallback(() => {
    setStep(currentStep => currentStep + 1);
  }, []);
  
  // Go to previous step function
  const goToPreviousStep = useCallback(() => {
    setStep(currentStep => Math.max(1, currentStep - 1));
  }, []);
  
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
      
      console.log("Adding to cart with installation:", {
        partId: part.id,
        installationOptions
      });
      
      await addToCart(part.id, 1, installationOptions);
      
      toast({
        title: "Success",
        description: `${part.name} with installation has been added to your cart`,
      });
      
      // Reset the state
      setStep(1);
      setSelectedArea("");
      setSelectedGarageId("");
      setSelectedGarage(null);
      
      onComplete();
      
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
              Select your area to find nearby garages for installation.
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="area">Area</Label>
                <div className="relative">
                  <Select
                    value={selectedArea}
                    onValueChange={setSelectedArea}
                  >
                    <SelectTrigger id="area" className="w-full">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <SelectValue placeholder="Select an area" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {availableAreas.length > 0 ? (
                        availableAreas.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-areas-available" disabled>
                          No areas available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!selectedArea || availableAreas.length === 0}
              >
                Next
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        );
      case 2:
        return (
          <>
            <DialogDescription>
              Select a garage in {selectedArea} for the installation of your part.
            </DialogDescription>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="garage">Garage</Label>
                <Select 
                  value={selectedGarageId} 
                  onValueChange={handleGarageSelection}
                >
                  <SelectTrigger id="garage" className="w-full">
                    <SelectValue placeholder="Select a garage" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredGarages.length > 0 ? (
                      filteredGarages.map((garage) => (
                        <SelectItem key={garage.id} value={garage.id}>
                          {garage.name} - {garage.location} (+${garage.installationFee})
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-garages-available" disabled>
                        No garages available in this area
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {/* Debug info */}
                <div className="text-xs text-gray-400 mt-1">
                  Selected garage ID: {selectedGarageId || 'none'}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreviousStep}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                disabled={!selectedGarageId || !selectedGarage}
              >
                Next
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
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
                  <strong>Area:</strong> {selectedArea}
                </p>
                <p>
                  <strong>Location:</strong> {selectedGarage?.location}
                </p>
                <p>
                  <strong>Installation Fee:</strong>{" "}
                  ${selectedGarage?.installationFee}
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  The part will be shipped to the garage for installation.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreviousStep}
              >
                Previous
              </Button>
              <Button
                type="button"
                onClick={handleConfirmInstallation}
                disabled={loading || !selectedGarage}
              >
                {loading ? "Processing..." : "Confirm Installation"}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
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
      </DialogContent>
    </Dialog>
  );
};
