
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useGarageManagement } from "@/hooks/useGarageManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

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

// Sample services for each garage
const serviceOptions = [
  ["Oil Change", "Brake Service", "Air Conditioning", "Engine Diagnostics"],
  ["Wheel Alignment", "Battery Service", "Suspension Repair", "Oil Change"],
  ["Engine Repair", "Transmission Service", "Electrical Systems", "Computer Diagnostics"],
  ["Oil Change", "Tire Service", "Brake Repair", "Air Conditioning"]
];

const Garages = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { fetchGarages, fetchLoading, error } = useGarageManagement();
  const [loadingInitial, setLoadingInitial] = useState(true);
  const { user } = useAuth();
  
  // Fetch garages from Supabase - now with additional protection against multiple calls
  useEffect(() => {
    let isMounted = true;
    
    const loadGarages = async () => {
      try {
        console.log("Fetching garages from database...");
        const garagesList = await fetchGarages();
        
        if (!isMounted) return;
        
        if (!garagesList || garagesList.length === 0) {
          console.log("No garages found in the database");
          setGarages([]);
          setLoadingInitial(false);
          return;
        }
        
        // Enhance garages with additional frontend properties
        const enhancedGarages = garagesList.map((garage, index) => ({
          ...garage,
          id: garage.id as string,
          rating: 4.5 + (Math.random() * 0.5), // Random rating between 4.5-5.0
          reviews: Math.floor(50 + Math.random() * 200), // Random reviews between 50-250
          services: serviceOptions[index % serviceOptions.length],
          hours: "8:00 AM - 6:00 PM",
          phone: "+971 552552476",
          email: `info@${garage.name.toLowerCase().replace(/\s+/g, '')}.com`,
          // Ensure image exists, otherwise use a fallback
          images: garage.images || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }));
        
        console.log("Enhanced garages:", enhancedGarages);
        setGarages(enhancedGarages);
      } catch (err: any) {
        console.error("Error in loadGarages:", err.message);
        if (isMounted) {
          toast.error("Failed to load garages");
        }
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };
    
    loadGarages();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [fetchGarages]);

  // Search functionality
  const filteredGarages = garages.filter(garage => {
    // Apply search query if present
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

  const handleRetry = () => {
    toast.info("Retrying...");
    setLoadingInitial(true);
    fetchGarages();
  };

  // Simple function to add a sample garage
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
      
      {/* General Content Section */}
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
          
          {/* Empty State - Now with a button to add a sample garage for testing */}
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
                  : "No garages found matching your criteria."}
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
          
          {/* Info message when no specific UI is shown */}
          {!isLoading && filteredGarages.length > 0 && (
            <div className="text-center py-12 bg-green-50 rounded-lg border border-green-100">
              <h2 className="text-xl font-bold text-green-800 mb-2">Garages Found</h2>
              <p className="text-green-700 mb-4">
                {filteredGarages.length} garages available in our database.
              </p>
              <p className="text-sm text-gray-600">
                The garage view section has been removed. Use the search bar above to find specific garages.
              </p>
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
