
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#9b87f5] pt-12 pb-8 border-t border-[#7E69AB]">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="mb-4">
              <img 
                src="/lovable-uploads/bc5d716e-e89a-48a9-b038-082d8861b31d.png" 
                alt="Bookmyparts Logo" 
                className="h-8" 
              />
            </div>
            <p className="text-white mb-4">
              Connecting car owners with garages and suppliers across MENA to find the right parts and book servicing appointments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-200" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-gray-200" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white hover:text-gray-200">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-white hover:text-gray-200">About Us</Link>
              </li>
              <li>
                <Link to="/garages" className="text-white hover:text-gray-200">For Garages</Link>
              </li>
              <li>
                <Link to="/contact" className="text-white hover:text-gray-200">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-white hover:text-gray-200">Find Parts</a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-gray-200">Book Service</a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-gray-200">Sell Parts</a>
              </li>
              <li>
                <a href="#" className="text-white hover:text-gray-200">Join as Garage</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-white mt-1 mr-3 flex-shrink-0" />
                <span className="text-white">Dubai, United Arab Emirates</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-white mr-3 flex-shrink-0" />
                <span className="text-white">+971 50 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-white mr-3 flex-shrink-0" />
                <span className="text-white">support@bookmyparts.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#7E69AB] mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white text-sm">
              © {new Date().getFullYear()} Bookmyparts. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white hover:text-gray-200 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-white hover:text-gray-200 text-sm">
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
