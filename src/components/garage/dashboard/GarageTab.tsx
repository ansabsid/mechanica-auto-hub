
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GarageTabProps {
  newGarage: {
    name: string;
    area: string;
    location: string;
  };
  setNewGarage: React.Dispatch<React.SetStateAction<{
    name: string;
    area: string;
    location: string;
  }>>;
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
  isMobile
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <h2 className="text-lg md:text-xl font-semibold">Garage Management</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6" id="garage-form">
        <h3 className="text-lg font-semibold mb-4">Add New Garage</h3>
        
        <form onSubmit={handleAddGarage} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="garage-name">Garage Name</Label>
              <Input 
                id="garage-name"
                type="text"
                placeholder="Enter garage name"
                value={newGarage.name}
                onChange={(e) => setNewGarage({...newGarage, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="garage-area">Area</Label>
              <Select 
                value={newGarage.area} 
                onValueChange={(value) => setNewGarage({...newGarage, area: value})}
              >
                <SelectTrigger id="garage-area">
                  <SelectValue placeholder="Select an area" />
                </SelectTrigger>
                <SelectContent>
                  {dubaiAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="garage-location">Location</Label>
            <Input 
              id="garage-location"
              type="text"
              placeholder="Enter detailed location"
              value={newGarage.location}
              onChange={(e) => setNewGarage({...newGarage, location: e.target.value})}
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="mt-2 w-full md:w-auto" 
            disabled={garageLoading}
            variant="mechanica"
          >
            {garageLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Garage'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};
