
import React from "react";
import { CarFront, Car, TrendingUp, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

const MarketSlide: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
        <div className="flex items-center mb-3">
          <div className="bg-blue-100 p-3 rounded-full mr-3">
            <CarFront className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-blue-700">New Car Market</h3>
        </div>
        
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-3`}>
          <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-blue-600 font-medium">2024 Sales</span>
                <span className="text-xl font-bold mt-1 animate-fade-in">318,981</span>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15.7% YoY</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-blue-600 font-medium">Growth Rate</span>
                <span className="text-xl font-bold mt-1 animate-fade-in">19.1%</span>
                <div className="flex items-center mt-1">
                  <span className="text-xs">2023: 27.2% (330,532 units)</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 border-blue-100 hover:bg-blue-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-blue-600 font-medium">2032 Forecast</span>
                <span className="text-xl font-bold mt-1 animate-fade-in">$25.16B</span>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">CAGR: 15.29%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
        <div className="flex items-center mb-3">
          <div className="bg-amber-100 p-3 rounded-full mr-3">
            <Car className="h-5 w-5 text-amber-600" />
          </div>
          <h3 className="text-lg font-medium text-amber-700">Used Car Market</h3>
        </div>
        
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-3`}>
          <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-amber-600 font-medium">2022 Market Value</span>
                <span className="text-xl font-bold mt-1 animate-fade-in">$20.15B</span>
                <PieChart className="h-4 w-4 text-amber-500 mt-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-amber-600 font-medium">2030 Projection</span>
                <span className="text-xl font-bold mt-1 animate-fade-in">$48.15B</span>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">CAGR: 11.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-amber-600 font-medium">Consumer Trends</span>
                <div className="mt-2">
                  <div className="flex justify-between text-xs">
                    <span>AED 20K-30K</span>
                    <span className="font-medium">High Demand</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 my-1 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full animate-[grow_1.5s_ease-out]" style={{ width: "80%" }}></div>
                  </div>
                  
                  <div className="flex justify-between text-xs mt-2">
                    <span>AED 50K-80K</span>
                    <span className="font-medium">High Demand</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 my-1 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full animate-[grow_1.5s_ease-out_0.3s]" style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketSlide;
