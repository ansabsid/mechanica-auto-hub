
import React, { useState } from "react";
import { 
  Lightbulb, Users, BarChart3, Gauge, Search, 
  CheckSquare, ShoppingBag, Wrench, HeartHandshake,
  CalendarDays, MapPin, CheckCircle, Clipboard,
  ListChecks, Edit, ThumbsUp, Clock
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Carousel, CarouselContent, CarouselItem, 
  CarouselNext, CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import { motion } from "framer-motion";

const SolutionSlide: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>("customer");
  
  return (
    <div className="space-y-3 md:space-y-5">
      <div className={`${isMobile ? 'px-2' : 'px-10'} mt-2`}>
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="flex items-center space-x-3 md:space-x-4 bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-3 md:p-5 rounded-full animate-pulse">
                  <Lightbulb className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-mechanica-500`} />
                </div>
                <div>
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>All-in-One Platform</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Parts, service requests, and installations in one place
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center space-x-3 md:space-x-4 bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-3 md:p-5 rounded-full animate-pulse">
                  <Users className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-mechanica-500`} />
                </div>
                <div>
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Nearby Garages</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Schedule appointments with local trusted mechanics
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center space-x-3 md:space-x-4 bg-white p-4 md:p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-3 md:p-5 rounded-full animate-pulse">
                  <BarChart3 className={`${isMobile ? 'h-6 w-6' : 'h-8 w-8'} text-mechanica-500`} />
                </div>
                <div>
                  <h3 className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}>Transparent Pricing</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Compare prices and read reviews
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
        
        <div className="flex justify-center space-x-2 mt-2 md:mt-3 mb-1">
          <div className="w-2 h-2 rounded-full bg-mechanica-500"></div>
          <div className="w-2 h-2 rounded-full bg-mechanica-200"></div>
          <div className="w-2 h-2 rounded-full bg-mechanica-200"></div>
        </div>
      </div>
      
      <div className={`mt-1 p-3 md:p-4 bg-white rounded-lg shadow-md ${isMobile ? 'mx-1' : ''}`}>
        <h3 className="font-medium text-center text-mechanica-600 text-base md:text-lg mb-2 md:mb-3">How It Works</h3>
        
        <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-3 md:mb-4">
            <TabsTrigger value="customer" className="text-xs md:text-sm py-1.5 md:py-2">Customer Journey</TabsTrigger>
            <TabsTrigger value="garage" className="text-xs md:text-sm py-1.5 md:py-2">Garage Operations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="customer" className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-mechanica-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-mechanica-700 mb-1.5 md:mb-2 flex items-center text-sm md:text-base">
                  <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-mechanica-500" />
                  Parts Purchase Flow
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <FlowStep 
                    number={1} 
                    title="Diagnose Issue" 
                    description="Use the app to identify the problem with your vehicle"
                    icon={<Gauge className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.1}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={2} 
                    title="Search Parts" 
                    description="Browse by make/model or scan existing part"
                    icon={<Search className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.2}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={3} 
                    title="Compare Options" 
                    description="View genuine vs aftermarket parts with price comparisons"
                    icon={<CheckSquare className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.3}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={4} 
                    title="Purchase Part" 
                    description="Order directly through the app with secure payment"
                    icon={<ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.4}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={5} 
                    title="Schedule Installation" 
                    description="Book a nearby garage to install your purchased part"
                    icon={<CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.5}
                    isMobile={isMobile}
                  />
                </div>
              </div>
              
              <div className="bg-mechanica-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-mechanica-700 mb-1.5 md:mb-2 flex items-center text-sm md:text-base">
                  <Wrench className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-mechanica-500" />
                  Service Booking Flow
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <FlowStep 
                    number={1} 
                    title="Find Nearby Garages" 
                    description="Search for garages in your area"
                    icon={<MapPin className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.1}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={2} 
                    title="Book Appointment" 
                    description="Schedule service at your preferred time"
                    icon={<CalendarDays className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.2}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={3} 
                    title="Get Confirmation" 
                    description="Receive booking confirmation and reminders"
                    icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.3}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={4} 
                    title="Complete Service" 
                    description="Get your vehicle serviced and rate the experience"
                    icon={<HeartHandshake className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "customer"}
                    delay={0.4}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="garage" className="space-y-3 md:space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-mechanica-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-mechanica-700 mb-1.5 md:mb-2 flex items-center text-sm md:text-base">
                  <Clipboard className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-mechanica-500" />
                  Inventory Management
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <FlowStep 
                    number={1} 
                    title="List Inventory" 
                    description="Add parts with details and pricing to your inventory"
                    icon={<ListChecks className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.1}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={2} 
                    title="Update Stock" 
                    description="Manage quantities and update part information"
                    icon={<Edit className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.2}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={3} 
                    title="Handle Installation Requests" 
                    description="Receive and accept parts installation requests"
                    icon={<Wrench className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.3}
                    isMobile={isMobile}
                  />
                </div>
              </div>
              
              <div className="bg-mechanica-50 p-3 md:p-4 rounded-lg">
                <h4 className="font-medium text-mechanica-700 mb-1.5 md:mb-2 flex items-center text-sm md:text-base">
                  <CalendarDays className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-mechanica-500" />
                  Service Management
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <FlowStep 
                    number={1} 
                    title="Set Available Slots" 
                    description="Configure your service schedule and time slots"
                    icon={<Clock className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.1}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={2} 
                    title="Confirm Bookings" 
                    description="Accept and confirm service appointments"
                    icon={<CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.2}
                    isMobile={isMobile}
                  />
                  <FlowStep 
                    number={3} 
                    title="Complete Services" 
                    description="Mark services as completed and collect reviews"
                    icon={<ThumbsUp className="h-4 w-4 md:h-5 md:w-5 text-mechanica-500" />}
                    isActive={activeTab === "garage"}
                    delay={0.3}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <Accordion type="single" collapsible className="w-full mt-3 md:mt-4">
          <AccordionItem value="integration" className="border-mechanica-100">
            <AccordionTrigger className="py-1.5 md:py-2 text-xs md:text-sm font-medium text-mechanica-600 hover:text-mechanica-700">
              Platform Integration Details
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1.5 md:space-y-2 text-2xs md:text-xs p-2 bg-mechanica-50 rounded-lg">
                <p className="font-medium text-mechanica-700">Complete end-to-end solution:</p>
                <ul className="list-disc pl-4 md:pl-5 space-y-0.5 md:space-y-1 text-muted-foreground">
                  <li>Seamless connection between customers and garages</li>
                  <li>Integrated payments and scheduling system</li>
                  <li>Real-time inventory management</li>
                  <li>Automated notifications and reminders</li>
                  <li>Rating and review system for quality assurance</li>
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

interface FlowStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  delay: number;
  isMobile: boolean | undefined;
}

const FlowStep: React.FC<FlowStepProps> = ({ 
  number, 
  title, 
  description, 
  icon,
  isActive,
  delay,
  isMobile
}) => {
  return (
    <motion.div 
      className="flex items-start gap-2 md:gap-3 p-1.5 md:p-2 bg-white rounded-md shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isActive ? 1 : 0, 
        y: isActive ? 0 : 20 
      }}
      transition={{ 
        duration: 0.3, 
        delay: delay,
        ease: "easeOut" 
      }}
    >
      <div className="bg-mechanica-100 h-5 w-5 md:h-7 md:w-7 rounded-full flex items-center justify-center shrink-0">
        <span className="text-2xs md:text-xs font-bold text-mechanica-700">{number}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5 md:gap-2">
          {icon}
          <h5 className="font-medium text-xs md:text-sm">{title}</h5>
        </div>
        <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 md:mt-1">{description}</p>
      </div>
    </motion.div>
  );
};

export default SolutionSlide;
