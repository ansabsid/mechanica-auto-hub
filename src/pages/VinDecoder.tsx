
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { useVehicles, Vehicle } from "@/hooks/useVehicles";
import VinDecoder from "@/components/vehicles/VinDecoder";
import { toast } from "sonner";
import { Car } from "lucide-react";

const VinDecoderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addVehicle, isLoading } = useVehicles();
  const [decodedVehicle, setDecodedVehicle] = useState<Vehicle | null>(null);

  const handleVehicleDecoded = (vehicle: Vehicle) => {
    setDecodedVehicle(vehicle);
  };

  const handleSaveVehicle = async () => {
    if (!decodedVehicle) return;
    
    if (!user) {
      toast.error("Please log in to save this vehicle to your account");
      navigate("/login");
      return;
    }
    
    const result = await addVehicle(decodedVehicle);
    if (result) {
      toast.success("Vehicle added to your account");
      setDecodedVehicle(null);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Helmet>
        <title>VIN Decoder | BookMyParts</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Vehicle Identification Number (VIN) Decoder</h1>
        <p className="text-muted-foreground">
          Instantly decode any VIN to get detailed information about the vehicle.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <VinDecoder onVehicleDecoded={handleVehicleDecoded} />
        
        {decodedVehicle && (
          <div className="flex justify-end">
            <Button 
              onClick={handleSaveVehicle} 
              disabled={isLoading}
              className="gap-2"
            >
              <Car className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save to My Vehicles"}
            </Button>
          </div>
        )}
        
        <div className="mt-8 bg-muted p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">About VIN Decoding</h2>
          <p className="text-sm text-muted-foreground">
            A Vehicle Identification Number (VIN) is a unique code assigned to every motor vehicle when it's manufactured. 
            The VIN is a 17-character string of letters and numbers that serves as the car's fingerprint, as no two vehicles 
            in operation have the same VIN.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This tool uses the National Highway Traffic Safety Administration's (NHTSA) database to decode VINs and 
            provide detailed information about the vehicle's make, model, year, and other specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VinDecoderPage;
