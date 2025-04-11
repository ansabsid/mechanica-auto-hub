
import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Search, 
  X, 
  Building2,
  Calendar,
  DollarSign,
  Grid,
  List
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGarageManagement, GarageInfo } from "@/hooks/useGarageManagement";
import GarageTable from "@/components/garage/GarageTable";
import { useNavigate } from "react-router-dom";

interface Garage {
  id: string;
  name: string;
  area: string | null;
  location: string;
  images?: string | null;
  installationFee?: number | null;
}

const GaragePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");
  const navigate = useNavigate();
  
  const { 
    garages, 
    fetchLoading: loading, 
    error, 
    fetchGarages, 
    seedSampleGarages,
    isLoading 
  } = useGarageManagement();

  useEffect(() => {
    console.log("GaragePage component mounted, fetching garages...");
    fetchGarages();
  }, []);

  useEffect(() => {
    console.log("Garages or search query changed, filtering garages...", { garagesCount: garages.length, searchQuery });
    
    if (garages.length > 0) {
      const filtered = garages.filter(garage => {
        const searchLower = searchQuery.toLowerCase();
        return (
          garage.name.toLowerCase().includes(searchLower) ||
          garage.location.toLowerCase().includes(searchLower) ||
          (garage.area && garage.area.toLowerCase().includes(searchLower))
        );
      });

      console.log(`Filtered ${garages.length} garages to ${filtered.length} based on search: "${searchQuery}"`);
      setFilteredGarages(filtered);
    } else {
      console.log("No garages to filter, setting empty array");
      setFilteredGarages([]);
    }
  }, [searchQuery, garages]);

  const handleRetry = () => {
    toast.info("Retrying...");
    fetchGarages();
  };

  const handleBookAppointment = (garageId: string, garageName: string) => {
    console.log(`Booking appointment for garage: ${garageId}`);
    navigate(`/book-appointment/${garageId}`, { 
      state: { 
        garageName,
        garageId 
      } 
    });
  };

  const handleSeedSampleGarages = async () => {
    console.log("User clicked Add Sample Garages button");
    await seedSampleGarages();
  };

  const toggleView = () => {
    setView(prev => prev === "grid" ? "list" : "grid");
  };

  const GarageCard = ({ garage }: { garage: Garage }) => (
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

  return (
    <>
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
      
      <section className="py-8 md:py-16 container-custom px-4 md:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            <p className="font-medium">Error: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">
              {loading ? (
                <span className="flex items-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Fetching garages...
                </span>
              ) : (
                <>
                  Showing <span className="font-medium">{filteredGarages.length}</span> garages
                  {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
                </>
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={toggleView}
              className="text-gray-600 border-gray-200"
            >
              {view === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="md" className="mr-2" />
            <span className="text-lg text-gray-600">Loading garages...</span>
          </div>
        ) : filteredGarages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-4">
              <Building2 className="w-16 h-16 mx-auto text-gray-400" />
            </div>
            <p className="text-lg text-gray-600 mb-4">
              {loading ? "Loading garages..." : "No garages found matching your search criteria."}
            </p>
            {!loading && searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
                className="mb-4"
              >
                Clear Search
              </Button>
            )}
            {!loading && garages.length === 0 && (
              <div className="mt-4">
                <p className="text-gray-600 mb-4">Would you like to add some sample garages for testing?</p>
                <Button 
                  onClick={handleSeedSampleGarages}
                  className="bg-mechanica-600 flex items-center mx-auto"
                  disabled={isLoading}
                >
                  {isLoading ? "Adding Sample Data..." : "Add Sample Garages"}
                </Button>
              </div>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGarages.map((garage) => (
              <GarageCard key={garage.id} garage={garage} />
            ))}
          </div>
        ) : (
          <GarageTable garages={filteredGarages} loading={loading} />
        )}
        
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
      </section>
    </>
  );
};

export default GaragePage;
