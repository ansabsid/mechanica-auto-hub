
import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";

const FloatingScanButton = () => {
  const isMobile = useMobile();
  
  if (!isMobile) return null;
  
  return (
    <Link to="/scanner" className="fixed bottom-20 right-4 z-50">
      <Button 
        size="lg" 
        className="rounded-full w-14 h-14 shadow-lg bg-mechanica-500 hover:bg-mechanica-600"
      >
        <Camera className="h-6 w-6" />
        <span className="sr-only">Scan Part</span>
      </Button>
    </Link>
  );
};

export default FloatingScanButton;
