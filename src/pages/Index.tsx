import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  Lightbulb,
  Wrench,
  HeartHandshake,
  BarChart3,
  Users,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Search
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Footer from "@/components/layout/Footer";
import ComingSoonDialog from "@/components/ui/coming-soon-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { motion } from "framer-motion";

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

// Market problems data
const customerProblems = [
  {
    icon: <ShoppingBag className="h-5 w-5 text-red-500" />,
    title: "Parts Availability Crisis",
    description: "Difficulty finding OEM, aftermarket, or used parts causing service delays"
  },
  {
    icon: <HeartHandshake className="h-5 w-5 text-red-500" />,
    title: "Trust Issues",
    description: "Finding trustworthy mechanics with the right expertise is challenging"
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-red-500" />,
    title: "Lack of Transparency",
    description: "No clarity in parts pricing and service quality"
  }
];

const garageProblems = [
  {
    icon: <Search className="h-5 w-5 text-green-500" />,
    title: "Digital Presence Gaps",
    description: "Lack of user-friendly platforms to showcase expertise and attract customers"
  },
  {
    icon: <CalendarDays className="h-5 w-5 text-green-500" />,
    title: "Operational Inefficiencies",
    description: "Difficulties managing appointments without a centralized booking system"
  },
  {
    icon: <Users className="h-5 w-5 text-green-500" />,
    title: "B2B Connectivity Limits",
    description: "Limited access to broader networks of service partnerships"
  }
];

// Solution features data
const solutionFeatures = [
  {
    icon: <Lightbulb className="h-6 w-6 text-blue-600" />,
    title: "All-in-One Platform",
    description: "Parts, service requests, and installations in one place"
  },
  {
    icon: <Users className="h-6 w-6 text-blue-600" />,
    title: "Nearby Garages",
    description: "Schedule appointments with local trusted mechanics"
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
    title: "Transparent Pricing",
    description: "Compare prices and read real reviews"
  },
  {
    icon: <MapPin className="h-6 w-6 text-blue-600" />,
    title: "Convenient Location",
    description: "Find services near you with easy navigation"
  }
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");
  
  // Fetch featured parts from the database with real garage data
  useEffect(() => {
    const fetchFeaturedParts = async () => {
      setIsLoading(true);
      try {
        // Get 4 random parts from the database
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')
          .limit(4);
          
        if (partsError) throw partsError;
        
        if (partsData && partsData.length > 0) {
          // Get all part IDs to fetch their associated garages
          const partIds = partsData.map(part => part.id);
          
          // Fetch garages for all parts using the bulk function
          const { data: garageData, error: garageError } = await supabase
            .rpc('get_garages_for_part_bulk', { part_ids: partIds });
            
          if (garageError) {
            console.error("Error fetching garage data:", garageError);
          }
          
          // Process the parts data with real garage information
          const processedParts: Part[] = partsData.map(part => {
            // Find all garages for this part
            const partGarages = garageData ? garageData.filter(g => g.part_id === part.id) : [];
            
            // Default garage if none found
            const mainGarage = partGarages.length > 0 ? 
              { 
                name: partGarages[0].name,
                location: partGarages[0].location
              } : 
              { 
                name: 'BookMyParts Service Center',
                location: 'Dubai, UAE'
              };
              
            // Format all available garages for this part
            const availableGaragesList = partGarages.map(garage => ({
              id: garage.id,
              name: garage.name,
              location: garage.location,
              installationFee: Number(garage.installation_fee),
              area: garage.location.split(',')[0].trim() // Extract area from location
            }));
            
            // If no garages found through association, check if part has a direct garage_id
            if (part.garage_id && availableGaragesList.length === 0) {
              // Fetch this specific garage
              supabase
                .from('garages')
                .select('*')
                .eq('id', part.garage_id)
                .single()
                .then(({ data: directGarage, error: directError }) => {
                  if (!directError && directGarage) {
                    availableGaragesList.push({
                      id: directGarage.id,
                      name: directGarage.name,
                      location: directGarage.location,
                      installationFee: 25.99, // Default installation fee
                      area: directGarage.area || directGarage.location.split(',')[0].trim()
                    });
                  }
                });
            }
            
            // Ensure we always have some available garages for installation
            const finalAvailableGarages = availableGaragesList.length > 0 
              ? availableGaragesList 
              : [
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
              ];
              
            return {
              ...part,
              garages: mainGarage,
              availableGarages: finalAvailableGarages
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

  const handleAppDownloadClick = () => {
    setIsComingSoonOpen(true);
  };

  return (
    <>
      {/* Enhanced Hero Section - Appeals to both customers and garages */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-white py-12 md:py-24 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col space-y-5">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium mb-1">
                <span className="animate-pulse mr-2">●</span> Revolutionizing Auto Parts & Services
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Connect With <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Parts & Garages</span> In One Place
              </h1>
              
              <p className="text-xl text-gray-600">
                No more fragmented market. Find quality parts and trusted garages for all your vehicle needs.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-2 md:flex md:space-x-3 md:space-y-0">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
                  onClick={handleAppDownloadClick}
                >
                  <Smartphone className="mr-2 h-5 w-5" /> Get The App
                </Button>
                
                {!isAuthenticated ? (
                  <Link to="/login" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                      Login / Sign Up
                    </Button>
                  </Link>
                ) : (
                  <Link to="/customer-dashboard" className="w-full md:w-auto">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="flex items-center space-x-2 pt-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(num => (
                    <div key={num} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-700">
                      {num}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-blue-700">1,000+</span> users joined this month
                </p>
              </div>
            </div>
            
            <div className="relative lg:block hidden">
              {/* Main feature card with transparent prices tag */}
              <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 transform rotate-1 relative z-20">
                <div className="absolute -top-3 -right-3 bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-xs font-medium z-30">
                  Transparent prices
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {solutionFeatures.slice(0, 4).map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="bg-blue-100 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-3">
                        {feature.icon}
                      </div>
                      <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                      <p className="text-xs text-gray-500">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* "Ready to join?" card positioned behind the main card */}
              <div className="absolute -bottom-5 -left-5 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg p-4 transform -rotate-3 z-10">
                <div className="font-medium text-sm mb-2 text-blue-800">Ready to join?</div>
                <div className="flex space-x-2">
                  <div className="bg-white px-3 py-2 rounded text-xs">Customers</div>
                  <div className="bg-blue-600 text-white px-3 py-2 rounded text-xs">Garages</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-100/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-t from-blue-100/20 to-transparent"></div>
      </section>

      {/* Market Problems & Our Solution Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">The Problems We Solve</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BookMyParts addresses critical challenges faced by both vehicle owners and garages in the auto parts and service market
            </p>
          </div>
          
          <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="customer" className="text-sm md:text-base py-2">
                  Vehicle Owners
                </TabsTrigger>
                <TabsTrigger value="garage" className="text-sm md:text-base py-2">
                  Garage Businesses
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="customer" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {customerProblems.map((problem, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border border-red-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: activeTab === "customer" ? 1 : 0,
                      y: activeTab === "customer" ? 0 : 20,
                    }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="bg-red-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      {problem.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="garage" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {garageProblems.map((problem, index) => (
                  <motion.div
                    key={index}
                    className="bg-white border border-green-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: activeTab === "garage" ? 1 : 0,
                      y: activeTab === "garage" ? 0 : 20,
                    }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                      {problem.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
                    <p className="text-gray-600">{problem.description}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Solution</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-10">
              An all-in-one platform that connects vehicle owners with parts and trusted garages
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutionFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-blue-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <div className="bg-white w-16 h-16 rounded-full shadow-sm flex items-center justify-center mb-4 mx-auto">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-center">{feature.title}</h3>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </motion.div>
              ))}
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
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-600">Loading featured parts...</span>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How BookMyParts Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find parts and book services in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Search For Parts</h3>
              <p className="text-gray-600">
                Find the exact parts you need by vehicle make, model, or by scanning your existing part
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect With Garages</h3>
              <p className="text-gray-600">
                Choose from nearby trusted garages with transparent pricing and reviews
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
              <div className="bg-blue-100 p-4 rounded-full mb-6">
                <CalendarDays className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Book & Complete</h3>
              <p className="text-gray-600">
                Schedule appointments, purchase parts, and track your service history all in one place
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
                <Button 
                  className="bg-white text-blue-700 hover:bg-gray-100"
                  onClick={handleAppDownloadClick}
                >
                  Download on App Store
                </Button>
                <Button 
                  className="bg-white text-blue-700 hover:bg-gray-100"
                  onClick={handleAppDownloadClick}
                >
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
      
      {/* Coming Soon Dialog */}
      <ComingSoonDialog 
        open={isComingSoonOpen}
        onOpenChange={setIsComingSoonOpen}
      />
    </>
  );
};

export default Index;
