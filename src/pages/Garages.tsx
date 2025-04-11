
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Star, Users, Wrench, Clock, PhoneCall, Mail, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the type for garage data
interface Garage {
  id: string;
  name: string;
  location: string;
  area: string | null;
  images: string | null;
  // Additional frontend properties (not from database)
  rating?: number;
  reviews?: number;
  services?: string[];
  hours?: string;
  phone?: string;
  email?: string;
}

const Garages = () => {
  const [filterOption, setFilterOption] = useState("all");
  const [garages, setGarages] = useState<Garage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sample services for each garage
  const serviceOptions = [
    ["Oil Change", "Brake Service", "Air Conditioning", "Engine Diagnostics"],
    ["Wheel Alignment", "Battery Service", "Suspension Repair", "Oil Change"],
    ["Engine Repair", "Transmission Service", "Electrical Systems", "Computer Diagnostics"],
    ["Oil Change", "Tire Service", "Brake Repair", "Air Conditioning"]
  ];
  
  // Fetch garages from Supabase
  useEffect(() => {
    const fetchGarages = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('garages')
          .select('*');
          
        if (error) throw error;
        
        // Enhance garages with additional frontend properties
        const enhancedGarages = data.map((garage, index) => ({
          ...garage,
          rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
          reviews: Math.floor(50 + Math.random() * 200), // Random reviews between 50-250
          services: serviceOptions[index % serviceOptions.length],
          hours: "8:00 AM - 6:00 PM",
          phone: "+971 552552476",
          email: `info@${garage.name.toLowerCase().replace(/\s+/g, '')}.com`,
          // Ensure image exists, otherwise use a fallback
          images: garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }));
        
        setGarages(enhancedGarages);
      } catch (error: any) {
        console.error("Error fetching garages:", error.message);
        toast.error("Failed to load garages");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchGarages();
  }, []);

  // Filter and search functionality
  const filteredGarages = garages
    .filter(garage => {
      // First apply service type filter
      if (filterOption !== "all") {
        return garage.services?.some(service => 
          service.toLowerCase().includes(filterOption.toLowerCase())
        );
      }
      return true;
    })
    .filter(garage => {
      // Then apply search query if present
      if (searchQuery) {
        return (
          garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          garage.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          garage.services?.some(service => 
            service.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
      }
      return true;
    });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is already reactive via the filteredGarages computed value
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-mechanica-50 py-8 md:py-24">
        <div className="container-custom text-center px-4 md:px-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">Find Trusted Garages</h1>
          <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 md:mb-8">
            Connect with our network of professional garages and service centers across the UAE
          </p>
          
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <Input 
                placeholder="Search by location or service..." 
                className="bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" className="whitespace-nowrap">
                Find Garages
              </Button>
            </form>
          </div>
        </div>
      </section>
      
      {/* Garage Listings */}
      <section className="py-8 md:py-16">
        <div className="container-custom px-4 md:px-8">
          {/* Filter Options */}
          <div className="mb-6 md:mb-8 overflow-x-auto">
            <div className="flex space-x-2 md:space-x-3 min-w-max pb-2">
              <Button 
                size="sm"
                variant={filterOption === "all" ? "default" : "outline"}
                onClick={() => setFilterOption("all")}
                className="text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                All Garages
              </Button>
              <Button 
                size="sm"
                variant={filterOption === "oil change" ? "default" : "outline"}
                onClick={() => setFilterOption("oil change")}
                className="text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                Oil Change
              </Button>
              <Button 
                size="sm"
                variant={filterOption === "brake" ? "default" : "outline"}
                onClick={() => setFilterOption("brake")}
                className="text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                Brake Service
              </Button>
              <Button 
                size="sm"
                variant={filterOption === "air conditioning" ? "default" : "outline"}
                onClick={() => setFilterOption("air conditioning")}
                className="text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                AC Service
              </Button>
              <Button 
                size="sm"
                variant={filterOption === "engine" ? "default" : "outline"}
                onClick={() => setFilterOption("engine")}
                className="text-xs md:text-sm px-2 md:px-4 h-8 md:h-10"
              >
                Engine Work
              </Button>
            </div>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-mechanica-600 mr-2" />
              <span className="text-lg text-gray-600">Loading garages...</span>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && filteredGarages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">No garages found matching your criteria.</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFilterOption("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
          
          {/* Garage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {filteredGarages.map(garage => (
              <Card key={garage.id} className="overflow-hidden border-none shadow-card hover:shadow-xl transition-shadow">
                <div className="h-40 md:h-48 overflow-hidden">
                  <img 
                    src={garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"} 
                    alt={garage.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback image if the main one fails to load
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                </div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">{garage.name}</h3>
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin size={14} className="mr-1" />
                        <span className="text-sm">{garage.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded">
                      <Star size={14} className="mr-1 fill-current" />
                      <span className="font-medium text-sm">{garage.rating?.toFixed(1)}</span>
                      <span className="text-xs ml-1 text-gray-500">({garage.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="mb-3 md:mb-4">
                    <div className="flex items-start mb-2 md:mb-3">
                      <Wrench size={16} className="text-mechanica-600 mr-2 md:mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Services</h4>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {garage.services?.map((service, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 text-gray-800 text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2 md:mb-3">
                      <Clock size={16} className="text-mechanica-600 mr-2 md:mr-3 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-sm">Working Hours</h4>
                        <p className="text-gray-600 text-xs">{garage.hours}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                    <Button variant="outline" size="sm" className="flex items-center justify-center h-8 md:h-10 text-xs md:text-sm">
                      <PhoneCall size={14} className="mr-1 md:mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center justify-center h-8 md:h-10 text-xs md:text-sm">
                      <Mail size={14} className="mr-1 md:mr-2" />
                      Email
                    </Button>
                  </div>
                  
                  <Button size="sm" className="w-full h-8 md:h-10 text-xs md:text-sm">
                    <Calendar size={14} className="mr-1 md:mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
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
