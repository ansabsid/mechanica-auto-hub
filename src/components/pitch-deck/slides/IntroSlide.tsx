
import React from "react";
import { Rocket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

const IntroSlide: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleExploreClick = () => {
    navigate("/register");
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center w-full pb-10">
      <div className="relative mt-0 transition-transform hover:scale-110 duration-300">
        <div className="p-8 bg-gradient-to-br from-mechanica-100 to-white rounded-full shadow-xl">
          <Rocket size={isMobile ? 50 : 70} className="text-mechanica-500 animate-pulse" />
        </div>
        <div className="absolute -bottom-2 -right-2">
          <div className="p-3 bg-yellow-100 rounded-full shadow-md">
            <Sparkles size={isMobile ? 18 : 24} className="text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>
      <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold animate-fade-in mt-6 bg-gradient-to-r from-mechanica-600 to-mechanica-400 bg-clip-text text-transparent`}>
        Revolutionizing Auto Parts Purchasing
      </h2>
      <p className="text-center text-muted-foreground text-lg animate-fade-in max-w-xl" style={{animationDelay: "0.3s"}}>
        Connect customers with auto parts and trusted garages
      </p>
      <div className="mt-8 animate-fade-in" style={{animationDelay: "0.6s"}}>
        <Button
          variant="default"
          className="bg-gradient-to-r from-mechanica-500 to-mechanica-600 text-white font-bold py-2 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-none"
          onClick={handleExploreClick}
        >
          Explore Our Vision
        </Button>
      </div>
    </div>
  );
};

export default IntroSlide;
