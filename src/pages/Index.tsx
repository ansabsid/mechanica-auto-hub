
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PartCard } from "@/components/parts/PartCard";
import { useCarParts } from "@/hooks/useCarParts";
import { Part } from "@/hooks/car-parts/types";
import { supabase } from "@/integrations/supabase/client";
import { 
  Settings, 
  CreditCard, 
  Smartphone, 
  Star, 
  ChevronRight, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import Footer from "@/components/layout/Footer";

// Trusted garage logos
const trustedGarages = [
  "AutoCare Dubai",
  "BrakeMax",
  "Emirates Garage",
  "SparkTech Auto",
  "Tire Zone",
  "DXB Car Services",
];

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: "Ahmed Hassan",
    position: "Car Owner",
    content: "BookMyParts made finding parts for my Toyota so much easier. I was able to compare prices and find the best deal without visiting multiple garages."
  },
  {
    id: 2,
    name: "Mohammed Ali",
    position: "Garage Owner",
    content: "Since joining BookMyParts, our garage has seen a 40% increase in parts sales and service bookings. The platform makes inventory management simple."
  },
  {
    id: 3,
    name: "Sara Khan",
    position: "Car Owner",
    content: "I booked a service appointment through BookMyParts and everything was smooth - from selecting available slots to payment. Highly recommended!"
  }
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch featured parts from the database
  useEffect(() => {
    const fetchFeaturedParts = async () => {
      setIsLoading(true);
      try {
        // Get 4 random parts from the database
        const { data, error } = await supabase
          .from('parts')
          .select('*')
          .limit(4);
          
        if (error) throw error;
        
        if (data) {
          // Process the parts data with default garage information
          const processedParts: Part[] = data.map(part => {
            return {
              ...part,
              garages: part.garage_id ? { 
                name: 'AutoCare Dubai',
                location: 'Dubai Marina'
              } : { 
                name: 'BookMyParts Service Center',
                location: 'Dubai, UAE'
              },
              // Add any other required properties
              availableGarages: [
                {
                  id: "g1",
                  name: "BookMyParts Service Center - Dubai Marina",
                  location: "Dubai Marina, Dubai, UAE",
                  installationFee: 25.99,
                  area: "Dubai Marina"
                },
                {
                  id: "g2",
                  name: "BookMyParts Service Center - Downtown",
                  location: "Downtown Dubai, Dubai, UAE",
                  installationFee: 29.99,
                  area: "Downtown Dubai"
                }
              ]
            } as Part;
          });
          
          setFeaturedParts(processedParts);
        }
      } catch (error) {
        console.error("Error fetching featured parts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedParts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Find Car Parts & Book Services <span className="text-blue-600">Easily</span>
              </h1>
              <p className="text-xl text-gray-600">
                Connect with local garages and suppliers to find the right parts
                and book service appointments for your vehicle.
              </p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Smartphone className="mr-2 h-5 w-5" /> Download App
                </Button>
                {!isAuthenticated && (
                  <Link to="/login">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="lg:block hidden">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&auto=format"
                alt="BookMyParts Car Service"
                className="rounded-xl shadow-md object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Parts</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse our selection of top-quality car parts from trusted suppliers and garages
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">Loading featured parts...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredParts.map((part) => (
                <PartCard key={part.id} part={part} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              View All Products <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How BookMyParts Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find parts and book services in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Choose Your Car</h3>
              <p className="text-gray-600">
                Select your car's manufacturer, model, and make year to find compatible parts.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse Parts</h3>
              <p className="text-gray-600">
                Explore a wide range of parts from various garages and suppliers in your area.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Buy</h3>
              <p className="text-gray-600">
                Purchase parts or book service appointments directly through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from car owners and garage operators who use BookMyParts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center mb-4">
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-blue-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.position}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-900">Trusted by Garages Across MENA</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {trustedGarages.map((garage, index) => (
              <div key={index} className="flex items-center">
                <div className="bg-gray-100 px-6 py-3 rounded-lg">
                  <span className="text-gray-700 font-semibold">{garage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Download the BookMyParts App</h2>
              <p className="text-xl mb-6 text-white/90">
                Get the full experience on your smartphone. Find parts, book services, and manage
                your vehicles on the go.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Quick search for parts by vehicle</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Book service appointments</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-6 w-6 mr-3 text-white" />
                  <span>Track orders and service history</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-white text-blue-700 hover:bg-gray-100">
                  Download on App Store
                </Button>
                <Button className="bg-white text-blue-700 hover:bg-gray-100">
                  Get it on Google Play
                </Button>
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&auto=format"
                alt="BookMyParts App"
                className="rounded-xl shadow-lg object-cover w-full"
              />
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default Index;
