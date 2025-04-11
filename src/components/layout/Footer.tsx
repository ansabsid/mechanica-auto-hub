
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-gray-900 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/bc5d716e-e89a-48a9-b038-082d8861b31d.png" 
                alt="BookMyParts Logo" 
                className="h-8" 
              />
            </div>
            <p className="text-gray-300 mb-4 text-center md:text-left">
              Connecting car owners with garages and suppliers across MENA to find the right parts and book servicing appointments.
            </p>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="space-y-2 text-center md:text-left">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/garages" className="text-gray-300 hover:text-white transition-colors">For Garages</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white mb-4 text-center md:text-left">Services</h3>
            <ul className="space-y-2 text-center md:text-left">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Find Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Book Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Sell Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">Join as Garage</a>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="col-span-1 flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-white mb-4 text-center md:text-left">Stay Updated</h3>
            <div className="flex w-full max-w-xs mx-auto md:mx-0 mb-6">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="rounded-r-none bg-gray-800 border-gray-700 text-white focus:ring-0 focus:border-gray-600 max-w-[70%]" 
              />
              <Button className="rounded-l-none bg-blue-600 hover:bg-blue-700 px-3">
                <Send size={16} />
              </Button>
            </div>
            
            <h3 className="font-semibold text-white mb-3 mt-6 text-center md:text-left">Contact Us</h3>
            <ul className="space-y-3 text-center md:text-left">
              <li className="flex items-start justify-center md:justify-start">
                <MapPin size={20} className="text-gray-300 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">Dubai, United Arab Emirates</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Phone size={20} className="text-gray-300 mr-3 flex-shrink-0" />
                <span className="text-gray-300">+971 552552476</span>
              </li>
              <li className="flex items-center justify-center md:justify-start">
                <Mail size={20} className="text-gray-300 mr-3 flex-shrink-0" />
                <span className="text-gray-300">support@bookmyparts.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} BookMyParts. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
