
import React from "react";
import { MapPin, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

interface GarageCardProps {
  garage: {
    id: string;
    name: string;
    area: string | null;
    location: string;
    images?: string | null;
    installationFee?: number | null;
  };
}

const GarageCard = ({ garage }: GarageCardProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleBookAppointment = (garageId: string, garageName: string) => {
    console.log(`Booking appointment for garage: ${garageId}`);
    
    if (!isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      toast.info("Please login to book a service");
      navigate("/login", { 
        state: { 
          from: `/book-appointment/${garageId}`,
          garageName,
          garageId 
        } 
      });
      return;
    }
    
    navigate(`/book-appointment/${garageId}`, { 
      state: { 
        garageName,
        garageId 
      } 
    });
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          src={garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={garage.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{garage.name}</CardTitle>
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5 mr-1 text-mechanica-500" />
          {garage.location}
          {garage.area && ` (${garage.area})`}
        </div>
      </CardHeader>
      <CardContent className="flex-grow pb-2 pt-0">
        {garage.installationFee !== null && garage.installationFee !== undefined && (
          <div className="flex items-center text-sm text-gray-600 mt-2">
            <DollarSign className="h-3.5 w-3.5 mr-1 text-green-600" />
            <span>Installation Fee: ${garage.installationFee.toFixed(2)}</span>
          </div>
        )}
        <div className="text-xs text-gray-400 mt-2">
          ID: {garage.id.substring(0, 8)}...
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          size="sm" 
          className="w-full bg-mechanica-600 flex items-center"
          onClick={() => handleBookAppointment(garage.id, garage.name)}
        >
          <Calendar className="h-4 w-4 mr-1" /> Book Service
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GarageCard;
