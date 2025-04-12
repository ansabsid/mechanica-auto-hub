
import React, { useState } from "react";
import { Medal, Workflow, Zap } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const TeamSlide: React.FC = () => {
  const isMobile = useIsMobile();
  const [hoveredTeamMember, setHoveredTeamMember] = useState<number | null>(null);
  const [showTeamFunFact, setShowTeamFunFact] = useState<number | null>(null);
  
  return (
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
  );
};

export default TeamSlide;
