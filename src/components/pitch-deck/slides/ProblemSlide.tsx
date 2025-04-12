
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, LayoutList, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

const ProblemSlide: React.FC = () => {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  
  const IconWrapper = ({ 
    children, 
    className,
    color
  }: { 
    children: React.ReactNode; 
    className?: string;
    color: string;
  }) => (
    <div className={cn(`bg-${color}-100 rounded-full p-3 mr-4 mt-1 shadow-md`, className)}>
      {children}
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-2">
        <div className="bg-gray-100 rounded-lg flex p-1">
          <button 
            onClick={() => setViewMode("list")} 
            className={cn(
              "p-1.5 rounded-md transition-colors", 
              viewMode === "list" ? "bg-white shadow-sm" : "text-gray-500"
            )}
            aria-label="List view"
          >
            <LayoutList size={16} />
          </button>
          <button 
            onClick={() => setViewMode("grid")} 
            className={cn(
              "p-1.5 rounded-md transition-colors", 
              viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-500"
            )}
            aria-label="Grid view"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      <Tabs defaultValue="customer" className="w-full">
        <TabsList className="w-full mb-4 bg-gradient-to-r from-gray-50 to-slate-100">
          <TabsTrigger value="customer" className="flex-1">Customer-Facing Problems</TabsTrigger>
          <TabsTrigger value="garage" className="flex-1">Garage-Facing Problems</TabsTrigger>
        </TabsList>
        
        <TabsContent value="customer" className="mt-0">
          <ul className={cn(
            "gap-4", 
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2" : "space-y-4"
          )}>
            <ProblemItem
              number="1"
              title="Parts Availability Crisis"
              description="Spare parts for OEM, aftermarket, or used inventory are often unavailable, causing service delays."
              color="red"
              delay="0.1s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="2"
              title="Trust Issues"
              description="Finding trustworthy, skilled auto mechanics in niche areas like detailing, electrical, engine, or body work—at a convenient time and location with quick turnaround during workdays—is a common market challenge."
              color="red"
              delay="0.3s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="3"
              title="Lack of Transparency"
              description="No clarity in parts pricing and service quality"
              color="red"
              delay="0.5s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="4"
              title="Fragmented Market"
              description="No unified platform connecting all stakeholders"
              color="red"
              delay="0.7s"
              viewMode={viewMode}
            />
          </ul>
        </TabsContent>
        
        <TabsContent value="garage" className="mt-0">
          <ul className={cn(
            "gap-4", 
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2" : "space-y-4"
          )}>
            <ProblemItem
              number="1"
              title="Inventory Management Challenges"
              description="Limited connectivity to retail part vendors (OEM, aftermarket, and used parts) for efficient inventory sourcing and management"
              color="green"
              delay="0.9s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="2"
              title="Limited Marketing Exposure"
              description="Lack of proper platform to showcase expertise and attract new customers in a competitive market"
              color="green"
              delay="1.1s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="3"
              title="Operational Inefficiencies"
              description="Difficulties in managing timely appointments and service requests without a centralized booking system"
              color="green"
              delay="1.3s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="4"
              title="Technological Gaps"
              description="Absence of user-friendly interfaces that effectively connect them to customers and streamline operations"
              color="green"
              delay="1.5s"
              viewMode={viewMode}
            />
            <ProblemItem
              number="5"
              title="B2B Connectivity Limitations"
              description="Insurance companies, leasing firms, and corporate fleets rely on single garage partnerships, limiting access to broader networks of niche automotive expertise"
              color="green"
              delay="1.7s"
              viewMode={viewMode}
            />
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ProblemItemProps {
  number: string;
  title: string;
  description: string;
  color: "red" | "green";
  delay: string;
  viewMode: "grid" | "list";
}

const ProblemItem: React.FC<ProblemItemProps> = ({ 
  number, 
  title, 
  description, 
  color, 
  delay,
  viewMode
}) => {
  const isMobile = useIsMobile();
  
  return (
    <li className={cn(
      "transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2",
      color === "red" ? "hover:bg-red-50" : "hover:bg-green-50",
      viewMode === "grid" ? "flex flex-col" : "flex items-start"
    )}>
      <div className={cn(
        `bg-${color}-100 rounded-full p-3 shadow-md`,
        viewMode === "grid" ? "self-start mb-2" : "mr-4 mt-1"
      )}>
        <span className={`text-${color}-500 font-bold text-lg`}>{number}</span>
      </div>
      <div className="animate-fade-in" style={{animationDelay: delay}}>
        <h3 className="font-medium mb-1">{title}</h3>
        <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
          {description}
        </p>
      </div>
    </li>
  );
};

export default ProblemSlide;
