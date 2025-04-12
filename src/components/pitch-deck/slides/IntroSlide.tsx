
import React from "react";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const IntroSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center w-full pb-10">
      <div className="relative mt-0">
        <Rocket size={isMobile ? 50 : 70} className="text-mechanica-500 animate-bounce" />
        <div className="absolute -bottom-2 -right-2">
          <Sparkles size={isMobile ? 18 : 24} className="text-yellow-400 animate-pulse" />
        </div>
      </div>
      <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold animate-fade-in mt-0`}>
        Revolutionizing Auto Parts Purchasing
      </h2>
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
  );
};

export default IntroSlide;
