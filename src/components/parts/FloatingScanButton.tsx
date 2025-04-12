
import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";

const FloatingScanButton = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Don't show on scanner page, home page, or pitch deck page
  if (!isMobile || 
      location.pathname === "/scanner" || 
      location.pathname === "/" || 
      location.pathname === "/scan" || 
      location.pathname === "/pitch-deck") {
    return null;
  }
  
  return (
    <Link to="/scanner" className="fixed bottom-24 right-4 z-50">
      <Button 
        size="icon" 
        className="rounded-full w-14 h-14 shadow-lg bg-mechanica-500 hover:bg-mechanica-600"
      >
        <Camera className="h-6 w-6" />
        <span className="sr-only">Scan Part</span>
      </Button>
    </Link>
  );
};

export default FloatingScanButton;
