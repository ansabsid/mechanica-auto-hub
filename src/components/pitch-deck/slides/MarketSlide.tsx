
import React from "react";
import { CarFront, Car, TrendingUp, PieChart, ExternalLink, BarChart2 } from "lucide-react";
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
  Cell,
  Tooltip as RechartsTooltip
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
          <div className="bg-purple-100 p-3 rounded-full mr-3">
            <BarChart2 className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-purple-700">UAE Automotive Parts Market – Revenue Growth</h3>
        </div>
        
        <div className="w-full h-[350px] mt-4">
          <AutoPartsMarketChart isMobile={isMobile} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 text-xs text-gray-500">
          <div className="flex items-center mb-2 md:mb-0">
            <span className="font-medium mr-1">Aftermarket Parts:</span>
            <span>IMARC Group, UAE Automotive Aftermarket Market</span>
            <SourceLink source="IMARC Group (CAGR: 3.8%)" />
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">E-Commerce Aftermarket:</span>
            <span>P&S Intelligence, UAE E-Commerce Automotive Aftermarket Analysis</span>
            <SourceLink source="P&S Intelligence (CAGR: 16.3%)" />
          </div>
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
    source: "IMARC Group",
    cagr: "3.8%"
  },
  {
    name: "E-Commerce Aftermarket",
    value2023: 0.5031,
    value2030: 1.44,
    year2023: "2023",
    year2030: "2030",
    source: "P&S Intelligence",
    cagr: "16.3%"
  },
];

// Improved chart component for automotive parts market
const AutoPartsMarketChart: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  // Enhanced color palette for the bars
  const colors = {
    value2024: "#9b87f5", // Purple
    value2033: "#d3e4fd", // Light Blue
    value2023: "#7E69AB", // Secondary Purple
    value2030: "#E5DEFF", // Soft Purple
  };

  // Format the value to display in USD billion with 2 decimal places
  const formatValue = (value: number) => {
    return `$${value.toFixed(2)}B`;
  };

  // Custom tooltip formatter
  const tooltipFormatter = (value: number) => {
    return [`$${value.toFixed(2)} Billion`, 'Market Size'];
  };

  // Transform data for the chart
  const transformedData = chartData.flatMap((item) => [
    {
      name: item.name,
      segment: item.name,
      value: item.value2024 || item.value2023,
      year: item.year2024 || item.year2023,
      fullLabel: `${item.name} (${item.year2024 || item.year2023})`,
      color: item.value2024 ? colors.value2024 : colors.value2023,
    },
    {
      name: item.name,
      segment: item.name,
      value: item.value2033 || item.value2030,
      year: item.year2033 || item.year2030,
      fullLabel: `${item.name} (${item.year2033 || item.year2030})`,
      color: item.value2033 ? colors.value2033 : colors.value2030,
    },
  ]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={transformedData}
        margin={{
          top: 25,
          right: 30,
          left: isMobile ? 10 : 25,
          bottom: isMobile ? 80 : 60,
        }}
        barGap={isMobile ? 3 : 8}
        barCategoryGap={isMobile ? 15 : 30}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="fullLabel" 
          interval={0}
          angle={isMobile ? -45 : -20} 
          textAnchor="end"
          height={isMobile ? 100 : 70}
          tickMargin={isMobile ? 5 : 10}
          tick={{ fontSize: isMobile ? 10 : 12, fill: '#555' }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        />
        <YAxis 
          tickFormatter={(value) => `$${value}B`}
          tick={{ fontSize: isMobile ? 10 : 12, fill: '#555' }}
          axisLine={{ stroke: '#e0e0e0' }}
          tickLine={{ stroke: '#e0e0e0' }}
        >
          <Label
            value="Market Size (USD Billion)"
            angle={-90}
            position="insideLeft"
            style={{ textAnchor: "middle", fill: "#666", fontSize: 13, fontWeight: 500 }}
            offset={isMobile ? -5 : 0}
          />
        </YAxis>
        <RechartsTooltip 
          formatter={tooltipFormatter}
          labelFormatter={(label) => label}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            border: '1px solid #e0e0e0',
            borderRadius: '8px', 
            padding: '10px', 
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Bar 
          dataKey="value" 
          name="Market Size" 
          radius={[4, 4, 0, 0]}
          maxBarSize={isMobile ? 30 : 50}
        >
          {transformedData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color} 
              stroke="rgba(0, 0, 0, 0.05)"
              strokeWidth={1}
            />
          ))}
          <LabelList
            dataKey="value"
            position="top"
            formatter={formatValue}
            style={{ 
              fill: "#555", 
              fontSize: isMobile ? 10 : 12, 
              fontWeight: "600",
              textShadow: "0 1px 2px rgba(255, 255, 255, 0.8)"
            }}
            offset={5}
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
