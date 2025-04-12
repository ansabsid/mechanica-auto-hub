
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ProblemSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-4">
      <ul className="space-y-5">
        <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
          <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
            <span className="text-red-500 font-bold text-lg">1</span>
          </div>
          <div className="animate-fade-in" style={{animationDelay: "0.1s"}}>
            <h3 className="font-medium mb-1">Parts Uncertainty</h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Car owners struggle to find genuine parts at fair prices
            </p>
          </div>
        </li>
        <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
          <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
            <span className="text-red-500 font-bold text-lg">2</span>
          </div>
          <div className="animate-fade-in" style={{animationDelay: "0.3s"}}>
            <h3 className="font-medium mb-1">Trust Issues</h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              Finding trusted mechanics for installation is time-consuming
            </p>
          </div>
        </li>
        <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
          <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
            <span className="text-red-500 font-bold text-lg">3</span>
          </div>
          <div className="animate-fade-in" style={{animationDelay: "0.5s"}}>
            <h3 className="font-medium mb-1">Lack of Transparency</h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              No clarity in parts pricing and service quality
            </p>
          </div>
        </li>
        <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
          <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
            <span className="text-red-500 font-bold text-lg">4</span>
          </div>
          <div className="animate-fade-in" style={{animationDelay: "0.7s"}}>
            <h3 className="font-medium mb-1">Fragmented Market</h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
              No unified platform connecting all stakeholders
            </p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ProblemSlide;
