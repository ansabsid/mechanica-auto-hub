
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CircleAlertIcon, Car, CheckCircle2, AlertCircle } from "lucide-react";
import { Vehicle } from "@/hooks/useVehicles";
import { fetchVehicleByVin } from "@/hooks/vehicles/vinDecoderUtils";

interface VinDecoderProps {
  onVehicleDecoded?: (vehicle: Vehicle) => void;
}

const VinDecoder: React.FC<VinDecoderProps> = ({ onVehicleDecoded }) => {
  const [vin, setVin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decodedVehicle, setDecodedVehicle] = useState<Vehicle | null>(null);

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVin(e.target.value.toUpperCase().trim());
    setError(null);
  };

  const decodeVin = async () => {
    if (!vin || vin.length < 17) {
      setError("Please enter a valid 17-character VIN");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const vehicleData = await fetchVehicleByVin(vin);
      setDecodedVehicle(vehicleData);
      if (onVehicleDecoded) {
        onVehicleDecoded(vehicleData);
      }
    } catch (err: any) {
      setError(err.message || "Failed to decode VIN");
      setDecodedVehicle(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            VIN Decoder
          </CardTitle>
          <CardDescription>
            Enter your vehicle's 17-character VIN to automatically retrieve its details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vin">Vehicle Identification Number (VIN)</Label>
              <div className="flex space-x-2">
                <Input
                  id="vin"
                  value={vin}
                  onChange={handleVinChange}
                  placeholder="e.g., 1HGCM82633A004352"
                  className="flex-1"
                  maxLength={17}
                />
                <Button 
                  onClick={decodeVin} 
                  disabled={isLoading || !vin}
                >
                  {isLoading ? "Decoding..." : "Decode"}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            {decodedVehicle && (
              <Alert className="bg-muted">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <AlertTitle>Vehicle Decoded Successfully</AlertTitle>
                <AlertDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-sm font-medium">Make:</div>
                    <div className="text-sm">{decodedVehicle.make}</div>
                    
                    <div className="text-sm font-medium">Model:</div>
                    <div className="text-sm">{decodedVehicle.model}</div>
                    
                    <div className="text-sm font-medium">Year:</div>
                    <div className="text-sm">{decodedVehicle.year}</div>
                    
                    {decodedVehicle.vin && (
                      <>
                        <div className="text-sm font-medium">VIN:</div>
                        <div className="text-sm">{decodedVehicle.vin}</div>
                      </>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>
              This uses the NHTSA database to decode your VIN. Some newer vehicles may not be available in their system.
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VinDecoder;
