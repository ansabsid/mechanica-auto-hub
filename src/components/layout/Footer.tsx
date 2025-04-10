
import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-12 pb-8 border-t border-gray-200">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="mb-4">
              <div className="bg-mechanica-100 text-mechanica-800 font-bold p-2 rounded-lg inline-block">
                <span className="text-mechanica-600 text-xl">Bookmyparts</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Connecting car owners with garages and suppliers across MENA to find the right parts and book servicing appointments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-mechanica-600" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-mechanica-600" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-mechanica-600" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-mechanica-600" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-mechanica-600">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-mechanica-600">About Us</Link>
              </li>
              <li>
                <Link to="/garages" className="text-gray-600 hover:text-mechanica-600">For Garages</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-mechanica-600">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-mechanica-600">Find Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-mechanica-600">Book Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-mechanica-600">Sell Parts</a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-mechanica-600">Join as Garage</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-mechanica-500 mt-1 mr-3 flex-shrink-0" />
                <span className="text-gray-600">Dubai, United Arab Emirates</span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-mechanica-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600">+971 50 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-mechanica-500 mr-3 flex-shrink-0" />
                <span className="text-gray-600">support@bookmyparts.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Bookmyparts. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-mechanica-600 text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-500 hover:text-mechanica-600 text-sm">
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
