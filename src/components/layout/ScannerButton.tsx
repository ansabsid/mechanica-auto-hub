
import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScannerButton = () => {
  return (
    <Link to="/scanner" className="fixed bottom-16 right-4 z-50 md:bottom-8">
      <Button 
        size="icon" 
        className="rounded-full w-12 h-12 shadow-lg bg-mechanica-500 hover:bg-mechanica-600"
      >
        <Camera className="h-5 w-5" />
        <span className="sr-only">Scan Part</span>
      </Button>
    </Link>
  );
};

export default ScannerButton;
