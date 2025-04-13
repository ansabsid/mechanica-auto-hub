import React, { useEffect, useState, useRef } from "react";
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
  Search,
  Sparkles,
  ArrowRight,
  Car,
  Wrench as ToolIcon,
  Clock,
  Shield,
  CircleCheck,
  CheckSquare,
  CreditCard as PaymentIcon
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

const trustedGarages = [
  "AutoCare Dubai",
  "BrakeMax",
  "Emirates Garage",
  "SparkTech Auto",
  "Tire Zone",
  "DXB Car Services",
];

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

const heroBenefits = [
  {
    icon: <Car className="h-5 w-5" />,
    title: "Find Any Part",
    description: "Search our extensive catalog of OEM and aftermarket parts"
  },
  {
    icon: <ToolIcon className="h-5 w-5" />,
    title: "Book Expert Service",
    description: "Connect with verified mechanics in your area"
  },
  {
    icon: <Clock className="h-5 w-5" />,
    title: "Save Time",
    description: "Complete the entire process in minutes, not hours"
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Quality Guaranteed",
    description: "All parts and services backed by our satisfaction guarantee"
  }
];

const customerJourneySteps = [
  {
    icon: <Car className="h-8 w-8 text-blue-600" />,
    title: "Enter Vehicle Details",
    description: "Select your car make, model, and year to find compatible parts",
    step: 1,
    benefit: "Ensures perfect fitment and compatibility for your specific vehicle"
  },
  {
    icon: <Search className="h-8 w-8 text-blue-600" />,
    title: "Scan or Search for Parts",
    description: "Use our scanning feature or search for the exact part you need",
    step: 2,
    benefit: "AI-powered part recognition gives you accurate results in seconds"
  },
  {
    icon: <CheckSquare className="h-8 w-8 text-blue-600" />,
    title: "Compare Options",
    description: "View pricing, availability, and reviews for parts from multiple suppliers",
    step: 3,
    benefit: "Get the best value with side-by-side comparisons of quality and price"
  },
  {
    icon: <ShoppingBag className="h-8 w-8 text-blue-600" />,
    title: "Purchase Parts",
    description: "Order the part directly through our secure marketplace",
    step: 4,
    benefit: "Secure payment with buyer protection and order tracking"
  },
  {
    icon: <MapPin className="h-8 w-8 text-blue-600" />,
    title: "Select a Garage",
    description: "Choose from nearby verified garages for installation",
    step: 5,
    benefit: "Access our network of 100+ trusted mechanics with verified reviews"
  },
  {
    icon: <CalendarDays className="h-8 w-8 text-blue-600" />,
    title: "Book Appointment",
    description: "Schedule a convenient time for your service",
    step: 6,
    benefit: "Real-time availability with instant confirmation"
  },
  {
    icon: <PaymentIcon className="h-8 w-8 text-blue-600" />,
    title: "Pay Securely",
    description: "Complete your transaction with our secure payment system",
    step: 7,
    benefit: "Transparent pricing with no hidden fees or surprise charges"
  },
  {
    icon: <Star className="h-8 w-8 text-blue-600" />,
    title: "Rate & Review",
    description: "Share your experience to help other car owners",
    step: 8,
    benefit: "Help build our community of trusted service providers"
  }
];

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [featuredParts, setFeaturedParts] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("customer");
  
  useEffect(() => {
    const fetchFeaturedParts = async () => {
      setIsLoading(true);
      try {
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select('*')
          .limit(4);
          
        if (partsError) throw partsError;
        
        if (partsData && partsData.length > 0) {
          const partIds = partsData.map(part => part.id);
          
          const { data: garageData, error: garageError } = await supabase
            .rpc('get_garages_for_part_bulk', { part_ids: partIds });
            
          if (garageError) {
            console.error("Error fetching garage data:", garageError);
          }
          
          const processedParts: Part[] = partsData.map(part => {
            const partGarages = garageData ? garageData.filter(g => g.part_id === part.id) : [];
            
            const mainGarage = partGarages.length > 0 ? 
              { 
                name: partGarages[0].name,
                location: partGarages[0].location
              } : 
              { 
                name: 'BookMyParts Service Center',
                location: 'Dubai, UAE'
              };
              
            const availableGaragesList = partGarages.map(garage => ({
              id: garage.id,
              name: garage.name,
              location: garage.location,
              installationFee: Number(garage.installation_fee),
              area: garage.location.split(',')[0].trim()
            }));
            
            if (part.garage_id && availableGaragesList.length === 0) {
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
                      installationFee: 25.99,
                      area: directGarage.area || directGarage.location.split(',')[0].trim()
                    });
                  }
                });
            }
            
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-blue-500/10 rounded-full" />
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] border border-blue-400/10 rounded-full" />
          <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[400px] h-[400px] border border-blue-300/10 rounded-full" />
          
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 16px 16px, rgba(255,255,255,0.1) 2px, transparent 0)',
              backgroundSize: '48px 48px'
            }}
          />
          
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-400 rounded-full opacity-20 blur-[100px]" />
          <div className="absolute -bottom-40 -right-20 w-96 h-96 bg-indigo-400 rounded-full opacity-20 blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-sky-300 rounded-full opacity-10 blur-[80px]" />
        </div>
        
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-x-12 gap-y-16">
            <div className="w-full lg:w-6/12 text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-blue-800/50 border border-blue-700/50 backdrop-blur-sm mb-6"
              >
                <span className="text-blue-200 font-medium text-sm">The Future of Auto Parts & Services</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
              >
                Find <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Auto Parts</span> & Connect with <span className="bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300 bg-clip-text text-transparent">Garages</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Your one-stop marketplace for quality parts and trusted installation services. Save time and money with transparent pricing and verified mechanics.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-8 py-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all"
                  onClick={handleAppDownloadClick}
                >
                  <Smartphone className="mr-2 h-5 w-5" /> 
                  Get The App
                </Button>
                
                {!isAuthenticated ? (
                  <Link to="/register">
                    <Button variant="outline" className="border-2 border-blue-400/30 bg-blue-900/30 backdrop-blur-sm text-white hover:bg-blue-800/50 font-medium px-8 py-6 rounded-xl transition-all">
                      Start Your Journey Today
                    </Button>
                  </Link>
                ) : (
                  <Link to="/customer-dashboard">
                    <Button variant="outline" className="border-2 border-blue-400/30 bg-blue-900/30 backdrop-blur-sm text-white hover:bg-blue-800/50 font-medium px-8 py-6 rounded-xl transition-all">
                      Dashboard
                    </Button>
                  </Link>
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center justify-center lg:justify-start"
              >
                <div className="flex -space-x-3 mr-4">
                  {[1, 2, 3, 4].map(num => (
                    <div 
                      key={num} 
                      className="w-10 h-10 rounded-full border-2 border-blue-800 flex items-center justify-center text-xs font-semibold text-white"
                      style={{ 
                        background: `linear-gradient(135deg, rgba(59, 130, 246, 0.${num * 2}) 0%, rgba(99, 102, 241, 0.${num * 2 + 1}) 100%)`,
                        zIndex: 5 - num
                      }}
                    >
                      {num}
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-blue-100">
                  <span className="font-bold text-white">1,000+</span> users joined this month
                </p>
              </motion.div>
            </div>
            
            <div className="w-full lg:w-6/12">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative z-10"
                >
                  <img 
                    src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1074&auto=format&fit=crop" 
                    alt="Auto parts and services" 
                    className="rounded-2xl shadow-2xl shadow-blue-900/50 w-full object-cover max-h-[500px]"
                  />
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="absolute -bottom-6 -right-6 md:-right-10 bg-white rounded-xl p-4 shadow-xl w-60 md:w-72"
                  >
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <CircleCheck className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Order Confirmed</h4>
                        <p className="text-sm text-gray-500">Toyota Camry Brake Pads</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Delivery</span>
                      <span>Tomorrow, 10am-2pm</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="absolute -top-6 -left-6 md:-left-10 bg-white rounded-xl p-4 shadow-xl w-60 md:w-64"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        AW
                      </div>
                      <div>
                        <h4 className="font-medium">AutoWorks Dubai</h4>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      "Great service, on-time and professional!"
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 md:mt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {heroBenefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-blue-800/30 backdrop-blur-sm border border-blue-700/50 rounded-xl p-6 hover:bg-blue-800/40 transition-all"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-blue-100">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L80,144C160,128,320,96,480,96C640,96,800,128,960,138.7C1120,149,1280,139,1360,133.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>
      </section>

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

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The BookMyParts Customer Journey</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              From finding the right part to getting it installed, our streamlined process saves you time and money
            </p>
          </div>

          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-200 -translate-x-1/2 z-0"></div>
              
              <div className="space-y-16">
                {customerJourneySteps.map((step, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-10' : 'text-left pl-10'}`}>
                      <motion.div
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-gray-600 mb-4">{step.description}</p>
                        <div className="text-sm text-blue-600 font-medium">
                          <span className="inline-flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> {step.benefit}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                    
                    <div className="relative z-10">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-16 h-16 rounded-full bg-white border-4 border-blue-200 flex items-center justify-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          {step.icon}
                        </div>
                      </motion.div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-800 font-bold">
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="w-5/12"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="md:hidden">
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-1 bg-blue-200 z-0"></div>
              
              <div className="space-y-12">
                {customerJourneySteps.map((step, index) => (
                  <div key={index} className="flex">
                    <div className="relative z-10 mr-6">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-full bg-white border-4 border-blue-200 flex items-center justify-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          {step.icon}
                        </div>
                      </motion.div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-800 font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{step.title}</h3>
                        <p className="text-gray-600 mb-2 text-sm">{step.description}</p>
                        <div className="text-xs text-blue-600 font-medium">
                          <span className="inline-flex items-center">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> {step.benefit}
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link to="/register">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-6 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all">
                Start Your Journey Today <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">Get the BookMyParts App</h2>
              <p className="text-blue-100 max-w-md">
                Manage your vehicles, order parts, and book services directly from your phone.
              </p>
            </div>
            <Button 
              className="bg-white text-blue-900 hover:bg-blue-50 font-medium px-6 py-5 rounded-xl transition-all"
              onClick={handleAppDownloadClick}
            >
              <Smartphone className="mr-2 h-5 w-5" /> Download Now
            </Button>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={isComingSoonOpen} 
        onOpenChange={setIsComingSoonOpen}
        title="Mobile App Coming Soon"
        description="Our mobile app is currently in development. Sign up to be notified when it launches!"
      />
    </>
  );
};

export default Index;
