
import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Rocket, Users, DollarSign, BarChart3, Target, Award, Lightbulb, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCapacitor } from "@/hooks/useCapacitor";

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
  
  // Define slides
  const slides: Slide[] = [
    {
      title: "BookMyParts",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6">
          <Rocket size={60} className="text-mechanica-500" />
          <h2 className="text-2xl font-bold">Revolutionizing Auto Parts Purchasing</h2>
          <p className="text-center text-muted-foreground">
            Connect customers with auto parts and trusted garages
          </p>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100"
    },
    {
      title: "The Problem",
      content: (
        <div className="space-y-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-red-500 font-bold">1</span>
              </div>
              <p>Car owners struggle to find genuine parts at fair prices</p>
            </li>
            <li className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-red-500 font-bold">2</span>
              </div>
              <p>Finding trusted mechanics for installation is time-consuming</p>
            </li>
            <li className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-red-500 font-bold">3</span>
              </div>
              <p>Lack of transparency in parts pricing and service quality</p>
            </li>
            <li className="flex items-start">
              <div className="bg-red-100 rounded-full p-2 mr-3 mt-1">
                <span className="text-red-500 font-bold">4</span>
              </div>
              <p>Fragmented market with no unified platform</p>
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
          <div className="flex items-center space-x-4">
            <div className="bg-mechanica-100 p-4 rounded-full">
              <Lightbulb className="h-6 w-6 text-mechanica-500" />
            </div>
            <div>
              <h3 className="font-medium">All-in-One Platform</h3>
              <p className="text-sm text-muted-foreground">Parts, garages and installations in one place</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-mechanica-100 p-4 rounded-full">
              <Users className="h-6 w-6 text-mechanica-500" />
            </div>
            <div>
              <h3 className="font-medium">Vetted Network</h3>
              <p className="text-sm text-muted-foreground">Trusted suppliers and garages</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-mechanica-100 p-4 rounded-full">
              <BarChart3 className="h-6 w-6 text-mechanica-500" />
            </div>
            <div>
              <h3 className="font-medium">Transparent Pricing</h3>
              <p className="text-sm text-muted-foreground">Compare prices and read reviews</p>
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
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">UAE Auto Parts Market</h3>
                <span className="text-green-500 font-bold">$4.3B</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "70%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Growing at 5.8% annually</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Vehicle Service Market</h3>
                <span className="text-mechanica-500 font-bold">$2.8B</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-mechanica-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Expected to reach $3.5B by 2026</p>
            </CardContent>
          </Card>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-purple-50 to-indigo-100"
    },
    {
      title: "Competitive Advantage",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-mechanica-50 border-mechanica-200">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Award className="h-8 w-8 text-mechanica-500 mb-2" />
                <h3 className="font-medium">Unified Platform</h3>
                <p className="text-xs text-muted-foreground mt-1">Parts + Service in one app</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Target className="h-8 w-8 text-mechanica-500 mb-2" />
                <h3 className="font-medium">Smart Matching</h3>
                <p className="text-xs text-muted-foreground mt-1">AI-powered part identification</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <Briefcase className="h-8 w-8 text-mechanica-500 mb-2" />
                <h3 className="font-medium">Garage Network</h3>
                <p className="text-xs text-muted-foreground mt-1">Vetted installation partners</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mechanica-50 border-mechanica-200">
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 text-mechanica-500 mb-2" />
                <h3 className="font-medium">Value Pricing</h3>
                <p className="text-xs text-muted-foreground mt-1">Transparent competitive rates</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-100"
    },
    {
      title: "Business Model",
      content: (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">1</span>
            </div>
            <div>
              <h3 className="font-medium">Commission Fee</h3>
              <p className="text-sm text-muted-foreground">8-12% from part suppliers and garages</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">2</span>
            </div>
            <div>
              <h3 className="font-medium">Premium Listing</h3>
              <p className="text-sm text-muted-foreground">Featured placement for partner garages</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="font-bold text-blue-600">3</span>
            </div>
            <div>
              <h3 className="font-medium">Subscription Model</h3>
              <p className="text-sm text-muted-foreground">Pro features for high-volume garages</p>
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
          <div className="relative border-l-2 border-mechanica-200 pl-6 pb-4 ml-4">
            <div className="absolute -left-2 w-4 h-4 rounded-full bg-mechanica-500"></div>
            <h3 className="font-medium">Q2 2025: Launch MVP</h3>
            <p className="text-sm text-muted-foreground">UAE market with core features</p>
          </div>
          
          <div className="relative border-l-2 border-mechanica-200 pl-6 pb-4 ml-4">
            <div className="absolute -left-2 w-4 h-4 rounded-full bg-mechanica-300"></div>
            <h3 className="font-medium">Q4 2025: Expand Network</h3>
            <p className="text-sm text-muted-foreground">100+ garage partnerships</p>
          </div>
          
          <div className="relative border-l-2 border-mechanica-200 pl-6 pb-4 ml-4">
            <div className="absolute -left-2 w-4 h-4 rounded-full bg-mechanica-300"></div>
            <h3 className="font-medium">Q2 2026: Regional Expansion</h3>
            <p className="text-sm text-muted-foreground">Saudi Arabia and Qatar markets</p>
          </div>
          
          <div className="relative pl-6 ml-4">
            <div className="absolute -left-2 w-4 h-4 rounded-full bg-mechanica-200"></div>
            <h3 className="font-medium">Q1 2027: Mobile App 2.0</h3>
            <p className="text-sm text-muted-foreground">Enhanced features and AI diagnostics</p>
          </div>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-indigo-50 to-blue-100"
    },
    {
      title: "Investment Opportunity",
      content: (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-medium text-center">Seeking $1.2M in Seed Funding</h3>
              
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Marketing & User Acquisition</span>
                  <span className="text-sm font-medium">35%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-mechanica-500 h-2 rounded-full" style={{ width: "35%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Technology Development</span>
                  <span className="text-sm font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-mechanica-500 h-2 rounded-full" style={{ width: "30%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Operations & Team</span>
                  <span className="text-sm font-medium">25%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-mechanica-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Reserve</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-mechanica-500 h-2 rounded-full" style={{ width: "10%" }}></div>
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
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-mechanica-200 mb-3 flex items-center justify-center text-mechanica-600 font-bold text-lg">
                CEO
              </div>
              <h3 className="font-medium text-center">Sarah Al-Mansouri</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Ex-Careem, 10+ years in tech</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-mechanica-200 mb-3 flex items-center justify-center text-mechanica-600 font-bold text-lg">
                CTO
              </div>
              <h3 className="font-medium text-center">Ahmed Khalid</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Ex-Amazon, Backend Expert</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-mechanica-200 mb-3 flex items-center justify-center text-mechanica-600 font-bold text-lg">
                COO
              </div>
              <h3 className="font-medium text-center">Omar Nasser</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">15+ years in automotive</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-mechanica-200 mb-3 flex items-center justify-center text-mechanica-600 font-bold text-lg">
                CMO
              </div>
              <h3 className="font-medium text-center">Layla Farhan</h3>
              <p className="text-xs text-center text-muted-foreground mt-1">Digital marketing specialist</p>
            </CardContent>
          </Card>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-gray-50 to-slate-100"
    },
    {
      title: "Thank You",
      content: (
        <div className="flex flex-col items-center justify-center space-y-6">
          <h2 className="text-2xl font-bold text-center">BookMyParts</h2>
          <p className="text-center text-lg">
            Connecting car owners with parts and trusted garages
          </p>
          <p className="text-center text-muted-foreground">
            Contact: info@bookmyparts.com
          </p>
        </div>
      ),
      bgColor: "bg-gradient-to-br from-mechanica-50 to-mechanica-100"
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1 && !isAnimating) {
      setIsAnimating(true);
      setDirection('next');
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 150);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0 && !isAnimating) {
      setIsAnimating(true);
      setDirection('prev');
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setTimeout(() => {
          setIsAnimating(false);
        }, 300);
      }, 150);
    }
  };

  // Get animation classes based on direction and animation state
  const getSlideAnimationClass = () => {
    if (!isAnimating) return "opacity-100 translate-x-0";
    
    if (direction === 'next') {
      return "opacity-0 -translate-x-10";
    } else {
      return "opacity-0 translate-x-10";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Progress bar */}
      <div className="w-full h-1 bg-gray-200">
        <div 
          className="h-full bg-mechanica-500 transition-all duration-500"
          style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
        ></div>
      </div>

      <div className={`flex-grow flex flex-col ${slides[currentSlide].bgColor} transition-colors duration-500`}>
        {/* Header */}
        <header className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-mechanica-600 transition-all duration-300">
            {slides[currentSlide].title}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-grow flex items-center justify-center p-6">
          <div 
            className={`w-full max-w-md mx-auto transition-all duration-300 ${getSlideAnimationClass()}`}
          >
            {slides[currentSlide].content}
          </div>
        </main>

        {/* Controls */}
        <footer className="p-4 flex justify-between items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide === 0 || isAnimating}
            className="transition-opacity duration-200 hover:bg-mechanica-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-sm text-gray-500">
            {currentSlide + 1} / {slides.length}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1 || isAnimating}
            className="transition-opacity duration-200 hover:bg-mechanica-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default PitchDeck;
