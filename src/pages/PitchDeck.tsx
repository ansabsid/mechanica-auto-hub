import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Rocket, Users, DollarSign, BarChart3, Target, Award, Lightbulb, Briefcase, CarFront, Car, TrendingUp, PieChart, Star, Sparkles, Gauge, RotateCw, Medal, UserRound, Search, CheckSquare, Wrench, ShoppingBag, HeartHandshake, Coffee, Cpu, Settings, Laugh, Workflow, Zap, Brain, Code, Flame } from "lucide-react";
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
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-400 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              2
            </div>
            <div className="animate-fade-in">
              <h3 className="font-medium text-lg">Q4 2025: Regional Expansion</h3>
              <p className="text-sm text-muted-foreground">Saudi Arabia and Qatar markets</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                  Multiple Languages
                </span>
                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                  Local Partnerships
                </span>
              </div>
            </div>
          </div>
          
          <div className="relative border-l-2 border-mechanica-200 pl-8 pb-8 ml-4">
            <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-300 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
              3
            </div>
            <div className="animate-fade-in">
              <h3 className="font-medium text-lg">Q2 2026: Enhanced Features</h3>
              <p className="text-sm text-muted-foreground">AI diagnostics and subscription tiers</p>
              <div className="mt-2 flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
                  Premium Plans
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                  Advanced AI
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-indigo-50 to-purple-100"
    },
    {
      title: "Our Team",
      content: (
        <div className="space-y-6">
          <h3 className="text-center font-semibold text-lg text-mechanica-600 mb-4">Meet the Founders</h3>
          
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-3 gap-8'}`}>
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredTeamMember(0)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 0 ? null : 0)}
            >
              <div className="p-4 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-mechanica-200">
                  <AvatarFallback className="bg-mechanica-100 text-mechanica-700 text-xl font-bold">
                    AK
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Ahmed Khan</h4>
                <p className="text-sm text-muted-foreground">CEO & Co-founder</p>
                <div className="mt-2 text-xs text-mechanica-500">
                  {hoveredTeamMember === 0 && (
                    <p className="animate-fade-in">15+ years in automotive industry</p>
                  )}
                </div>
                
                {showTeamFunFact === 0 && (
                  <div className="mt-3 bg-mechanica-50 p-2 rounded text-xs animate-fade-in">
                    <p className="font-medium text-mechanica-700">Fun Fact</p>
                    <p>Restored over 20 classic cars as a hobby</p>
                  </div>
                )}
              </div>
            </div>
            
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredTeamMember(1)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 1 ? null : 1)}
            >
              <div className="p-4 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-mechanica-200">
                  <AvatarFallback className="bg-mechanica-100 text-mechanica-700 text-xl font-bold">
                    SP
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Sarah Patel</h4>
                <p className="text-sm text-muted-foreground">CTO & Co-founder</p>
                <div className="mt-2 text-xs text-mechanica-500">
                  {hoveredTeamMember === 1 && (
                    <p className="animate-fade-in">Ex-Google, AI specialist</p>
                  )}
                </div>
                
                {showTeamFunFact === 1 && (
                  <div className="mt-3 bg-mechanica-50 p-2 rounded text-xs animate-fade-in">
                    <p className="font-medium text-mechanica-700">Fun Fact</p>
                    <p>Competed in international robotics competitions</p>
                  </div>
                )}
              </div>
            </div>
            
            <div 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onMouseEnter={() => setHoveredTeamMember(2)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => setShowTeamFunFact(showTeamFunFact === 2 ? null : 2)}
            >
              <div className="p-4 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-mechanica-200">
                  <AvatarFallback className="bg-mechanica-100 text-mechanica-700 text-xl font-bold">
                    MR
                  </AvatarFallback>
                </Avatar>
                <h4 className="font-bold text-lg">Mahmoud Rahman</h4>
                <p className="text-sm text-muted-foreground">COO & Co-founder</p>
                <div className="mt-2 text-xs text-mechanica-500">
                  {hoveredTeamMember === 2 && (
                    <p className="animate-fade-in">Former operations exec at AutoTrader UAE</p>
                  )}
                </div>
                
                {showTeamFunFact === 2 && (
                  <div className="mt-3 bg-mechanica-50 p-2 rounded text-xs animate-fade-in">
                    <p className="font-medium text-mechanica-700">Fun Fact</p>
                    <p>Speaks 5 languages fluently</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm mt-6">
            <h4 className="font-medium text-center mb-3">Backed by Industry Leaders</h4>
            <div className="flex justify-around items-center">
              <div className="text-center">
                <Medal className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-xs font-medium mt-1">Auto Tech Ventures</p>
              </div>
              <div className="text-center">
                <Workflow className="h-8 w-8 text-blue-500 mx-auto" />
                <p className="text-xs font-medium mt-1">Mobility Partners</p>
              </div>
              <div className="text-center">
                <Zap className="h-8 w-8 text-purple-500 mx-auto" />
                <p className="text-xs font-medium mt-1">Innovation Fund</p>
              </div>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-teal-50 to-cyan-100"
    },
    {
      title: "Investment Opportunity",
      content: (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-5 shadow-md">
            <h3 className="text-center font-semibold text-lg text-mechanica-600 mb-4">Seed Round - $1.5M</h3>
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
              <div className="flex items-start space-x-3">
                <div className="bg-mechanica-100 p-3 rounded-full">
                  <Brain className="h-5 w-5 text-mechanica-600" />
                </div>
                <div>
                  <h4 className="font-medium">Product Development</h4>
                  <p className="text-sm text-muted-foreground">40% - App refinement and new features</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-mechanica-100 p-3 rounded-full">
                  <Code className="h-5 w-5 text-mechanica-600" />
                </div>
                <div>
                  <h4 className="font-medium">Engineering Team</h4>
                  <p className="text-sm text-muted-foreground">25% - Expanding developer resources</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-mechanica-100 p-3 rounded-full">
                  <Flame className="h-5 w-5 text-mechanica-600" />
                </div>
                <div>
                  <h4 className="font-medium">Marketing</h4>
                  <p className="text-sm text-muted-foreground">20% - User and garage acquisition</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-mechanica-100 p-3 rounded-full">
                  <Cpu className="h-5 w-5 text-mechanica-600" />
                </div>
                <div>
                  <h4 className="font-medium">Operations</h4>
                  <p className="text-sm text-muted-foreground">15% - Infrastructure and scaling</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-mechanica-50 rounded-lg p-4 border border-mechanica-100">
            <h4 className="font-medium text-center mb-3">Financial Projections</h4>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Year 1</p>
                <p className="text-xl font-bold text-mechanica-700 mt-1">$850K</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Year 2</p>
                <p className="text-xl font-bold text-mechanica-700 mt-1">$2.4M</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-gray-500">Year 3</p>
                <p className="text-xl font-bold text-mechanica-700 mt-1">$5.7M</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs font-medium">Projected Break-Even: Q2 2026</p>
            </div>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-100"
    },
    {
      title: "Contact Us",
      content: (
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative animate-bounce">
            <Settings className="h-12 w-12 text-mechanica-500" />
            <div className="absolute -right-1 -bottom-1">
              <Coffee className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-mechanica-600">Let's Build The Future Together</h3>
            <p className="text-muted-foreground mt-2">Ready to transform the auto parts and service industry?</p>
          </div>
          
          <div className="flex space-x-4">
            <Button variant="mechanica" className="rounded-full shadow-md hover:shadow-lg transition-all">
              Contact Us
            </Button>
            <Button variant="outline" className="rounded-full border-mechanica-300 shadow-sm hover:bg-mechanica-50">
              Download Pitch Deck
            </Button>
          </div>
          
          <div className="pt-6 border-t border-gray-200 w-full max-w-xs mx-auto mt-4">
            <p className="text-sm font-medium text-mechanica-700">Team@BookMyParts.com</p>
            <p className="text-sm text-muted-foreground">Dubai, UAE</p>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Render appropriate slide based on currentSlide state */}
      <div className="flex-1">
        {/* Content goes here */}
      </div>
    </div>
  );
};

export default PitchDeck;
