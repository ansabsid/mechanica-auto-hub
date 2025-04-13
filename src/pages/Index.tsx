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
  ArrowRight
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
import { motion, useScroll, useTransform, useMotionValue, MotionValue } from "framer-motion";

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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  
  // Create motion values for mouse movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Track mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (heroRef.current) {
        const { clientX, clientY } = e;
        const rect = heroRef.current.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
        
        // Update motion values
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
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
      {/* Modern Glassmorphism Hero Section with Animated Elements */}
      <section 
        ref={heroRef} 
        className="relative min-h-[100vh] flex items-center overflow-hidden"
      >
        {/* Background base */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-blue-50 to-white z-0"/>
        
        {/* Animated 3D Grid */}
        <div className="absolute inset-0 z-10">
          <div 
            className="h-full w-full"
            style={{
              backgroundImage: `
                linear-gradient(rgba(79, 172, 254, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(79, 172, 254, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${-mousePosition.x * 5}deg) scale3d(1.1, 1.1, 1.1)`,
              transition: 'transform 0.2s ease-out'
            }}
          />
        </div>
        
        {/* Animated blobs */}
        <motion.div 
          className="absolute top-[15%] right-[15%] w-64 h-64 rounded-full opacity-40 animate-morph"
          style={{ 
            background: 'linear-gradient(225deg, #4facfe 0%, #00f2fe 100%)',
            filter: 'blur(30px)',
            zIndex: 1,
            x: useTransform(mouseX, [0, 1], [-20, 20]),
            y: useTransform(mouseY, [0, 1], [-20, 20]),
          }}
        />
        
        <motion.div 
          className="absolute bottom-[20%] left-[10%] w-80 h-80 rounded-full opacity-30 animate-morph"
          style={{ 
            background: 'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
            filter: 'blur(60px)',
            zIndex: 1,
            x: useTransform(mouseX, [0, 1], [30, -30]),
            y: useTransform(mouseY, [0, 1], [30, -30]),
            animationDelay: '2s'
          }}
        />
        
        <motion.div 
          className="absolute top-[40%] left-[25%] w-48 h-48 rounded-full opacity-30 animate-morph"
          style={{ 
            background: 'linear-gradient(45deg, rgba(66, 153, 225, 0.8) 0%, rgba(148, 216, 255, 0.8) 100%)',
            filter: 'blur(40px)',
            zIndex: 1,
            x: useTransform(mouseX, [0, 1], [-20, 20]),
            y: useTransform(mouseY, [0, 1], [-10, 10]),
            animationDelay: '4s'
          }}
        />
        
        {/* Content container */}
        <div className="container mx-auto px-4 relative z-20">
          <motion.div 
            style={{ y, opacity }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            {/* Text content - wider column on desktop */}
            <div className="lg:col-span-6 flex flex-col space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 backdrop-blur-sm border border-blue-200/50 shadow-sm"
              >
                <span className="text-blue-600 mr-2">
                  <Sparkles size={16} className="animate-pulse" />
                </span> 
                <span className="text-blue-800 text-sm font-medium tracking-wide">Revolutionizing Auto Parts & Services</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-5xl md:text-6xl font-bold leading-tight tracking-tight"
              >
                <span className="block">Connect With</span>
                <span className="relative inline-block mb-2">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                    Parts & Garages
                  </span>
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-full h-1.5 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                  />
                </span>
                <span className="block md:mt-1">In One Place</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-gray-600 max-w-xl leading-relaxed"
              >
                Find quality parts and trusted garages for all your vehicle needs in a unified marketplace built for the future.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-5 pt-4"
              >
                <Button 
                  className="relative overflow-hidden group bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium px-7 py-6 rounded-2xl shadow-lg hover:shadow-blue-300/30 transition-all"
                  onClick={handleAppDownloadClick}
                >
                  <span className="relative z-10 flex items-center">
                    <Smartphone className="mr-2 h-5 w-5" /> 
                    <span>Get The App</span>
                    <motion.span
                      initial={{ x: 0, opacity: 0.5 }}
                      animate={{ x: [0, 5, 0], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="ml-1.5"
                    >
                      <ArrowRight size={16} />
                    </motion.span>
                  </span>
                  
                  {/* Button hover effect */}
                  <span className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                </Button>
                
                {!isAuthenticated ? (
                  <Link to="/login" className="sm:ml-2">
                    <Button variant="outline" className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm text-blue-700 hover:bg-blue-50 font-medium px-7 py-6 rounded-2xl transition-all w-full sm:w-auto hover:shadow-md">
                      <span>Login / Sign Up</span>
                    </Button>
                  </Link>
                ) : (
                  <Link to="/customer-dashboard" className="sm:ml-2">
                    <Button variant="outline" className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm text-blue-700 hover:bg-blue-50 font-medium px-7 py-6 rounded-2xl transition-all w-full sm:w-auto hover:shadow-md">
                      <span>Dashboard</span>
                    </Button>
                  </Link>
                )}
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-center space-x-3 pt-2"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(num => (
                    <motion.div 
                      key={num} 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-blue-700 border-2 border-white shadow-md"
                      style={{ 
                        background: `linear-gradient(135deg, #EEF2FF ${num * 10}%, #DBEAFE ${num * 25}%)`,
                        zIndex: 5 - num
                      }}
                      whileHover={{ y: -5, scale: 1.1, transition: { duration: 0.2 } }}
                    >
                      {num}
                    </motion.div>
                  ))}
                </div>
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700">
                    <span className="font-bold text-blue-700">1,000+</span> users joined this month
                  </p>
                  <motion.div
                    className="absolute -right-2 -top-2 w-2.5 h-2.5 rounded-full bg-blue-500"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                </div>
              </motion.div>
            </div>
            
            {/* Interactive 3D Feature showcase - narrower column on desktop */}
            <div className="lg:col-span-6 hidden lg:block perspective-1000">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="relative"
                style={{
                  transform: `rotateY(${mousePosition.x * 10 - 5}deg) rotateX(${-mousePosition.y * 10 + 5}deg)`,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.2s ease-out"
                }}
              >
                {/* Main glass card */}
                <div className="relative z-20 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/40 shadow-glass p-8 hover:shadow-lg transition-all duration-300">
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 rounded-full text-white text-xs font-semibold z-30 shadow-md">
                    Transparent pricing
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {solutionFeatures.slice(0, 4).map((feature, index) => (
                      <motion.div 
                        key={index}
                        className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm p-5 rounded-2xl border border-blue-100/30 shadow-sm hover:shadow-md hover:translate-y-[-5px] transition-all duration-300 group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                        whileHover={{ 
                          y: -5, 
                          transition: { duration: 0.2 } 
                        }}
                        style={{ 
                          transformStyle: "preserve-3d",
                          transform: `translateZ(${10 + index * 5}px)` 
                        }}
                      >
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-100/70 p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                          <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                            {feature.icon}
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                  <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-br from-transparent via-transparent to-blue-50/50 pointer-events-none rounded-3xl" />
                </div>
                
                {/* Floating card 1 */}
                <div 
                  className="absolute -bottom-14 -right-5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 z-10 text-white shadow-lg transform rotate-3 w-64"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(-30px) rotate(3deg)",
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold">Service Appointment</h4>
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  </div>
                  <div className="text-sm text-white/90 mb-2">
                    <p>Toyota Camry • Oil Change</p>
                    <p>Tomorrow at 10:00 AM</p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-md">Confirmed</span>
                    <span className="text-sm font-medium">$49.99</span>
                  </div>
                </div>
                
                {/* Floating card 2 */}
                <div 
                  className="absolute -top-10 -left-8 bg-white/80 backdrop-blur-md rounded-2xl p-5 z-10 shadow-glass transform -rotate-6 w-56 border border-white/40"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(-20px) rotate(-6deg)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xs font-semibold">BP</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">BookMyParts</h4>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Your order has been confirmed and will be shipped tomorrow!</p>
                </div>
                
                {/* Floating badges */}
                <motion.div 
                  className="absolute -top-5 right-10 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full text-emerald-800 text-xs font-medium shadow-sm z-30"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(30px)",
                  }}
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut"
                  }}
                >
                  <div className="flex items-center">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                    <span>Easy to use</span>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-4 -left-6 bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-2 rounded-full text-amber-800 text-xs font-medium shadow-sm z-30"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: "translateZ(40px) rotate(-5deg)",
                  }}
                  animate={{ 
                    y: [0, 8, 0],
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <div className="flex items-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                    <span>Verified garages</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
        
        {/* Animated bottom decorative wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
          <svg className="w-full h-16 md:h-28" viewBox="0 0 1440 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,37.5 C240,125 480,0 720,37.5 C960,75 1200,0 1440,37.5 L1440,74 L0,74 Z" fill="white" />
          </svg>
        </div>
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
