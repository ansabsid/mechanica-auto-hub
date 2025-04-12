
import React from "react";
import { CarFront, Car, TrendingUp, PieChart, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Label, 
  LabelList,
  Cell
} from "recharts";

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
                <div className="flex items-center">
                  <span className="text-xl font-bold mt-1 animate-fade-in">318,981</span>
                  <SourceLink source="Yallamotor.com" />
                </div>
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
                <div className="flex items-center">
                  <span className="text-xl font-bold mt-1 animate-fade-in">19.1%</span>
                  <SourceLink source="Arabian Business" />
                </div>
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
                <div className="flex items-center">
                  <span className="text-xl font-bold mt-1 animate-fade-in">$25.16B</span>
                  <SourceLink source="Globalnewswire" />
                </div>
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
                <div className="flex items-center">
                  <span className="text-xl font-bold mt-1 animate-fade-in">$20.15B</span>
                  <SourceLink source="Arabian Business" />
                </div>
                <PieChart className="h-4 w-4 text-amber-500 mt-2" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 border-amber-100 hover:bg-amber-100 transition-colors">
            <CardContent className="pt-4 pb-4">
              <div className="flex flex-col">
                <span className="text-sm text-amber-600 font-medium">2030 Projection</span>
                <div className="flex items-center">
                  <span className="text-xl font-bold mt-1 animate-fade-in">$48.15B</span>
                  <SourceLink source="JobXDubai" />
                </div>
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
                <div className="mt-1 flex items-center">
                  <span className="text-xs font-medium">Source: </span>
                  <span className="text-xs ml-1 text-amber-600">Arabian Business</span>
                </div>
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

      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all transform hover:scale-[1.02]">
        <div className="flex items-center mb-3">
          <div className="bg-green-100 p-3 rounded-full mr-3">
            <PieChart className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-green-700">UAE Automotive Parts Market</h3>
        </div>
        
        <div className="w-full h-[350px] mt-4">
          <AutoPartsMarketChart isMobile={isMobile} />
        </div>
      </div>
    </div>
  );
};

// Data for the automotive parts market chart
const chartData = [
  {
    name: "Aftermarket Parts",
    value2024: 7.3,
    value2033: 10.5,
    year2024: "2024",
    year2033: "2033",
  },
  {
    name: "E-Commerce Aftermarket",
    value2023: 0.5031,
    value2030: 1.44,
    year2023: "2023",
    year2030: "2030",
  },
];

// Chart component for automotive parts market
const AutoPartsMarketChart: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  // Color palette for the bars
  const colors = {
    value2024: "#4ade80", // Green
    value2033: "#bbf7d0", // Light Green
    value2023: "#3b82f6", // Blue
    value2030: "#93c5fd", // Light Blue
  };

  // Format the value to display in USD billion with 2 decimal places
  const formatValue = (value: number) => {
    return `$${value.toFixed(2)}B`;
  };

  // Transform data for the chart
  const transformedData = chartData.flatMap((item) => [
    {
      name: `${item.name}\n(${item.year2024 || item.year2023})`,
      segment: item.name,
      value: item.value2024 || item.value2023,
      color: item.value2024 ? colors.value2024 : colors.value2023,
      year: item.year2024 || item.year2023,
    },
    {
      name: `${item.name}\n(${item.year2033 || item.year2030})`,
      segment: item.name,
      value: item.value2033 || item.value2030,
      color: item.value2033 ? colors.value2033 : colors.value2030,
      year: item.year2033 || item.year2030,
    },
  ]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
        margin={{
          top: 20,
          right: 20,
          left: isMobile ? 0 : 20,
          bottom: isMobile ? 100 : 60,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          interval={0}
          angle={isMobile ? -45 : 0} 
          textAnchor={isMobile ? "end" : "middle"}
          height={isMobile ? 100 : 60}
          tickMargin={isMobile ? 5 : 15}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        >
          <Label
            value="Market Segments"
            position="insideBottom"
            offset={-10}
            style={{ textAnchor: "middle", fill: "#666", fontSize: 14 }}
          />
        </XAxis>
        <YAxis 
          tickFormatter={(value) => `$${value}B`}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        >
          <Label
            value="Market Size (USD Billion)"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle", fill: "#666", fontSize: 14 }}
            offset={isMobile ? 0 : 10}
          />
        </YAxis>
        <Bar dataKey="value" name="Market Size">
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={formatValue}
            style={{ fill: "#666", fontSize: isMobile ? 10 : 12, fontWeight: "bold" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

interface SourceLinkProps {
  source: string;
}

const SourceLink: React.FC<SourceLinkProps> = ({ source }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <button className="ml-1.5 text-gray-400 hover:text-gray-600 transition-colors" aria-label={`Source: ${source}`}>
            <ExternalLink size={12} />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-white p-2 text-xs border border-gray-200 shadow-sm">
          <p>Source: {source}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MarketSlide;
