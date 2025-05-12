
import React from "react";
import { Settings, Coffee, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ContactSlide: React.FC = () => {
  const navigate = useNavigate();
  
  const handleContactClick = () => {
    navigate("/contact");
  };
  
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8">
      <div className="relative group cursor-pointer transition-all duration-500 hover:scale-110">
        <div className="p-6 bg-gradient-to-br from-mechanica-100 to-white rounded-full shadow-xl">
          <Settings className="h-12 w-12 text-mechanica-500 group-hover:rotate-90 transition-transform duration-1000" />
        </div>
        <div className="absolute -right-1 -bottom-1">
          <div className="p-2 bg-amber-100 rounded-full shadow-md">
            <Coffee className="h-6 w-6 text-amber-500 group-hover:rotate-12 transition-transform" />
          </div>
        </div>
      </div>
      
      <div className="transform hover:scale-105 transition-transform duration-300">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-mechanica-600 to-mechanica-400 bg-clip-text text-transparent">Let's Build The Future Together</h3>
        <p className="text-muted-foreground mt-2">Ready to transform the auto parts and service industry?</p>
      </div>
      
      <div>
        <Button 
          variant="mechanica" 
          className="bg-gradient-to-r from-mechanica-500 to-mechanica-600 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 border-none px-8 py-2.5"
          onClick={handleContactClick}
        >
          Contact Us
        </Button>
      </div>
      
      <div className="pt-6 border-t border-gray-200 w-full max-w-xs mx-auto mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2">
          <Mail className="h-4 w-4 text-mechanica-600" />
          <p className="text-sm font-medium text-mechanica-700 hover:text-mechanica-500 transition-colors">Team@BookMyParts.com</p>
        </div>
        <div className="flex items-center justify-center gap-2">
          <MapPin className="h-4 w-4 text-mechanica-600" />
          <p className="text-sm text-muted-foreground">Dubai, UAE</p>
        </div>
      </div>
    </div>
  );
};

export default ContactSlide;
