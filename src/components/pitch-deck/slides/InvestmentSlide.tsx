
import React from "react";
import { Brain, Code, Flame, Cpu } from "lucide-react";

const InvestmentSlide: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-5 shadow-md">
        <h3 className="text-center font-semibold text-lg text-mechanica-600 mb-4">
          Seed Round - $1.5M
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <div className="bg-mechanica-100 p-3 rounded-full">
              <Brain className="h-5 w-5 text-mechanica-600" />
            </div>
            <div>
              <h4 className="font-medium">Product Development</h4>
              <p className="text-sm text-muted-foreground">40% - App refinement and new features</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-mechanica-100 p-3 rounded-full">
              <Code className="h-5 w-5 text-mechanica-600" />
            </div>
            <div>
              <h4 className="font-medium">Engineering Team</h4>
              <p className="text-sm text-muted-foreground">25% - Expanding developer resources</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-mechanica-100 p-3 rounded-full">
              <Flame className="h-5 w-5 text-mechanica-600" />
            </div>
            <div>
              <h4 className="font-medium">Marketing</h4>
              <p className="text-sm text-muted-foreground">20% - User and garage acquisition</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="bg-mechanica-100 p-3 rounded-full">
              <Cpu className="h-5 w-5 text-mechanica-600" />
            </div>
            <div>
              <h4 className="font-medium">Operations</h4>
              <p className="text-sm text-muted-foreground">15% - Infrastructure and scaling</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-mechanica-50 rounded-lg p-4 border border-mechanica-100">
        <h4 className="font-medium text-center mb-3">Financial Projections</h4>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500">Year 1</p>
            <p className="text-xl font-bold text-mechanica-700 mt-1">$850K</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500">Year 2</p>
            <p className="text-xl font-bold text-mechanica-700 mt-1">$2.4M</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500">Year 3</p>
            <p className="text-xl font-bold text-mechanica-700 mt-1">$5.7M</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs font-medium">Projected Break-Even: Q2 2026</p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSlide;
