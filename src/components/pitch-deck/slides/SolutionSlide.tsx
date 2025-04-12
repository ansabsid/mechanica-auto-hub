
import React from "react";
import { 
  Lightbulb, Users, BarChart3, Gauge, Search, 
  CheckSquare, ShoppingBag, Wrench, HeartHandshake 
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
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from "@/components/ui/collapsible";

const SolutionSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className={`${isMobile ? 'px-4' : 'px-12'} mt-4`}>
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem>
              <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-5 rounded-full animate-pulse">
                  <Lightbulb className="h-8 w-8 text-mechanica-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">All-in-One Platform</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Parts, service requests, and installations in one place
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-5 rounded-full animate-pulse">
                  <Users className="h-8 w-8 text-mechanica-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Nearby Garages</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Schedule appointments with local trusted mechanics
                  </p>
                </div>
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-mechanica-100 p-5 rounded-full animate-pulse">
                  <BarChart3 className="h-8 w-8 text-mechanica-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Transparent Pricing</h3>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
                    Compare prices and read reviews
                  </p>
                </div>
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        
        <div className="flex justify-center space-x-2 mt-4 mb-2">
          <div className="w-2 h-2 rounded-full bg-mechanica-500"></div>
          <div className="w-2 h-2 rounded-full bg-mechanica-200"></div>
          <div className="w-2 h-2 rounded-full bg-mechanica-200"></div>
        </div>
      </div>
      
      <div className={`mt-2 p-4 bg-white rounded-lg shadow-md ${isMobile ? 'mx-2' : ''}`}>
        <h3 className="font-medium mb-3 text-center text-mechanica-600">How It Works</h3>
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <Gauge className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                  1. Diagnose Issue
                </p>
              </div>
              <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <Search className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                  2. Search Parts
                </p>
              </div>
              <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <CheckSquare className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                  3. Compare Options
                </p>
              </div>
            </div>
            
            <Collapsible className="mt-2">
              <CollapsibleTrigger className="flex items-center justify-center w-full">
                <span className="text-xs text-mechanica-500 hover:text-mechanica-600 cursor-pointer">
                  See more details
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-3 pb-1">
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex flex-col items-center max-w-[30%]">
                      <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                        <ShoppingBag className="h-6 w-6 text-mechanica-500" />
                      </div>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                        4. Purchase Part
                      </p>
                    </div>
                    <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                    <div className="flex flex-col items-center max-w-[30%]">
                      <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                        <Wrench className="h-6 w-6 text-mechanica-500" />
                      </div>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                        5. Schedule Install
                      </p>
                    </div>
                    <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                    <div className="flex flex-col items-center max-w-[30%]">
                      <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                        <HeartHandshake className="h-6 w-6 text-mechanica-500" />
                      </div>
                      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>
                        6. Enjoy & Rate
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="user-journey" className="border-mechanica-100">
              <AccordionTrigger className="py-2 text-sm font-medium text-mechanica-600 hover:text-mechanica-700">
                Complete User Journey
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-xs">
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">1</span>
                    <div>
                      <p className="font-medium">Diagnose Car Issue</p>
                      <p className="text-muted-foreground text-[10px]">Use the app to identify the problem with your vehicle</p>
                    </div>
                  </div>
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">2</span>
                    <div>
                      <p className="font-medium">Search for Parts</p>
                      <p className="text-muted-foreground text-[10px]">Browse by make/model or scan existing part</p>
                    </div>
                  </div>
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">3</span>
                    <div>
                      <p className="font-medium">Compare Options</p>
                      <p className="text-muted-foreground text-[10px]">View genuine vs aftermarket parts with price comparisons</p>
                    </div>
                  </div>
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">4</span>
                    <div>
                      <p className="font-medium">Purchase Selected Part</p>
                      <p className="text-muted-foreground text-[10px]">Order directly through the app with secure payment</p>
                    </div>
                  </div>
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">5</span>
                    <div>
                      <p className="font-medium">Schedule Installation</p>
                      <p className="text-muted-foreground text-[10px]">Choose between DIY or professional installation</p>
                    </div>
                  </div>
                  <div className="bg-mechanica-50 p-2 rounded-lg flex items-start">
                    <span className="bg-mechanica-200 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 mt-0.5">6</span>
                    <div>
                      <p className="font-medium">Rate & Review</p>
                      <p className="text-muted-foreground text-[10px]">Share your experience and help other users</p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default SolutionSlide;
