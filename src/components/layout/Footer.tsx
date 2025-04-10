
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 pt-12 pb-8">
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
            <p className="text-gray-300 mb-4">
              Connecting car owners with garages and suppliers across MENA to find the right parts and book servicing appointments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/garages" className="text-gray-300 hover:text-white">For Garages</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Find Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Book Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Sell Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Join as Garage</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-gray-300 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-300">Dubai, United Arab Emirates</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-gray-300 mr-3 flex-shrink-0" />
                <span className="text-gray-300">+971 50 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-gray-300 mr-3 flex-shrink-0" />
                <span className="text-gray-300">support@bookmyparts.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Bookmyparts. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">
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
