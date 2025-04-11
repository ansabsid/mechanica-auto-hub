
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, PlusCircle, MapPin, Search, X } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGarageManagement } from "@/hooks/useGarageManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

// Updated interface to match GarageInfo from the hook but making id required
interface Garage {
  id: string;
  name: string;
  location: string;
  area: string | null;
  images: string | null;
  installationFee?: string;
}

// Create a component for the garage card
const GarageCard = ({ garage }: { garage: Garage }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{garage.name}</CardTitle>
          {garage.area && (
            <Badge variant="outline" className="bg-mechanica-50">
              {garage.area}
            </Badge>
          )}
        </div>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="h-3.5 w-3.5 mr-1 text-mechanica-500" />
          {garage.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src={garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
            alt={garage.name}
            className="h-full w-full object-cover transition-all hover:scale-105"
          />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

const Garages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { fetchGarages, fetchLoading, error, garages } = useGarageManagement();
  const [loadingInitial, setLoadingInitial] = useState(true);
  
  // Fetch garages from Supabase
  useEffect(() => {
    const loadGarages = async () => {
      try {
        await fetchGarages();
      } finally {
        setLoadingInitial(false);
      }
    };
    
    loadGarages();
  }, [fetchGarages]);

  // Filter garages based on search query
  const filteredGarages = garages.filter(garage => {
    if (!searchQuery) return true;
    
    return (
      garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      garage.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (garage.area && garage.area.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Group garages by location
  const garagesByLocation = filteredGarages.reduce((acc, garage) => {
    const location = garage.location;
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(garage as Garage); // Type assertion to fix the compatibility issue
    return acc;
  }, {} as Record<string, Garage[]>);

  // Sort locations alphabetically
  const sortedLocations = Object.keys(garagesByLocation).sort();

  const handleRetry = () => {
    toast.info("Retrying...");
    setLoadingInitial(true);
    fetchGarages();
  };

  // Add a sample garage for testing
  const addSampleGarage = async () => {
    const { addGarage } = useGarageManagement();
    
    try {
      toast.info("Adding a sample garage...");
      
      const sampleGarage = {
        name: "AutoFix Express",
        area: "Dubai Marina",
        location: "Sheikh Zayed Road, Dubai",
        installationFee: "30.00",
        images: "https://images.unsplash.com/photo-1597762117709-859f744b84c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      };
      
      await addGarage(sampleGarage);
      toast.success("Sample garage added! Refreshing list...");
      fetchGarages();
    } catch (err: any) {
      toast.error("Failed to add sample garage");
    }
  };

  const isLoading = loadingInitial || fetchLoading;

  return (
    <>
      {/* Hero Section */}
      <section className="bg-mechanica-50 py-8 md:py-16">
        <div className="container-custom text-center px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Find Trusted Garages</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
            Connect with our network of professional garages and service centers across the UAE
          </p>
          
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input 
                placeholder="Search by location or garage name..." 
                className="bg-white pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Garages Content Section */}
      <section className="py-8 md:py-16">
        <div className="container-custom px-4 md:px-8">
          {/* General Error State */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <div className="mt-2">
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" className="mr-2" />
              <span className="text-lg text-gray-600">Loading garages...</span>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && filteredGarages.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1562519990-50eb51e282b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                  alt="No garages" 
                  className="w-32 h-32 object-cover rounded-full mx-auto opacity-70"
                />
              </div>
              <p className="text-lg text-gray-600 mb-4">
                {garages.length === 0 
                  ? "No garages found in our database yet." 
                  : "No garages found matching your search criteria."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {garages.length > 0 && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                
                {garages.length === 0 && (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={handleRetry}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refresh
                    </Button>
                    
                    <Button 
                      variant="default"
                      onClick={addSampleGarage}
                      className="flex items-center"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Sample Garage
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Garages By Location */}
          {!isLoading && !error && filteredGarages.length > 0 && (
            <div className="space-y-8">
              {sortedLocations.map((location) => (
                <div key={location} className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
                  <h2 className="text-xl md:text-2xl font-bold mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-mechanica-600" />
                    {location}
                    <Badge className="ml-2 bg-mechanica-100 text-mechanica-800">
                      {garagesByLocation[location].length}
                    </Badge>
                  </h2>
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {garagesByLocation[location].map((garage) => (
                      <GarageCard key={garage.id} garage={garage} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Join as Garage CTA */}
          <div className="mt-8 md:mt-16 bg-mechanica-50 rounded-xl p-4 md:p-8 text-center">
            <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Own a Garage? Join Our Network</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto mb-4 md:mb-6">
              Partner with BookMyParts to reach more customers, manage your business digitally, 
              and grow your service revenue.
            </p>
            <Button className="bg-mechanica-600 hover:bg-mechanica-700">
              Register Your Garage
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Garages;
