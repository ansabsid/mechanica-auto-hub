
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";

interface GarageTabProps {
  newGarage: {
    name: string;
    area: string;
    location: string;
    installationFee: string;
  };
  setNewGarage: (garage: any) => void;
  handleAddGarage: (e: React.FormEvent) => Promise<void>;
  garageLoading: boolean;
  dubaiAreas: string[];
  isMobile: boolean;
}

export const GarageTab: React.FC<GarageTabProps> = ({
  newGarage,
  setNewGarage,
  handleAddGarage,
  garageLoading,
  dubaiAreas,
  isMobile,
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-lg md:text-xl font-semibold">Garage Management</h2>
        <Button 
          onClick={() => document.getElementById('garage-form')?.scrollIntoView({ behavior: 'smooth' })}
          variant="mechanica"
          size={isMobile ? "sm" : "default"}
          className="w-full md:w-auto"
        >
          <Plus className="mr-1 md:mr-2 h-4 w-4" /> Add New Garage
        </Button>
      </div>
      
      <div id="garage-form" className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Add New Garage</h3>
        <form onSubmit={handleAddGarage} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="garage-name">Garage Name*</Label>
            <Input 
              id="garage-name"
              value={newGarage.name}
              onChange={(e) => setNewGarage({...newGarage, name: e.target.value})}
              required
              placeholder="e.g. My Garage"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage-area">Area*</Label>
            <Select 
              value={newGarage.area}
              onValueChange={(value) => setNewGarage({...newGarage, area: value})}
            >
              <SelectTrigger id="garage-area">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {dubaiAreas.map(area => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage-location">Location*</Label>
            <Input 
              id="garage-location"
              value={newGarage.location}
              onChange={(e) => setNewGarage({...newGarage, location: e.target.value})}
              required
              placeholder="e.g. Dubai, UAE"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="garage-installation-fee">Installation Fee (AED)</Label>
            <Input 
              id="garage-installation-fee"
              type="number"
              value={newGarage.installationFee}
              onChange={(e) => setNewGarage({...newGarage, installationFee: e.target.value})}
              placeholder="e.g. 1000"
            />
          </div>
          <Button
            type="submit"
            variant="mechanica"
            disabled={garageLoading}
            className="w-full md:w-auto"
          >
            {garageLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Garage
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
