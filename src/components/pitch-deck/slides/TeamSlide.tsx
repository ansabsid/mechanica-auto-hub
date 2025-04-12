
import React, { useState } from "react";
import { Medal, Workflow, Zap, Lightbulb, Rocket, Coffee, Brain, Code, Flame } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const TeamSlide: React.FC = () => {
  const isMobile = useIsMobile();
  const [hoveredTeamMember, setHoveredTeamMember] = useState<number | null>(null);
  const [showTeamFunFact, setShowTeamFunFact] = useState<number | null>(null);
  const [isRotating, setIsRotating] = useState<number | null>(null);
  
  const teamMembers = [
    {
      name: "Mohammad Ansab Siddiqui",
      role: "Founder & CEO",
      initials: "MS",
      photo: "/lovable-uploads/3cba6a96-fa1a-4ab2-b825-24bdd2c67cd0.png",
      fact: "I once supported executive-level demos by day and went dune bashing by night — balance, right? 😎",
      description: "Visionary entrepreneur with a passion for automotive innovation",
      color: "from-blue-400 to-indigo-500",
      icon: Rocket
    },
    {
      name: "Asad Sayed",
      role: "COO",
      initials: "AS",
      fact: "He treats the desert like his personal stunt arena — if there's a dune, he's probably launched his car off it! 🏜️🚗💥",
      description: "Operations expert with a background in supply chain management",
      color: "from-emerald-400 to-green-500",
      icon: Code
    }
  ];
  
  const advisors = [
    {
      name: "Mohammad Hafeez Siddique",
      role: "Advisory Board",
      initials: "HS",
      fact: "Has visited over 30 countries across 5 continents",
      description: "Industry veteran with 20+ years in automotive technology",
      color: "from-amber-400 to-orange-500",
      icon: Brain
    }
  ];
  
  const handleCardClick = (index: number) => {
    setShowTeamFunFact(showTeamFunFact === index ? null : index);
    setIsRotating(index);
    setTimeout(() => setIsRotating(null), 1000);
  };
  
  return (
    <div className="space-y-6">
      <h3 className="text-center font-semibold text-lg text-mechanica-600 mb-6">The Visionaries Behind BookMyParts</h3>
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-2 gap-8'}`}>
        {teamMembers.map((member, index) => (
          <div 
            key={`team-${index}`}
            className={cn(
              "bg-white rounded-lg overflow-hidden shadow-md transition-all",
              "hover:shadow-lg transform hover:-translate-y-1 cursor-pointer",
              isRotating === index && "animate-[spin_1s_ease-in-out]"
            )}
            onMouseEnter={() => setHoveredTeamMember(index)}
            onMouseLeave={() => setHoveredTeamMember(null)}
            onClick={() => handleCardClick(index)}
          >
            <div className={`h-2 w-full bg-gradient-to-r ${member.color}`}></div>
            <div className="p-5 text-center">
              <div className="relative mx-auto w-24 h-24 mb-4">
                <Avatar className="h-24 w-24 mx-auto border-2 border-mechanica-200">
                  {member.photo ? (
                    <AvatarImage src={member.photo} alt={member.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className={`bg-gradient-to-br ${member.color} text-white text-xl font-bold`}>
                      {member.initials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                  <member.icon className="h-6 w-6 text-mechanica-500" />
                </div>
              </div>
              
              <h4 className="font-bold text-lg">{member.name}</h4>
              <p className="text-sm text-mechanica-600 font-medium">{member.role}</p>
              
              <div className="mt-3 text-sm text-mechanica-500 min-h-[40px]">
                {hoveredTeamMember === index && (
                  <p className="animate-fade-in">{member.description}</p>
                )}
              </div>
              
              {showTeamFunFact === index && (
                <div className="mt-3 bg-gradient-to-r from-mechanica-50 to-indigo-50 p-3 rounded-lg text-sm animate-fade-in">
                  <div className="flex items-center justify-center mb-1">
                    <Coffee className="h-4 w-4 text-mechanica-500 mr-1" />
                    <p className="font-medium text-mechanica-700">Fun Fact</p>
                  </div>
                  <p className="text-mechanica-600">{member.fact}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative mt-12 pt-8">
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-mechanica-100 px-4 py-1 rounded-full">
          <h4 className="text-sm font-medium text-mechanica-600">Advisory Board</h4>
        </div>
        
        <div className="max-w-xs mx-auto">
          {advisors.map((advisor, index) => (
            <div 
              key={`advisor-${index}`}
              className={cn(
                "bg-white rounded-lg overflow-hidden shadow-md transition-all",
                "hover:shadow-lg transform hover:-translate-y-1 cursor-pointer",
                isRotating === (index + teamMembers.length) && "animate-[spin_1s_ease-in-out]"
              )}
              onMouseEnter={() => setHoveredTeamMember(index + teamMembers.length)}
              onMouseLeave={() => setHoveredTeamMember(null)}
              onClick={() => handleCardClick(index + teamMembers.length)}
            >
              <div className={`h-2 w-full bg-gradient-to-r ${advisor.color}`}></div>
              <div className="p-5 text-center">
                <div className="relative mx-auto w-20 h-20 mb-3">
                  <Avatar className="h-20 w-20 mx-auto border-2 border-mechanica-200">
                    <AvatarFallback className={`bg-gradient-to-br ${advisor.color} text-white text-xl font-bold`}>
                      {advisor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                    <advisor.icon className="h-5 w-5 text-mechanica-500" />
                  </div>
                </div>
                
                <h4 className="font-bold text-lg">{advisor.name}</h4>
                <p className="text-sm text-mechanica-600 font-medium">{advisor.role}</p>
                
                <div className="mt-3 text-sm text-mechanica-500 min-h-[40px]">
                  {hoveredTeamMember === (index + teamMembers.length) && (
                    <p className="animate-fade-in">{advisor.description}</p>
                  )}
                </div>
                
                {showTeamFunFact === (index + teamMembers.length) && (
                  <div className="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg text-sm animate-fade-in">
                    <div className="flex items-center justify-center mb-1">
                      <Flame className="h-4 w-4 text-amber-500 mr-1" />
                      <p className="font-medium text-amber-700">Fun Fact</p>
                    </div>
                    <p className="text-amber-600">{advisor.fact}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-sm mt-8">
        <h4 className="font-medium text-center mb-3">Our Values</h4>
        <div className="flex justify-around items-center">
          <div className="text-center group">
            <div className="p-2 rounded-full bg-mechanica-100 group-hover:bg-mechanica-200 transition-colors">
              <Lightbulb className="h-6 w-6 text-mechanica-500 group-hover:text-mechanica-600 transition-colors" />
            </div>
            <p className="text-xs font-medium mt-1">Innovation</p>
          </div>
          <div className="text-center group">
            <div className="p-2 rounded-full bg-mechanica-100 group-hover:bg-mechanica-200 transition-colors">
              <Medal className="h-6 w-6 text-mechanica-500 group-hover:text-mechanica-600 transition-colors" />
            </div>
            <p className="text-xs font-medium mt-1">Quality</p>
          </div>
          <div className="text-center group">
            <div className="p-2 rounded-full bg-mechanica-100 group-hover:bg-mechanica-200 transition-colors">
              <Workflow className="h-6 w-6 text-mechanica-500 group-hover:text-mechanica-600 transition-colors" />
            </div>
            <p className="text-xs font-medium mt-1">Efficiency</p>
          </div>
          <div className="text-center group">
            <div className="p-2 rounded-full bg-mechanica-100 group-hover:bg-mechanica-200 transition-colors">
              <Zap className="h-6 w-6 text-mechanica-500 group-hover:text-mechanica-600 transition-colors" />
            </div>
            <p className="text-xs font-medium mt-1">Speed</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamSlide;
