
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ProblemSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      {/* Customer-Facing Problems */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-blue-600">Customer-Facing Problems</h3>
        <ul className="space-y-4">
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-red-50">
            <div className="bg-red-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-red-500 font-bold text-lg">1</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.1s"}}>
              <h3 className="font-medium mb-1">Parts Availability Crisis</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Spare parts for OEM, aftermarket, or used inventory are often unavailable, causing service delays.
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
                Finding trustworthy, skilled auto mechanics in niche areas like detailing, electrical, engine, or body work—at a convenient time and location with quick turnaround during workdays—is a common market challenge.
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

      {/* Garage-Facing Problems */}
      <div>
        <h3 className="text-lg font-bold mb-3 text-green-600">Garage-Facing Problems</h3>
        <ul className="space-y-4">
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-green-50">
            <div className="bg-green-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-green-500 font-bold text-lg">1</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "0.9s"}}>
              <h3 className="font-medium mb-1">Inventory Management Challenges</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Limited connectivity to retail part vendors (OEM, aftermarket, and used parts) for efficient inventory sourcing and management
              </p>
            </div>
          </li>
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-green-50">
            <div className="bg-green-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-green-500 font-bold text-lg">2</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "1.1s"}}>
              <h3 className="font-medium mb-1">Limited Marketing Exposure</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Lack of proper platform to showcase expertise and attract new customers in a competitive market
              </p>
            </div>
          </li>
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-green-50">
            <div className="bg-green-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-green-500 font-bold text-lg">3</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "1.3s"}}>
              <h3 className="font-medium mb-1">Operational Inefficiencies</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Difficulties in managing timely appointments and service requests without a centralized booking system
              </p>
            </div>
          </li>
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-green-50">
            <div className="bg-green-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-green-500 font-bold text-lg">4</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "1.5s"}}>
              <h3 className="font-medium mb-1">Technological Gaps</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Absence of user-friendly interfaces that effectively connect them to customers and streamline operations
              </p>
            </div>
          </li>
          <li className="flex items-start transform hover:scale-105 transition-all cursor-pointer rounded-lg p-2 hover:bg-green-50">
            <div className="bg-green-100 rounded-full p-3 mr-4 mt-1 shadow-md">
              <span className="text-green-500 font-bold text-lg">5</span>
            </div>
            <div className="animate-fade-in" style={{animationDelay: "1.7s"}}>
              <h3 className="font-medium mb-1">B2B Connectivity Limitations</h3>
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                Insurance companies, leasing firms, and corporate fleets rely on single garage partnerships, limiting access to broader networks of niche automotive expertise
              </p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProblemSlide;
