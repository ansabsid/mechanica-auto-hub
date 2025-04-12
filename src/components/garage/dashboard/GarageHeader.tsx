
import React from "react";
import { InstallationRequestsNotification } from "@/components/garage/InstallationRequestsNotification";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GarageHeaderProps {
  title: string;
  description: string;
  currentGarageId: string;
  availableGarages: Array<{ id: string; name: string }>;
  onGarageChange: (garageId: string) => void;
}

export const GarageHeader: React.FC<GarageHeaderProps> = ({
  title,
  description,
  currentGarageId,
  availableGarages,
  onGarageChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-mechanica-900">{title}</h2>
        <p className="text-sm md:text-base text-gray-600">{description}</p>
      </div>
      
      {availableGarages.length > 0 && (
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label htmlFor="garage-selector" className="text-sm font-medium whitespace-nowrap">
            Current Garage:
          </label>
          <Select 
            value={currentGarageId} 
            onValueChange={onGarageChange}
          >
            <SelectTrigger id="garage-selector" className="w-full md:w-[200px]">
              <SelectValue placeholder="Select garage" />
            </SelectTrigger>
            <SelectContent>
              {availableGarages.map(garage => (
                <SelectItem key={garage.id} value={garage.id}>
                  {garage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <InstallationRequestsNotification />
        </div>
      )}
    </div>
  );
};
