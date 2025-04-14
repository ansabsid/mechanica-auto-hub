
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  Calendar, 
  Clock, 
  Settings,
  ShoppingBag
} from "lucide-react";

interface TabOption {
  id: string;
  label: string;
  icon: string;
}

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
  isMobile: boolean;
  tabs?: TabOption[];
}

const getIconComponent = (iconName: string, className: string) => {
  switch (iconName) {
    case "package":
      return <Package className={className} />;
    case "calendar":
      return <Calendar className={className} />;
    case "clock":
      return <Clock className={className} />;
    case "settings":
      return <Settings className={className} />;
    case "shopping-bag":
      return <ShoppingBag className={className} />;
    default:
      return <Package className={className} />;
  }
};

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  onTabChange, 
  children,
  isMobile,
  tabs = [
    { id: "inventory", label: "My Inventory", icon: "package" },
    { id: "appointments", label: "Appointments", icon: "calendar" },
    { id: "service-slots", label: "Service Slots", icon: "clock" },
    { id: "garages", label: "Garage Details", icon: "settings" }
  ]
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full mt-4">
      <TabsList className="grid grid-cols-2 md:flex md:flex-wrap gap-1 bg-transparent h-auto p-0 mb-6">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id}
            className={`
              flex items-center justify-center gap-1.5 md:gap-2 data-[state=active]:text-mechanica-700
              data-[state=active]:bg-white data-[state=active]:shadow-sm h-10 md:h-11 rounded-md border
              hover:bg-gray-50 transition-colors data-[state=active]:border-mechanica-200
              flex-grow md:flex-grow-0 text-xs md:text-sm py-2 px-3 md:px-4
            `}
          >
            {getIconComponent(tab.icon, "h-4 w-4")}
            <span className={isMobile ? "text-xs font-medium" : "font-medium"}>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {children}
    </Tabs>
  );
};
