
import React from "react";
import { Award, Target, Briefcase, DollarSign, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const AdvantagesSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
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
  );
};

export default AdvantagesSlide;
