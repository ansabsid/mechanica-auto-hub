
import React from "react";
import { Settings, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContactSlide: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="relative animate-bounce">
        <Settings className="h-12 w-12 text-mechanica-500" />
        <div className="absolute -right-1 -bottom-1">
          <Coffee className="h-6 w-6 text-amber-500" />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-mechanica-600">Let's Build The Future Together</h3>
        <p className="text-muted-foreground mt-2">Ready to transform the auto parts and service industry?</p>
      </div>
      
      <div className="flex space-x-4">
        <Button variant="mechanica" className="rounded-full shadow-md hover:shadow-lg transition-all">
          Contact Us
        </Button>
        <Button variant="outline" className="rounded-full border-mechanica-300 shadow-sm hover:bg-mechanica-50">
          Download Pitch Deck
        </Button>
      </div>
      
      <div className="pt-6 border-t border-gray-200 w-full max-w-xs mx-auto mt-4">
        <p className="text-sm font-medium text-mechanica-700">Team@BookMyParts.com</p>
        <p className="text-sm text-muted-foreground">Dubai, UAE</p>
      </div>
    </div>
  );
};

export default ContactSlide;
