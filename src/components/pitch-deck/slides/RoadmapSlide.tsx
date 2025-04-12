
import React from "react";

const RoadmapSlide: React.FC = () => {
  return (
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
        <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-400 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
          2
        </div>
        <div className="animate-fade-in">
          <h3 className="font-medium text-lg">Q4 2025: Regional Expansion</h3>
          <p className="text-sm text-muted-foreground">Saudi Arabia and Qatar markets</p>
          <div className="mt-2 flex space-x-2">
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
              Multiple Languages
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
              Local Partnerships
            </span>
          </div>
        </div>
      </div>
      
      <div className="relative border-l-2 border-mechanica-200 pl-8 pb-8 ml-4">
        <div className="absolute -left-[18px] w-9 h-9 rounded-full bg-mechanica-300 flex items-center justify-center text-white font-bold hover:scale-110 transition-transform cursor-pointer shadow-md">
          3
        </div>
        <div className="animate-fade-in">
          <h3 className="font-medium text-lg">Q2 2026: Enhanced Features</h3>
          <p className="text-sm text-muted-foreground">AI diagnostics and subscription tiers</p>
          <div className="mt-2 flex space-x-2">
            <span className="inline-flex items-center rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-medium text-cyan-800">
              Premium Plans
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
              Advanced AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSlide;
