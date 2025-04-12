import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Rocket, Users, DollarSign, BarChart3, Target, Award, Lightbulb, Briefcase, CarFront, Car, TrendingUp, PieChart, Star, Sparkles, Gauge, RotateCw, Medal, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCapacitor } from "@/hooks/useCapacitor";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Define slide interface
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
  
  // Clear any pending timers on unmount
  useEffect(() => {
    return () => {
      if (slideTimerRef.current !== null) {
        window.clearTimeout(slideTimerRef.current);
      }
    };
  }, []);

  // Show confetti animation when reaching the thank you slide
  useEffect(() => {
    if (currentSlide === 9) { // Thank You slide index
      setIsConfettiActive(true);
      const timer = setTimeout(() => {
        setIsConfettiActive(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);
  
  // Define slides
  const slides: Slide[] = [
    {
      title: "BookMyParts",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6 text-center w-full">
          <div className="relative">
            <Rocket size={80} className="text-mechanica-500 animate-bounce" />
            <div className="absolute -bottom-2 -right-2">
              <Sparkles size={24} className="text-yellow-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-3xl font-bold animate-fade-in">Revolutionizing Auto Parts Purchasing</h2>
          <p className="text-center text-muted-foreground text-lg animate-fade-in" style={{animationDelay: "0.3s"}}>
            Connect customers with auto parts and trusted garages
          </p>
          <div className="mt-6 animate-fade-in" style={{animationDelay: "0.6s"}}>
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
                <p className="text-muted-foreground">Car owners struggle to find genuine parts at fair prices</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">2</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
                <h3 className="font-medium mb-1">Trust Issues</h3>
                <p className="text-muted-foreground">Finding trusted mechanics for installation is time-consuming</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">3</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.5s"}}>
                <h3 className="font-medium mb-1">Lack of Transparency</h3>
                <p className="text-muted-foreground">No clarity in parts pricing and service quality</p>
              </div>
            </li>
            <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
              <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
                <span className="text-red-500 font-bold text-lg">4</span>
              </div>
              <div className="animate-fade-in" style={{animationDelay: "0.7s"}}>
                <h3 className="font-medium mb-1">Fragmented Market</h3>
                <p className="text-muted-foreground">No unified platform connecting all stakeholders</p>
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
          <Carousel className="w-full">
            <CarouselContent>
              <CarouselItem>
                <div className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-md">
                  <div className="bg-mechanica-100 p-5 rounded-full animate-pulse">
                    <Lightbulb className="h-8 w-8 text-mechanica-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">All-in-One Platform</h3>
                    <p className="text-sm text-muted-foreground">Parts, service requests, and installations in one place</p>
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
                    <p className="text-sm text-muted-foreground">Schedule appointments with local trusted mechanics</p>
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
                    <p className="text-sm text-muted-foreground">Compare prices and read reviews</p>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          
          <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
            <h3 className="font-medium mb-2 text-center text-mechanica-600">How It Works</h3>
            <div className="flex justify-between items-center">
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <Gauge className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className="text-xs text-center">Diagnose your car issue</p>
              </div>
              <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <Car className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className="text-xs text-center">Find the right parts</p>
              </div>
              <div className="h-0.5 w-[10%] bg-mechanica-200"></div>
              <div className="flex flex-col items-center max-w-[30%]">
                <div className="bg-mechanica-100 p-3 rounded-full mb-2">
                  <RotateCw className="h-6 w-6 text-mechanica-500" />
                </div>
                <p className="text-xs text-center">Get it installed</p>
              </div>
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
          {/* New Car Market Section */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
            <div className="flex items-center mb-3">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <CarFront className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-blue-700">New Car Market</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          
          {/* Used Car Market Section */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
            <div className="flex items-center mb-3">
              <div className="bg-amber-100 p-3 rounded-full mr-3">
                <Car className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-medium text-amber-700">Used Car Market</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <div className="grid grid-cols-2 gap-4">
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
          
          <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
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
                <span className="animate-pulse inline-block">💰</span> Seeking $1.2M in Seed Funding
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
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-md transition-all transform hover:-translate-y-1 cursor-pointer">
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-mechanica-200 mb-4 flex items-center justify-center text-mechanica-600 font-bold text-lg relative overflow-hidden hover:scale-110 transition-transform">
                <
