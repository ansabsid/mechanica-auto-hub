import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Rocket, Users, DollarSign, BarChart3, Target, Award, Lightbulb, Briefcase, CarFront, Car, TrendingUp, PieChart, Star, Sparkles, Gauge, RotateCw, Medal, UserRound, Search, CheckSquare, Wrench, ShoppingBag, HeartHandshake, Coffee, Cpu, Tool, Laugh, Workflow, Zap, Brain, Code, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCapacitor } from "@/hooks/useCapacitor";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Slide {
  title: string;
  content: React.ReactNode;
  bgColor: string;
}

const PitchDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isAnimating, setIsAnimating] = useState(false);
  const { isCapacitor } = useCapacitor();
  const slideTimerRef = useRef<number | null>(null);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const isMobile = useIsMobile();
  const [hoveredTeamMember, setHoveredTeamMember] = useState<number | null>(null);
  const [showTeamFunFact, setShowTeamFunFact] = useState<number | null>(null);
  
  useEffect(() => {
    return () => {
      if (slideTimerRef.current !== null) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentSlide === 9) {
      setIsConfettiActive(true);
      const timer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);
  
  const slides: Slide[] = [
    {
      title: "BookMyParts",
      content: (
        <div className="flex flex-col items-center justify-center space-y-4 text-center w-full pb-10">
          <div className="relative mt-0">
            <Rocket size={isMobile ? 50 : 70} className="text-mechanica-500 animate-bounce" />
            <div className="absolute -bottom-2 -right-2">
              <Sparkles size={isMobile ? 18 : 24} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold animate-fade-in mt-0`}>Revolutionizing Auto Parts Purchasing</h2>
          <p className="text-center text-muted-foreground text-lg animate-fade-in" style={{animationDelay: "0.3s"}}>
            Connect customers with auto parts and trusted garages
          </p>
          <div className="mt-4 animate-fade-in" style={{animationDelay: "0.6s"}}>
            <Button
              variant="default"
              className="bg-mechanica-500 hover:bg-mechanica-600 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Explore Our Vision
            </Button>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100"
    },
    {
      title: "The Problem",
      content: (
        <div className="space-y-4">
          <ul className="space-y-5">
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">1</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.1s"}}>
                <h3 className="font-medium mb-1">Parts Uncertainty</h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Car owners struggle to find genuine parts at fair prices</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">2</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
                <h3 className="font-medium mb-1">Trust Issues</h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>Finding trusted mechanics for installation is time-consuming</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">3</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.5s"}}>
                <h3 className="font-medium mb-1">Lack of Transparency</h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>No clarity in parts pricing and service quality</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">4</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.7s"}}>
                <h3 className="font-medium mb-1">Fragmented Market</h3>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>No unified platform connecting all stakeholders</p>
              </div>
            </li>
          </ul>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-red-50 to-orange-100"
    },
    {
      title: "Our Solution",
      content: (
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
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Parts, service requests, and installations in one place</p>
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
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Schedule appointments with local trusted mechanics</p>
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
                      <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>Compare prices and read reviews</p>
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
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>1. Diagnose Issue</p>
                  </div>
                  <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                  <div className="flex flex-col items-center max-w-[30%]">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                      <Search className="h-6 w-6 text-mechanica-500" />
                    </div>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>2. Search Parts</p>
                  </div>
                  <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                  <div className="flex flex-col items-center max-w-[30%]">
                    <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                      <CheckSquare className="h-6 w-6 text-mechanica-500" />
                    </div>
                    <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>3. Compare Options</p>
                  </div>
                </div>
                
                <Collapsible className="mt-2">
                  <CollapsibleTrigger className="flex items-center justify-center w-full">
                    <span className="text-xs text-mechanica-500 hover:text-mechanica-600 cursor-pointer">See more details</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pt-3 pb-1">
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex flex-col items-center max-w-[30%]">
                          <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                            <ShoppingBag className="h-6 w-6 text-mechanica-500" />
                          </div>
                          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>4. Purchase Part</p>
                        </div>
                        <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                        <div className="flex flex-col items-center max-w-[30%]">
                          <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                            <Wrench className="h-6 w-6 text-mechanica-500" />
                          </div>
                          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>5. Schedule Install</p>
                        </div>
                        <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
                        <div className="flex flex-col items-center max-w-[30%]">
                          <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                            <HeartHandshake className="h-6 w-6 text-mechanica-500" />
                          </div>
                          <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-center font-medium`}>6. Enjoy & Rate</p>
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
      ),
      bgColor: "bg-gradient-to-br from-green-50 to-emerald-100"
    },
    {
      title: "Market Opportunity",
      content: (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <CarFront className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-blue-700">New Car Market</h3>
            </div>
            
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-3`}>
              <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-blue-600 font-medium">2024 Sales</span>
                    <span className="text-xl font-bold mt-1 animate-fade-in">318,981</span>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">+15.7% YoY</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-blue-600 font-medium">Growth Rate</span>
                    <span className="text-xl font-bold mt-1 animate-fade-in">19.1%</span>
                    <div className="flex items-center mt-1">
                      <span className="text-xs">2023: 27.2% (330,532 units)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-blue-600 font-medium">2032 Forecast</span>
                    <span className="text-xl font-bold mt-1 animate-fade-in">$25.16B</span>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">CAGR: 15.29%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
            <div className="flex items-center mb-3">
              <div className="bg-amber-100 p-3 rounded-full mr-3">
                <Car className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-amber-700">Used Car Market</h3>
            </div>
            
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-3`}>
              <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-amber-600 font-medium">2022 Market Value</span>
                    <span className="text-xl font-bold mt-1 animate-fade-in">$20.15B</span>
                    <PieChart className="h-4 w-4 text-amber-500 mt-2" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-amber-600 font-medium">2030 Projection</span>
                    <span className="text-xl font-bold mt-1 animate-fade-in">$48.15B</span>
                    <div className="flex items-center mt-1">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-xs text-green-600">CAGR: 11.5%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-amber-600 font-medium">Consumer Trends</span>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs">
                        <span>AED 20K-30K</span>
                        <span className="font-medium">High Demand</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 my-1 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full animate-[grow_1.5s_ease-out]" style={{ width: "80%" }}></div>
                      </div>
                      
                      <div className="flex justify-between text-xs mt-2">
                        <span>AED 50K-80K</span>
                        <span className="font-medium">High Demand</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 my-1 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full animate-[grow_1.5s_ease-out_0.3s]" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-gray-50 to-slate-100"
    },
    {
      title: "Competitive Advantage",
      content: (
        <div className="space-y-4">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
            <Card className="bg-mechanica-50 border-mechanica-200 transition-all hover:shadow-md transform hover:-translate-y-1 cursor-pointer">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Award className="h-10 w-10 text-mechanica-500 mb-2 animate-pulse" />
                <h3 className="font-medium">Unified Platform</h3>
                <p className="text-xs text-muted-foreground mt-1">Parts + Service in one app</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200 transition-all hover:shadow-md transform hover:-translate-y-1 cursor-pointer">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Target className="h-10 w-10 text-mechanica-500 mb-2 animate-pulse" />
                <h3 className="font-medium">Smart Matching</h3>
                <p className="text-xs text-muted-foreground mt-1">AI-powered part identification</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200 transition-all hover:shadow-md transform hover:-translate-y-1 cursor-pointer">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Briefcase className="h-10 w-10 text-mechanica-500 mb-2 animate-pulse" />
                <h3 className="font-medium">Garage Network</h3>
                <p className="text-xs text-muted-foreground mt-1">Vetted installation partners</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200 transition-all hover:shadow-md transform hover:-translate-y-1 cursor-pointer">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <DollarSign className="h-10 w-10 text-mechanica-500 mb-2 animate-pulse" />
                <h3 className="font-medium">Value Pricing</h3>
                <p className="text-xs text-muted-foreground mt-1">Transparent competitive rates</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
            <h3 className="font-bold text-center mb-3 text-mechanica-600">Why Choose Us?</h3>
            <div className="flex items-center justify-between">
              <div className="text-center flex flex-col items-center">
                <Star className="h-6 w-6 text-yellow-500 mb-1" />
                <span className="text-xs">Quality</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <Star className="h-6 w-6 text-yellow-500 mb-1" />
                <span className="text-xs">Speed</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <Star className="h-6 w-6 text-yellow-500 mb-1" />
                <span className="text-xs">Trust</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <Star className="h-6 w-6 text-yellow-500 mb-1" />
                <span className="text-xs">Value</span>
              </div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-100"
    },
    {
      title: "Business Model",
      content: (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-medium">Commission Fee</h3>
              <p className="text-sm text-muted-foreground">8-12% from part suppliers and garages</p>
            </div>
            <div className="ml-auto transform transition-transform hover:scale-110">
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="font-medium">Premium Listing</h3>
              <p className="text-sm text-muted-foreground">Featured placement for partner garages</p>
            </div>
            <div className="ml-auto transform transition-transform hover:scale-110">
              <Star className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="font-medium">Subscription Model</h3>
              <p className="text-sm text-muted-foreground">Pro features for high-volume garages</p>
            </div>
            <div className="ml-auto transform transition-transform hover:scale-110">
              <RotateCw className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <h4 className="text-lg font-semibold text-mechanica-600 mb-2">Revenue Split</h4>
            <div className="flex justify-between bg-white rounded-xl p-3 shadow-sm">
              <div className="text-center">
                <div className="text-xs font-medium">Parts Sales</div>
                <div className="text-2xl font-bold text-blue-600">65%</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">Premium</div>
                <div className="text-2xl font-bold text-yellow-600">20%</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-medium">Subscriptions</div>
                <div className="text-2xl font-bold text-green-600">15%</div>
              </div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-blue-50 to-cyan-100"
    },
    {
      title: "Roadmap",
      content: (
        <div className="space-y-4">
          <div className="relative border-l-2 border-mechanica-200 pl-8 pb-8 ml-4">
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-500 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              1
            </div>
            <div className="animate-fade-in">
              <h3 className="font-medium text-lg">Q2 2025: Launch MVP</h3>
              <p className="text-sm text-muted-foreground">UAE market with core features</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  User App
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  Garage Portal
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative border-l-2 border-mechanica-200 pl-8 pb-8 ml-4">
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-300 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              2
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
              <h3 className="font-medium text-lg">Q4 2025: Expand Network</h3>
              <p className="text-sm text-muted-foreground">100+ garage partnerships</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  AI Diagnostics
                </span>
                <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                  Part Scanner
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative border-l-2 border-mechanica-200 pl-8 pb-8 ml-4">
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-300 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              3
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.6s"}}>
              <h3 className="font-medium text-lg">Q2 2026: Regional Expansion</h3>
              <p className="text-sm text-muted-foreground">Saudi Arabia and Qatar markets</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  New Markets
                </span>
                <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                  Corporate Accounts
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative pl-8 ml-4">
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-200 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              4
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.9s"}}>
              <h3 className="font-medium text-lg">Q1 2027: Mobile App 2.0</h3>
              <p className="text-sm text-muted-foreground">Enhanced features and AI diagnostics</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  Predictive Maintenance
                </span>
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                  AR Instructions
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-100"
    },
    {
      title: "Investment Opportunity",
      content: (
        <div className="space-y-6">
          <Card className="shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1">
            <CardContent className="pt-6">
              <h3 className="font-bold text-center text-xl text-mechanica-600 mb-3">
                <span className="animate-pulse inline-block">💰</span> Seeking AED 4.4M in Seed Funding
              </h3>
              
              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Marketing & User Acquisition</span>
                    <span className="text-sm font-medium">35%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-mechanica-500 h-2.5 rounded-full animate-[grow_1.5s_ease-out]" style={{ width: "35%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Technology Development</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-mechanica-500 h-2.5 rounded-full animate-[grow_1.5s_ease-out_0.3s]" style={{ width: "30%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Operations & Team</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-mechanica-500 h-2.5 rounded-full animate-[grow_1.5s_ease-out_0.6s]" style={{ width: "25%" }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Reserve</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-mechanica-500 h-2.5 rounded-full animate-[grow_1.5s_ease-out_0.9s]" style={{ width: "10%" }}></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-mechanica-50 p-4 rounded-lg">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-mechanica-600">Expected Return</h4>
                  <div className="text-3xl font-bold text-mechanica-700 mt-1">3.8x ROI</div>
                  <p className="text-sm text-mechanica-600 mt-1">within 5 years</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-green-50 to-teal-100"
    },
    {
      title: "Our Team",
      content: (
        <div className="space-y-6">
          <h3 className="text-center font-bold text-xl text-mechanica-700 mb-8 animate-bounce">Meet The Dream Team</h3>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-8' : 'grid-cols-2 gap-10'}`}>
            {/* Founder */}
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredTeamMember(1)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 1 ? null : 1)}
            >
              <div className={`bg-gradient-to-br from-blue-50 to-mechanica-100 rounded-xl p-5 shadow-lg transition-all duration-300 transform 
                ${hoveredTeamMember === 1 ? 'scale-105 rotate-1 shadow-xl' : ''} 
                ${showTeamFunFact === 1 ? 'scale-105 shadow-xl border-2 border-mechanica-400' : ''}`}
              >
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-mechanica-300 shadow-md group-hover:shadow-xl transition-all">
                      <AvatarFallback className="bg-mechanica-100 text-mechanica-700 text-xl font-bold">MS</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-mechanica-500 text-white p-1.5 rounded-full shadow-md">
                      <Rocket className="h-4 w-4" />
                    </div>
                    <div className={`absolute -top-1 -right-1 transition-opacity duration-300 ${hoveredTeamMember === 1 ? 'opacity-100' : 'opacity-0'}`}>
                      <Flame className="h-5 w-5 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="ml-5">
                    <h3 className="font-bold text-lg text-mechanica-700">Mohammad Ansab Siddiqui</h3>
                    <div className="flex items-center">
                      <p className="text-mechanica-600 font-medium">Founder & CEO</p>
                      <div className="ml-2 animate-pulse">
                        <Brain className="h-4 w-4 text-mechanica-500" />
                      </div>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {["Visionary", "Innovator"].map((tag, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ${showTeamFunFact === 1 ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mt-1 border border-mechanica-200">
                    <div className="flex items-start">
                      <Coffee className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Fuels innovation with 5 cups of coffee daily</p>
                    </div>
                    <div className="flex items-start mt-2">
                      <Zap className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Wakes up at 5 AM to plan world domination</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 text-mechanica-600 hover:text-mechanica-800 hover:bg-mechanica-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTeamFunFact(showTeamFunFact === 1 ? null : 1);
                  }}
                >
                  {showTeamFunFact === 1 ? "Hide Fun Facts" : "Show Fun Facts"}
                </Button>
              </div>
              
              <div className={`absolute -bottom-3 right-0 left-0 mx-auto w-32 h-3 bg-black/10 rounded-full filter blur-md transition-all duration-300 ${hoveredTeamMember === 1 ? 'opacity-80 scale-110' : 'opacity-40'}`}></div>
            </div>
            
            {/* COO */}
            <div 
              className="relative group"
              onMouseEnter={() => setHoveredTeamMember(2)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 2 ? null : 2)}
            >
              <div className={`bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 shadow-lg transition-all duration-300 transform 
                ${hoveredTeamMember === 2 ? 'scale-105 -rotate-1 shadow-xl' : ''} 
                ${showTeamFunFact === 2 ? 'scale-105 shadow-xl border-2 border-emerald-400' : ''}`}
              >
                <div className="flex items-center mb-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-2 border-emerald-300 shadow-md group-hover:shadow-xl transition-all">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xl font-bold">AS</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-full shadow-md">
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div className={`absolute -top-1 -right-1 transition-opacity duration-300 ${hoveredTeamMember === 2 ? 'opacity-100' : 'opacity-0'}`}>
                      <Laugh className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="ml-5">
                    <h3 className="font-bold text-lg text-emerald-700">Asad Sayed</h3>
                    <div className="flex items-center">
                      <p className="text-emerald-600 font-medium">COO</p>
                      <div className="ml-2 animate-pulse">
                        <Tool className="h-4 w-4 text-emerald-500" />
                      </div>
                    </div>
                    <div className="mt-1 flex space-x-1">
                      {["Operations", "Efficiency"].map((tag, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ${showTeamFunFact === 2 ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mt-1 border border-emerald-200">
                    <div className="flex items-start">
                      <Tool className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Can optimize any process in his sleep</p>
                    </div>
                    <div className="flex items-start mt-2">
                      <Cpu className="h-5 w-5 text-emerald-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Weekend gamer who uses strategy games to improve business tactics</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTeamFunFact(showTeamFunFact === 2 ? null : 2);
                  }}
                >
                  {showTeamFunFact === 2 ? "Hide Fun Facts" : "Show Fun Facts"}
                </Button>
              </div>
              
              <div className={`absolute -bottom-3 right-0 left-0 mx-auto w-32 h-3 bg-black/10 rounded-full filter blur-md transition-all duration-300 ${hoveredTeamMember === 2 ? 'opacity-80 scale-110' : 'opacity-40'}`}></div>
            </div>
          </div>
          
          {/* Advisor */}
          <div className="mt-8">
            <h3 className="text-center font-medium text-gray-700 mb-4">Advisory Board</h3>
            
            <div 
              className="relative max-w-md mx-auto group"
              onMouseEnter={() => setHoveredTeamMember(3)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 3 ? null : 3)}
            >
              <div className={`bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-5 shadow-lg transition-all duration-300 transform 
                ${hoveredTeamMember === 3 ? 'scale-105 rotate-1 shadow-xl' : ''} 
                ${showTeamFunFact === 3 ? 'scale-105 shadow-xl border-2 border-amber-400' : ''}`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-amber-300 shadow-md group-hover:shadow-xl transition-all">
                      <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-bold">MH</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-1.5 rounded-full shadow-md">
                      <Medal className="h-4 w-4" />
                    </div>
                    <div className={`absolute -top-1 -right-1 transition-opacity duration-300 ${hoveredTeamMember === 3 ? 'opacity-100' : 'opacity-0'}`}>
                      <Star className="h-5 w-5 text-yellow-500 animate-pulse" />
                    </div>
                  </div>
                  
                  <div className="ml-5">
                    <h3 className="font-bold text-lg text-amber-700">Mohammad Hafeez Siddique</h3>
                    <div className="flex items-center">
                      <p className="text-amber-600 font-medium">Strategic Advisor</p>
                      <div className="ml-2 animate-pulse">
                        <Code className="h-4 w-4 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-1 flex space-x-1 flex-wrap">
                      {["Industry Expert", "Mentor"].map((tag, i) => (
                        <span key={i} className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 mb-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={`overflow-hidden transition-all duration-300 ${showTeamFunFact === 3 ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 mt-3 border border-amber-200">
                    <div className="flex items-start">
                      <Lightbulb className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Has advised 5+ successful startups in the automotive sector</p>
                    </div>
                    <div className="flex items-start mt-2">
                      <Star className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm italic">Masterful at connecting the right people to solve complex problems</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full mt-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTeamFunFact(showTeamFunFact === 3 ? null : 3);
                  }}
                >
                  {showTeamFunFact === 3 ? "Hide Fun Facts" : "Show Fun Facts"}
                </Button>
              </div>
              
              <div className={`absolute -bottom-3 right-0 left-0 mx-auto w-32 h-3 bg-black/10 rounded-full filter blur-md transition-all duration-300 ${hoveredTeamMember === 3 ? 'opacity-80 scale-110' : 'opacity-40'}`}></div>
            </div>
          </div>
          
          <div className="flex justify-center items-center space-x-4 mt-8">
            <div className="text-center animate-bounce" style={{ animationDelay: "0.1s" }}>
              <div className="bg-blue-100 rounded-full p-2">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-xs mt-1">Passionate</p>
            </div>
            <div className="text-center animate-bounce" style={{ animationDelay: "0.2s" }}>
              <div className="bg-green-100 rounded-full p-2">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs mt-1">Driven</p>
            </div>
            <div className="text-center animate-bounce" style={{ animationDelay: "0.3s" }}>
              <div className="bg-purple-100 rounded-full p-2">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-xs mt-1">Innovative</p>
            </div>
            <div className="text-center animate-bounce" style={{ animationDelay: "0.4s" }}>
              <div className="bg-amber-100 rounded-full p-2">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-xs mt-1">Committed</p>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-gray-50 to-blue-50"
    },
    {
      title: "Thank You",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 text-center h-full">
          <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-mechanica-600 animate-fade-in`}>Join Us in Revolutionizing Auto Parts</h2>
          <p className={`text-muted-foreground ${isMobile ? 'text-base' : 'text-lg'} max-w-md mx-auto animate-fade-in`} style={{animationDelay: "0.3s"}}>
            Be part of the solution that connects customers with the right parts and trusted professionals
          </p>
          <div className="mt-8 animate-fade-in" style={{animationDelay: "0.6s"}}>
            <Button
              variant="mechanica"
              size="lg"
              className="rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Contact Us
            </Button>
          </div>
          
          <div className={`mt-8 grid grid-cols-3 gap-${isMobile ? '2' : '6'} w-full max-w-md animate-fade-in`} style={{animationDelay: "0.9s"}}>
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 rounded-full p-2 mb-2">
                <span className="text-blue-600 text-lg font-bold">20+</span>
              </div>
              <span className="text-xs">Team Members</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 rounded-full p-2 mb-2">
                <span className="text-green-600 text-lg font-bold">100+</span>
              </div>
              <span className="text-xs">Garage Partners</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-amber-100 rounded-full p-2 mb-2">
                <span className="text-amber-600 text-lg font-bold">5+</span>
              </div>
              <span className="text-xs">Countries</span>
            </div>
          </div>
          
          {isConfettiActive && (
            <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-bounce text-6xl">🎉</div>
                <div className="animate-bounce delay-100 text-6xl" style={{animationDelay: "0.2s"}}>🚀</div>
                <div className="animate-bounce delay-200 text-6xl" style={{animationDelay: "0.4s"}}>🎊</div>
              </div>
              <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="absolute animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animation: `confetti ${2 + Math.random() * 3}s linear forwards`,
                      backgroundColor: ['#FFC700', '#FF0066', '#00C2FF', '#4DE94C'][Math.floor(Math.random() * 4)],
                      width: `${5 + Math.random() * 5}px`,
                      height: `${10 + Math.random() * 10}px`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      bgColor: "bg-gradient-to-br from-blue-50 to-mechanica-100"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1 && !isAnimating) {
      setDirection('next');
      setIsAnimating(true);
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0 && !isAnimating) {
      setDirection('prev');
      setIsAnimating(true);
      slideTimerRef.current = window.setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, isAnimating]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti {
          0% { transform: translateY(-10px) rotateZ(0); opacity: 1; }
          100% { transform: translateY(100vh) rotateZ(360deg); opacity: 0; }
        }
        @keyframes grow {
          0% { width: 0; }
          100% { width: 100%; }
        }
      `}} />
      
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-mechanica-500 transition-all duration-300 ease-in-out"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        />
      </div>
      
      <div
        className={`flex-grow flex items-start justify-center ${isMobile ? 'pt-8 px-2 pb-2' : 'pt-12 px-6 pb-6'} transition-all duration-300 ease-in-out ${slides[currentSlide].bgColor}`}
      >
        <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-4xl'} mx-auto`}>
          <div className="text-center mb-2">
            <h1 className={`${isMobile ? 'text-2xl mb-1' : 'text-4xl mb-4'} font-bold text-black`}>{slides[currentSlide].title}</h1>
          </div>
          
          <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl ${isMobile ? 'p-3 mt-1' : 'p-6 mt-2'} transition-all duration-500 transform`}>
            {slides[currentSlide].content}
          </div>
        </div>
      </div>
      
      <div className={`fixed ${isMobile ? 'bottom-[140px]' : 'bottom-[100px]'} left-0 right-0 flex justify-between items-center ${isMobile ? 'px-3' : 'px-6'} z-30`}>
        <Button
          variant="outline"
          size={isMobile ? "sm" : "icon"}
          onClick={handlePrev}
          disabled={currentSlide === 0}
          className={`rounded-full ${currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/80'}`}
        >
          <ChevronLeft className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
        </Button>
        
        <div className="flex space-x-1">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index ? 'bg-mechanica-500 w-4' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size={isMobile ? "sm" : "icon"}
          onClick={handleNext}
          disabled={currentSlide === slides.length - 1}
          className={`rounded-full ${currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/80'}`}
        >
          <ChevronRight className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'}`} />
        </Button>
      </div>
      
      <div className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-black/10 backdrop-blur-sm text-black px-3 py-1 rounded-full text-xs font-medium z-20">
        {currentSlide + 1} / {slides.length}
      </div>
      
      {isConfettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-bounce text-6xl">🎉</div>
            <div className="animate-bounce delay-100 text-6xl" style={{animationDelay: "0.2s"}}>🚀</div>
            <div className="animate-bounce delay-200 text-6xl" style={{animationDelay: "0.4s"}}>🎊</div>
          </div>
          <div className="absolute top-0 left-0 right-0 h-20 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `confetti ${2 + Math.random() * 3}s linear forwards`,
                  backgroundColor: ['#FFC700', '#FF0066', '#00C2FF', '#4DE94C'][Math.floor(Math.random() * 4)],
                  width: `${5 + Math.random() * 5}px`,
                  height: `${10 + Math.random() * 10}px`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchDeck;
