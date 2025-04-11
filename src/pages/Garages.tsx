
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  MapPin, 
  Search, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  Calendar 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Garage {
  id: string;
  name: string;
  location: string;
  area: string | null;
  images: string | null;
  rating?: number;
  services?: string[];
  phone?: string;
  email?: string;
  workingHours?: string;
}

const GaragePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [garages, setGarages] = useState<Garage[]>([]);
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState<"name" | "location">("location");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGarages();
  }, []);

  useEffect(() => {
    if (garages.length > 0) {
      const filtered = garages.filter(garage => {
        const searchLower = searchQuery.toLowerCase();
        return (
          garage.name.toLowerCase().includes(searchLower) ||
          garage.location.toLowerCase().includes(searchLower) ||
          (garage.area && garage.area.toLowerCase().includes(searchLower))
        );
      });

      const sorted = [...filtered].sort((a, b) => {
        if (sort === "name") {
          return a.name.localeCompare(b.name);
        } else {
          return a.location.localeCompare(b.location);
        }
      });

      setFilteredGarages(sorted);
    }
  }, [searchQuery, garages, sort]);

  const fetchGarages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('garages')
        .select('*');
        
      if (fetchError) {
        throw fetchError;
      }
      
      if (!data || data.length === 0) {
        setGarages([]);
        setFilteredGarages([]);
        setLoading(false);
        return;
      }
      
      // Mock additional data for our new approach
      const enhancedGarages = data.map(garage => ({
        ...garage,
        rating: Math.floor(Math.random() * 5) + 1,
        services: ["Oil Change", "Brake Repair", "Engine Diagnostics", "Tire Replacement"].slice(0, Math.floor(Math.random() * 4) + 1),
        phone: "+971 5" + Math.floor(Math.random() * 10000000).toString().padStart(8, '0'),
        email: `contact@${garage.name.toLowerCase().replace(/\s+/g, '')}.com`,
        workingHours: "8:00 AM - 6:00 PM"
      }));
      
      setGarages(enhancedGarages);
      setFilteredGarages(enhancedGarages);
    } catch (error: any) {
      console.error("Error fetching garages:", error.message);
      setError(error.message);
      toast.error("Failed to load garages");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    toast.info("Retrying...");
    fetchGarages();
  };

  const GarageListItem = ({ garage }: { garage: Garage }) => (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        <div className="relative md:w-1/4 aspect-video md:aspect-square overflow-hidden rounded-t-lg md:rounded-l-lg md:rounded-tr-none">
          <img
            src={garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
            alt={garage.name}
            className="h-full w-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
            {garage.rating} <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
          </Badge>
        </div>
        <div className="flex-1 p-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-xl font-bold">{garage.name}</h3>
              <p className="flex items-center text-sm text-gray-500 mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" /> {garage.location}
                {garage.area && ` (${garage.area})`}
              </p>
            </div>
            <div className="mt-2 md:mt-0 flex flex-col items-start md:items-end text-sm">
              <p className="flex items-center text-gray-600">
                <Phone className="h-3.5 w-3.5 mr-1" /> {garage.phone}
              </p>
              <p className="flex items-center text-gray-600 mt-1">
                <Mail className="h-3.5 w-3.5 mr-1" /> {garage.email}
              </p>
              <p className="flex items-center text-gray-600 mt-1">
                <Clock className="h-3.5 w-3.5 mr-1" /> {garage.workingHours}
              </p>
            </div>
          </div>
          
          <Separator className="my-3" />
          
          <div className="mt-2">
            <p className="text-sm font-medium mb-1">Services:</p>
            <div className="flex flex-wrap gap-1">
              {garage.services?.map((service, index) => (
                <Badge key={index} variant="outline" className="bg-gray-100">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" className="bg-mechanica-600">
              Book Service
            </Button>
            <Button size="sm" variant="outline">
              View Details
            </Button>
            <Button size="sm" variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> Check Availability
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const GarageGridItem = ({ garage }: { garage: Garage }) => (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <div className="relative aspect-video overflow-hidden rounded-t-lg">
        <img
          src={garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
          alt={garage.name}
          className="h-full w-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800">
          {garage.rating} <Star className="h-3 w-3 ml-1 fill-yellow-500 text-yellow-500" />
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{garage.name}</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1 text-mechanica-500" />
          {garage.location}
          {garage.area && ` (${garage.area})`}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2 pt-0 flex-grow">
        <div className="flex flex-wrap gap-1 mb-3">
          {garage.services?.slice(0, 2).map((service, index) => (
            <Badge key={index} variant="outline" className="bg-gray-100">
              {service}
            </Badge>
          ))}
          {(garage.services?.length || 0) > 2 && (
            <Badge variant="outline" className="bg-gray-100">
              +{(garage.services?.length || 0) - 2} more
            </Badge>
          )}
        </div>
        <div className="text-sm space-y-1 text-gray-600">
          <p className="flex items-center">
            <Phone className="h-3.5 w-3.5 mr-1" /> {garage.phone}
          </p>
          <p className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" /> {garage.workingHours}
          </p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button size="sm" className="w-full bg-mechanica-600">
          Book Service
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
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="md" className="mr-2" />
            <span className="text-lg text-gray-600">Loading garages...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div className="mb-4 sm:mb-0">
                <p className="text-gray-600">
                  Showing <span className="font-medium">{filteredGarages.length}</span> garages
                  {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
                </p>
              </div>
              
              <div className="flex gap-2">
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    className={`px-3 py-1 text-sm ${sort === "location" ? "bg-mechanica-100 text-mechanica-800" : "bg-white"}`}
                    onClick={() => setSort("location")}
                  >
                    Sort by Location
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${sort === "name" ? "bg-mechanica-100 text-mechanica-800" : "bg-white"}`}
                    onClick={() => setSort("name")}
                  >
                    Sort by Name
                  </button>
                </div>
                
                <div className="flex border rounded-md overflow-hidden">
                  <button
                    className={`px-3 py-1 text-sm ${view === "grid" ? "bg-mechanica-100 text-mechanica-800" : "bg-white"}`}
                    onClick={() => setView("grid")}
                  >
                    Grid
                  </button>
                  <button
                    className={`px-3 py-1 text-sm ${view === "list" ? "bg-mechanica-100 text-mechanica-800" : "bg-white"}`}
                    onClick={() => setView("list")}
                  >
                    List
                  </button>
                </div>
              </div>
            </div>

            {filteredGarages.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <Building2 className="w-16 h-16 mx-auto text-gray-400" />
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  No garages found matching your search criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </div>
            ) : view === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGarages.map((garage) => (
                  <GarageGridItem key={garage.id} garage={garage} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGarages.map((garage) => (
                  <GarageListItem key={garage.id} garage={garage} />
                ))}
              </div>
            )}
          </>
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
