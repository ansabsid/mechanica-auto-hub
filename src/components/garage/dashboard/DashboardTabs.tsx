
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Calendar, Clock, MapPin } from "lucide-react";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  isMobile: boolean;
  children: React.ReactNode;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  isMobile,
  children,
}) => {
  return (
    <Tabs defaultValue={activeTab} className="w-full" onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-4 mb-4 md:mb-8 md:max-w-md md:mx-auto">
        <TabsTrigger value="inventory" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
          <ShoppingBag size={isMobile ? 16 : 18} /> {isMobile ? "Items" : "Inventory"}
        </TabsTrigger>
        <TabsTrigger value="appointments" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
          <Calendar size={isMobile ? 16 : 18} /> {isMobile ? "Appts" : "Appointments"}
        </TabsTrigger>
        <TabsTrigger value="service-slots" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
          <Clock size={isMobile ? 16 : 18} /> {isMobile ? "Slots" : "Service Slots"}
        </TabsTrigger>
        <TabsTrigger value="garages" className="flex items-center justify-center gap-1 md:gap-2 py-1 md:py-2 px-1 md:px-3 text-xs md:text-sm">
          <MapPin size={isMobile ? 16 : 18} /> Garages
        </TabsTrigger>
      </TabsList>

      {children}
    </Tabs>
  );
};
